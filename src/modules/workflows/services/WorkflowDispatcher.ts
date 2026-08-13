import { eventEngine } from "../../notifications/services/EventEngine.ts";
import { IWorkflowInstance, IWorkflowStep } from "../types/index.ts";

export class WorkflowDispatcher {
  /**
   * Publishes an event when a workflow step becomes pending.
   */
  public async dispatchStepPending(
    actorId: number,
    instance: IWorkflowInstance,
    step: IWorkflowStep
  ): Promise<void> {
    try {
      await eventEngine.publishEvent(actorId, {
        type: "workflow.step_pending",
        category: "GOVERNANCE",
        organizationId: instance.organizationId,
        workspaceId: instance.workspaceId,
        data: {
          title: `Approval Required: ${instance.name}`,
          message: `Step '${step.name}' is now pending review. Required Role: ${step.requiredRole || "None"}, Required Permission: ${step.requiredPermission || "None"}.`,
          priority: "HIGH",
          workflowId: instance.id,
          stepId: step.id,
          stepIndex: step.stepIndex,
          requiredRole: step.requiredRole,
          requiredPermission: step.requiredPermission,
        },
      });
    } catch (err: any) {
      console.error("WorkflowDispatcher error (step_pending):", err.message);
    }
  }

  /**
   * Publishes an event when a workflow step is approved.
   */
  public async dispatchStepApproved(
    actorId: number,
    instance: IWorkflowInstance,
    step: IWorkflowStep,
    comments?: string
  ): Promise<void> {
    try {
      await eventEngine.publishEvent(actorId, {
        type: "workflow.step_approved",
        category: "GOVERNANCE",
        organizationId: instance.organizationId,
        workspaceId: instance.workspaceId,
        data: {
          title: `Step Approved: ${instance.name}`,
          message: `Step '${step.name}' has been approved by actor #${actorId}.${comments ? ` Comments: ${comments}` : ""}`,
          priority: "MEDIUM",
          workflowId: instance.id,
          stepId: step.id,
          stepIndex: step.stepIndex,
        },
      });
    } catch (err: any) {
      console.error("WorkflowDispatcher error (step_approved):", err.message);
    }
  }

  /**
   * Publishes an event when a workflow completes successfully.
   */
  public async dispatchWorkflowCompleted(
    actorId: number,
    instance: IWorkflowInstance
  ): Promise<void> {
    try {
      await eventEngine.publishEvent(actorId, {
        type: "workflow.completed",
        category: "GOVERNANCE",
        organizationId: instance.organizationId,
        workspaceId: instance.workspaceId,
        data: {
          title: `Workflow Completed: ${instance.name}`,
          message: `The business workflow process '${instance.name}' has been fully completed and approved.`,
          priority: "CRITICAL",
          workflowId: instance.id,
        },
      });
    } catch (err: any) {
      console.error("WorkflowDispatcher error (workflow_completed):", err.message);
    }
  }

  /**
   * Publishes an event when a workflow is rejected.
   */
  public async dispatchWorkflowRejected(
    actorId: number,
    instance: IWorkflowInstance,
    step: IWorkflowStep,
    comments?: string
  ): Promise<void> {
    try {
      await eventEngine.publishEvent(actorId, {
        type: "workflow.rejected",
        category: "GOVERNANCE",
        organizationId: instance.organizationId,
        workspaceId: instance.workspaceId,
        data: {
          title: `Workflow Rejected: ${instance.name}`,
          message: `The workflow has been rejected at step '${step.name}' by actor #${actorId}.${comments ? ` Reason: ${comments}` : ""}`,
          priority: "HIGH",
          workflowId: instance.id,
          stepId: step.id,
          stepIndex: step.stepIndex,
        },
      });
    } catch (err: any) {
      console.error("WorkflowDispatcher error (workflow_rejected):", err.message);
    }
  }

  /**
   * Publishes an event when a workflow is returned for correction.
   */
  public async dispatchWorkflowReturned(
    actorId: number,
    instance: IWorkflowInstance,
    step: IWorkflowStep,
    comments?: string
  ): Promise<void> {
    try {
      await eventEngine.publishEvent(actorId, {
        type: "workflow.returned",
        category: "GOVERNANCE",
        organizationId: instance.organizationId,
        workspaceId: instance.workspaceId,
        data: {
          title: `Workflow Returned: ${instance.name}`,
          message: `The workflow has been returned for review/correction at step '${step.name}' by actor #${actorId}.${comments ? ` Comments: ${comments}` : ""}`,
          priority: "MEDIUM",
          workflowId: instance.id,
          stepId: step.id,
          stepIndex: step.stepIndex,
        },
      });
    } catch (err: any) {
      console.error("WorkflowDispatcher error (workflow_returned):", err.message);
    }
  }

  /**
   * Publishes an event when a workflow is cancelled.
   */
  public async dispatchWorkflowCancelled(
    actorId: number,
    instance: IWorkflowInstance,
    comments?: string
  ): Promise<void> {
    try {
      await eventEngine.publishEvent(actorId, {
        type: "workflow.cancelled",
        category: "GOVERNANCE",
        organizationId: instance.organizationId,
        workspaceId: instance.workspaceId,
        data: {
          title: `Workflow Cancelled: ${instance.name}`,
          message: `The workflow process was cancelled by actor #${actorId}.${comments ? ` Reason: ${comments}` : ""}`,
          priority: "LOW",
          workflowId: instance.id,
        },
      });
    } catch (err: any) {
      console.error("WorkflowDispatcher error (workflow_cancelled):", err.message);
    }
  }

  /**
   * Publishes an event when an escalation is triggered.
   */
  public async dispatchEscalated(
    actorId: number,
    instance: IWorkflowInstance,
    step: IWorkflowStep,
    reason: string
  ): Promise<void> {
    try {
      await eventEngine.publishEvent(actorId, {
        type: "workflow.escalated",
        category: "GOVERNANCE",
        organizationId: instance.organizationId,
        workspaceId: instance.workspaceId,
        data: {
          title: `Workflow Escalated: ${instance.name}`,
          message: `Step '${step.name}' has been escalated. Reason: ${reason}`,
          priority: "HIGH",
          workflowId: instance.id,
          stepId: step.id,
          stepIndex: step.stepIndex,
        },
      });
    } catch (err: any) {
      console.error("WorkflowDispatcher error (workflow_escalated):", err.message);
    }
  }

  /**
   * Publishes an event when delegation is triggered.
   */
  public async dispatchDelegated(
    actorId: number,
    instance: IWorkflowInstance,
    step: IWorkflowStep,
    delegateUserId: number,
    comments?: string
  ): Promise<void> {
    try {
      await eventEngine.publishEvent(actorId, {
        type: "workflow.delegated",
        category: "GOVERNANCE",
        organizationId: instance.organizationId,
        workspaceId: instance.workspaceId,
        data: {
          title: `Workflow Delegated: ${instance.name}`,
          message: `Step '${step.name}' has been delegated to user #${delegateUserId} by actor #${actorId}.${comments ? ` comments: ${comments}` : ""}`,
          priority: "MEDIUM",
          workflowId: instance.id,
          stepId: step.id,
          stepIndex: step.stepIndex,
          delegateUserId,
        },
      });
    } catch (err: any) {
      console.error("WorkflowDispatcher error (workflow_delegated):", err.message);
    }
  }
}

export const workflowDispatcher = new WorkflowDispatcher();
