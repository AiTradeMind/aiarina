import { eq, and, desc, asc } from "drizzle-orm";
import { getDb } from "../../../db/client.ts";
import { workflowApprovals } from "../../../db/schema.ts";
import { IWorkflowApproval } from "../types/index.ts";

export class ApprovalRepository {
  public async createApproval(approval: Omit<IWorkflowApproval, "id" | "createdAt">): Promise<IWorkflowApproval> {
    const db = getDb();
    const [inserted] = await db
      .insert(workflowApprovals)
      .values({
        workflowInstanceId: approval.workflowInstanceId,
        stepId: approval.stepId,
        approverId: approval.approverId,
        approverRole: approval.approverRole,
        decision: approval.decision,
        comments: approval.comments,
      })
      .returning();

    return inserted as any;
  }

  public async getApprovalsForInstance(instanceId: number): Promise<IWorkflowApproval[]> {
    const db = getDb();
    const results = await db
      .select()
      .from(workflowApprovals)
      .where(eq(workflowApprovals.workflowInstanceId, instanceId))
      .orderBy(asc(workflowApprovals.createdAt));

    return results as any[];
  }

  public async getApprovalsForStep(stepId: number): Promise<IWorkflowApproval[]> {
    const db = getDb();
    const results = await db
      .select()
      .from(workflowApprovals)
      .where(eq(workflowApprovals.stepId, stepId))
      .orderBy(asc(workflowApprovals.createdAt));

    return results as any[];
  }
}

export const approvalRepository = new ApprovalRepository();
