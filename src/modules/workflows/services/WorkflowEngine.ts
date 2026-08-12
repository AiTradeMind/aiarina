import { workflowRepository } from "../repositories/WorkflowRepository.ts";
import { approvalRepository } from "../repositories/ApprovalRepository.ts";
import { workflowValidator } from "./WorkflowValidator.ts";
import { workflowDispatcher } from "./WorkflowDispatcher.ts";
import { auditEngine } from "../../audit/services/AuditEngine.ts";
import {
  IWorkflowInstance,
  IWorkflowStep,
  StartWorkflowPayload,
  IStepDefinition
} from "../types/index.ts";

export class WorkflowEngine {
  /**
   * Starts a new workflow instance and initializes its steps.
   */
  public async startWorkflow(
    initiatorId: number,
    payload: StartWorkflowPayload
  ): Promise<IWorkflowInstance> {
    workflowValidator.validateStart(payload);

    let stepDefinitions: IStepDefinition[] = [];

    // 1. If starting from a template, fetch the steps from the template
    if (payload.templateId) {
      const template = await workflowRepository.getTemplate(payload.templateId);
      if (!template) {
        throw new Error(`Business Rule Error: Workflow template with ID ${payload.templateId} not found.`);
      }
      if (template.organizationId !== payload.organizationId) {
        throw new Error("Security Error: Tenant boundary violation. Cannot use a template from a different tenant.");
      }
      stepDefinitions = template.steps;
    } else if (payload.data?.steps) {
      // Allow dynamic workflow steps passed in data (ad-hoc workflows)
      stepDefinitions = payload.data.steps;
    }

    if (stepDefinitions.length === 0) {
      throw new Error("Business Rule Error: Cannot start a workflow without any steps defined.");
    }

    // 2. Create the workflow instance
    const instance = await workflowRepository.createInstance({
      ...payload,
      initiatorId,
      status: "PENDING_REVIEW",
    });

    // 3. Create individual workflow steps
    const createdSteps: IWorkflowStep[] = [];
    for (let i = 0; i < stepDefinitions.length; i++) {
      const def = stepDefinitions[i];
      const step = await workflowRepository.createStep({
        workflowInstanceId: instance.id,
        stepIndex: i,
        name: def.name,
        status: i === 0 ? "PENDING" : "PENDING", // Keep sequential step status as pending initially
        requiredRole: def.requiredRole || null,
        requiredPermission: def.requiredPermission || null,
        assignedUserId: null,
      });
      createdSteps.push(step);
    }

    // 4. Record history
    await workflowRepository.createHistory({
      workflowInstanceId: instance.id,
      action: "CREATE",
      actorId: initiatorId,
      stepIndex: null,
      comments: "Workflow process created.",
      data: { templateId: payload.templateId || null },
    });

    await workflowRepository.createHistory({
      workflowInstanceId: instance.id,
      action: "SUBMIT",
      actorId: initiatorId,
      stepIndex: 0,
      comments: "Workflow process submitted for active review.",
      data: {},
    });

    // 5. Initialize metrics
    await workflowRepository.createMetrics({
      workflowInstanceId: instance.id,
      executionDurationMs: 0,
      approvalLatencyMs: 0,
      escalationCount: 0,
      timeoutCount: 0,
    });

    // 6. Dispatch notification for the first pending step
    const firstStep = createdSteps[0];
    await workflowDispatcher.dispatchStepPending(initiatorId, instance, firstStep);
    
    // 7. Log to Audit Engine
    await auditEngine.logEvent({
      organizationId: instance.organizationId,
      workspaceId: instance.workspaceId || undefined,
      actorId: initiatorId,
      action: "WORKFLOW_STARTED",
      sourceModule: "WORKFLOW",
      resourceType: "WORKFLOW_INSTANCE",
      resourceId: instance.id.toString(),
      workflowId: instance.id,
      severity: "INFO",
      details: { name: instance.name, type: instance.type, templateId: instance.templateId }
    });

    return instance;
  }

