import { workflowEngine } from "./WorkflowEngine.ts";
import { IWorkflowInstance, IWorkflowStep } from "../types/index.ts";

export class ApprovalEngine {
  /**
   * Processes a structured approval decision (APPROVE, REJECT, or RETURN).
   */
  public async processDecision(
    userId: number,
    organizationId: string,
    instanceId: number,
    decision: "APPROVED" | "REJECTED" | "RETURNED",
    comments?: string
  ): Promise<IWorkflowInstance> {
    switch (decision) {
      case "APPROVED":
        return await workflowEngine.approveStep(userId, organizationId, instanceId, comments);
      case "REJECTED":
        return await workflowEngine.rejectStep(userId, organizationId, instanceId, comments);
      case "RETURNED":
        return await workflowEngine.returnStep(userId, organizationId, instanceId, comments);
      default:
        throw new Error(`Business Rule Error: Unsupported approval decision '${decision}'.`);
    }
  }

  /**
   * Delegates a step to a specific target user.
   */
  public async delegate(
    userId: number,
    organizationId: string,
    instanceId: number,
    delegateUserId: number,
    comments?: string
  ): Promise<IWorkflowStep> {
    return await workflowEngine.delegateStep(userId, organizationId, instanceId, delegateUserId, comments);
  }

  /**
   * Escalates a step's review requirements to a superior role.
   */
  public async escalate(
    userId: number,
    organizationId: string,
    instanceId: number,
    escalatedRole: string,
    reason: string
  ): Promise<IWorkflowStep> {
    return await workflowEngine.escalateStep(userId, organizationId, instanceId, escalatedRole, reason);
  }
}

export const approvalEngine = new ApprovalEngine();