  /**
   * Approves the active step of a workflow.
   */
  public async approveStep(
    userId: number,
    organizationId: string,
    instanceId: number,
    comments?: string
  ): Promise<IWorkflowInstance> {
    const instance = await workflowRepository.getInstance(instanceId);
    if (!instance) {
      throw new Error(`Business Rule Error: Workflow instance ${instanceId} not found.`);
    }

    const steps = await workflowRepository.getStepsForInstance(instanceId);
    const currentStep = steps.find((s) => s.stepIndex === instance.currentStepIndex);

    if (!currentStep) {
      throw new Error(`Business Rule Error: Active step at index ${instance.currentStepIndex} not found.`);
    }

    // 1. Rigorous RBAC, isolation, and state validation
    await workflowValidator.validateApproval(
      userId,
      organizationId,
      instance,
      currentStep,
      "APPROVED"
    );

    // 2. Persist approval decision
    await approvalRepository.createApproval({
      workflowInstanceId: instanceId,
      stepId: currentStep.id,
      approverId: userId,
      approverRole: currentStep.requiredRole,
      decision: "APPROVED",
      comments: comments || null,
    });

    // 3. Update current step to approved
    await workflowRepository.updateStep(currentStep.id, { status: "APPROVED" });

    // 4. Record history
    await workflowRepository.createHistory({
      workflowInstanceId: instanceId,
      action: "APPROVE",
      actorId: userId,
      stepIndex: currentStep.stepIndex,
      comments: comments || "Step approved.",
      data: { stepId: currentStep.id, stepName: currentStep.name },
    });

    // Dispatch step approved notification
    await workflowDispatcher.dispatchStepApproved(userId, instance, currentStep, comments);

    let updatedInstance = instance;

    // 5. State Machine Progression
    if (instance.type === "SEQUENTIAL") {
      const nextStepIndex = instance.currentStepIndex + 1;
      if (nextStepIndex < steps.length) {
        // Progress to next step
        updatedInstance = await workflowRepository.updateInstance(instanceId, {
          currentStepIndex: nextStepIndex,
        });

        const nextStep = steps.find((s) => s.stepIndex === nextStepIndex)!;
        await workflowDispatcher.dispatchStepPending(userId, updatedInstance, nextStep);
      } else {
        // Complete the entire sequential workflow
        updatedInstance = await workflowRepository.updateInstance(instanceId, {
          status: "COMPLETED",
        });

        // Compute metrics
        const duration = Date.now() - new Date(instance.createdAt).getTime();
        await workflowRepository.updateMetrics(instanceId, {
          executionDurationMs: duration,
        });

        await workflowDispatcher.dispatchWorkflowCompleted(userId, updatedInstance);
      }
    } else if (instance.type === "PARALLEL") {
      // In parallel workflow, all steps must be approved to complete
      const allApproved = steps.every(
        (s) => s.id === currentStep.id ? true : s.status === "APPROVED"
      );

      if (allApproved) {
        updatedInstance = await workflowRepository.updateInstance(instanceId, {
          status: "COMPLETED",
        });

        const duration = Date.now() - new Date(instance.createdAt).getTime();
        await workflowRepository.updateMetrics(instanceId, {
          executionDurationMs: duration,
        });

        await workflowDispatcher.dispatchWorkflowCompleted(userId, updatedInstance);
      }
    }

    return updatedInstance;
  }

  /**
   * Rejects a workflow step (and rejects the whole instance).
   */
  public async rejectStep(
    userId: number,
    organizationId: string,
    instanceId: number,
    comments?: string
  ): Promise<IWorkflowInstance> {
    const instance = await workflowRepository.getInstance(instanceId);
    if (!instance) {
      throw new Error(`Business Rule Error: Workflow instance ${instanceId} not found.`);
    }

    const steps = await workflowRepository.getStepsForInstance(instanceId);
    const currentStep = steps.find((s) => s.stepIndex === instance.currentStepIndex);

    if (!currentStep) {
      throw new Error(`Business Rule Error: Active step at index ${instance.currentStepIndex} not found.`);
    }

    // 1. Validation
    await workflowValidator.validateApproval(
      userId,
      organizationId,
      instance,
      currentStep,
      "REJECTED"
    );

    // 2. Save approval decision
    await approvalRepository.createApproval({
      workflowInstanceId: instanceId,
      stepId: currentStep.id,
      approverId: userId,
      approverRole: currentStep.requiredRole,
      decision: "REJECTED",
      comments: comments || null,
    });

    // 3. Mark step and instance rejected
    await workflowRepository.updateStep(currentStep.id, { status: "REJECTED" });
    const updatedInstance = await workflowRepository.updateInstance(instanceId, {
      status: "REJECTED",
    });

    // 4. Record history
    await workflowRepository.createHistory({
      workflowInstanceId: instanceId,
      action: "REJECT",
      actorId: userId,
      stepIndex: currentStep.stepIndex,
      comments: comments || "Step rejected, entire workflow rejected.",
      data: { stepId: currentStep.id, stepName: currentStep.name },
    });

    // Update metrics duration
    const duration = Date.now() - new Date(instance.createdAt).getTime();
    await workflowRepository.updateMetrics(instanceId, {
      executionDurationMs: duration,
    });

    // 5. Dispatch notification
    await workflowDispatcher.dispatchWorkflowRejected(userId, updatedInstance, currentStep, comments);

    return updatedInstance;
  }

  /**
   * Returns a step for correction.
   */
  public async returnStep(
    userId: number,
    organizationId: string,
    instanceId: number,
    comments?: string
  ): Promise<IWorkflowInstance> {
    const instance = await workflowRepository.getInstance(instanceId);
    if (!instance) {
      throw new Error(`Business Rule Error: Workflow instance ${instanceId} not found.`);
    }

    const steps = await workflowRepository.getStepsForInstance(instanceId);
    const currentStep = steps.find((s) => s.stepIndex === instance.currentStepIndex);

    if (!currentStep) {
      throw new Error(`Business Rule Error: Active step at index ${instance.currentStepIndex} not found.`);
    }

    // 1. Validation
    await workflowValidator.validateApproval(
      userId,
      organizationId,
      instance,
      currentStep,
      "RETURNED"
    );

    // 2. Save approval decision
    await approvalRepository.createApproval({
      workflowInstanceId: instanceId,
      stepId: currentStep.id,
      approverId: userId,
      approverRole: currentStep.requiredRole,
      decision: "RETURNED",
      comments: comments || null,
    });

    // 3. Update step and instance to RETURNED
    const updatedInstance = await workflowRepository.updateInstance(instanceId, {
      status: "RETURNED",
    });

    // 4. Record history
    await workflowRepository.createHistory({
      workflowInstanceId: instanceId,
      action: "RETURN",
      actorId: userId,
      stepIndex: currentStep.stepIndex,
      comments: comments || "Workflow returned for correction.",
      data: { stepId: currentStep.id, stepName: currentStep.name },
    });

    // 5. Dispatch notification
    await workflowDispatcher.dispatchWorkflowReturned(userId, updatedInstance, currentStep, comments);

    return updatedInstance;
  }

  /**
   * Cancels a workflow process.
   */
  public async cancelWorkflow(
    userId: number,
    organizationId: string,
    instanceId: number,
    comments?: string
  ): Promise<IWorkflowInstance> {
    const instance = await workflowRepository.getInstance(instanceId);
    if (!instance) {
      throw new Error(`Business Rule Error: Workflow instance ${instanceId} not found.`);
    }

    // Tenant Check
    if (instance.organizationId !== organizationId) {
      throw new Error("Security Error: Tenant isolation violation. Cannot cancel another tenant's workflow.");
    }

    if (["COMPLETED", "APPROVED", "REJECTED", "CANCELLED"].includes(instance.status)) {
      throw new Error(`Business Rule Error: Cannot cancel a workflow that is already in '${instance.status}' status.`);
    }

    // Cancel instance
    const updatedInstance = await workflowRepository.updateInstance(instanceId, {
      status: "CANCELLED",
    });

    // Record history
    await workflowRepository.createHistory({
      workflowInstanceId: instanceId,
      action: "CANCEL",
      actorId: userId,
      stepIndex: instance.currentStepIndex,
      comments: comments || "Workflow process cancelled.",
      data: {},
    });

    // Dispatch
    await workflowDispatcher.dispatchWorkflowCancelled(userId, updatedInstance, comments);

    return updatedInstance;
  }

  /**
   * Escalates a step to another role or target.
   */
  public async escalateStep(
    userId: number,
    organizationId: string,
    instanceId: number,
    escalatedRole: string,
    reason: string
  ): Promise<IWorkflowStep> {
    const instance = await workflowRepository.getInstance(instanceId);
    if (!instance) {
      throw new Error(`Business Rule Error: Workflow instance ${instanceId} not found.`);
    }

    // Tenant check
    if (instance.organizationId !== organizationId) {
      throw new Error("Security Error: Tenant isolation violation. Cannot escalate another tenant's workflow.");
    }

    const steps = await workflowRepository.getStepsForInstance(instanceId);
    const currentStep = steps.find((s) => s.stepIndex === instance.currentStepIndex);

    if (!currentStep) {
      throw new Error(`Business Rule Error: Active step at index ${instance.currentStepIndex} not found.`);
    }

    // Update step role
    const updatedStep = await workflowRepository.updateStep(currentStep.id, {
      requiredRole: escalatedRole,
    });

    // Increment metrics escalation count
    const metrics = await workflowRepository.getMetrics(instanceId);
    if (metrics) {
      await workflowRepository.updateMetrics(instanceId, {
        escalationCount: metrics.escalationCount + 1,
      });
    }

    // History log
    await workflowRepository.createHistory({
      workflowInstanceId: instanceId,
      action: "ESCALATE",
      actorId: userId,
      stepIndex: currentStep.stepIndex,
      comments: `Step escalated to role: ${escalatedRole}. Reason: ${reason}`,
      data: { oldRole: currentStep.requiredRole, newRole: escalatedRole },
    });

    // Dispatch
    await workflowDispatcher.dispatchEscalated(userId, instance, updatedStep, reason);

    return updatedStep;
  }

  /**
   * Delegates a step to a specific user.
   */
  public async delegateStep(
    userId: number,
    organizationId: string,
    instanceId: number,
    delegateUserId: number,
    comments?: string
  ): Promise<IWorkflowStep> {
    const instance = await workflowRepository.getInstance(instanceId);
    if (!instance) {
      throw new Error(`Business Rule Error: Workflow instance ${instanceId} not found.`);
    }

    // Tenant Check
    if (instance.organizationId !== organizationId) {
      throw new Error("Security Error: Tenant isolation violation. Cannot delegate another tenant's workflow.");
    }

    const steps = await workflowRepository.getStepsForInstance(instanceId);
    const currentStep = steps.find((s) => s.stepIndex === instance.currentStepIndex);

    if (!currentStep) {
      throw new Error(`Business Rule Error: Active step at index ${instance.currentStepIndex} not found.`);
    }

    // Update step assigned user
    const updatedStep = await workflowRepository.updateStep(currentStep.id, {
      assignedUserId: delegateUserId,
    });

    // History log
    await workflowRepository.createHistory({
      workflowInstanceId: instanceId,
      action: "DELEGATE",
      actorId: userId,
      stepIndex: currentStep.stepIndex,
      comments: comments || `Step delegated to user ID: ${delegateUserId}`,
      data: { delegateUserId },
    });

    // Dispatch
    await workflowDispatcher.dispatchDelegated(userId, instance, updatedStep, delegateUserId, comments);

    return updatedStep;
  }

  /**
   * Processes steps timeout rules. Can auto-approve or auto-reject depending on step definitions.
   */
  public async processStepTimeout(
    instanceId: number,
    stepIndex: number
  ): Promise<IWorkflowInstance> {
    const instance = await workflowRepository.getInstance(instanceId);
    if (!instance) {
      throw new Error("Workflow instance not found.");
    }

    const steps = await workflowRepository.getStepsForInstance(instanceId);
    const step = steps.find((s) => s.stepIndex === stepIndex);

    if (!step || step.status !== "PENDING") {
      return instance; // No pending step to time out
    }

    // Let's get template step rules if available
    let autoApprove = false;
    let autoReject = false;

    if (instance.templateId) {
      const template = await workflowRepository.getTemplate(instance.templateId);
      if (template) {
        const stepDef = template.steps[stepIndex];
        if (stepDef) {
          if (stepDef.autoApproveAfterHours) {
            autoApprove = true;
          } else if (stepDef.timeoutHours) {
            autoReject = true;
          }
        }
      }
    }

    const metrics = await workflowRepository.getMetrics(instanceId);
    if (metrics) {
      await workflowRepository.updateMetrics(instanceId, {
        timeoutCount: metrics.timeoutCount + 1,
      });
    }

    if (autoApprove) {
      // Auto approve
      await workflowRepository.createHistory({
        workflowInstanceId: instanceId,
        action: "TIMEOUT_AUTO_APPROVE",
        actorId: instance.initiatorId,
        stepIndex: stepIndex,
        comments: `Step ${step.name} auto-approved due to inactivity timeout rule.`,
        data: {},
      });

      // Execute approval logic on behalf of system
      return await this.approveStep(
        instance.initiatorId,
        instance.organizationId,
        instanceId,
        "Auto-approved by timeout rule."
      );
    } else if (autoReject) {
      // Auto reject
      await workflowRepository.createHistory({
        workflowInstanceId: instanceId,
        action: "TIMEOUT_AUTO_REJECT",
        actorId: instance.initiatorId,
        stepIndex: stepIndex,
        comments: `Step ${step.name} auto-rejected due to inactivity timeout rule.`,
        data: {},
      });

      return await this.rejectStep(
        instance.initiatorId,
        instance.organizationId,
        instanceId,
        "Auto-rejected by timeout rule."
      );
    }

    return instance;
  }
}

export const workflowEngine = new WorkflowEngine();
