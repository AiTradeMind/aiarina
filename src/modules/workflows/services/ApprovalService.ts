import { approvalRepository } from "../repositories/ApprovalRepository.ts";
import { IWorkflowApproval } from "../types/index.ts";

export class ApprovalService {
  public async getApprovalsForInstance(instanceId: number): Promise<IWorkflowApproval[]> {
    return await approvalRepository.getApprovalsForInstance(instanceId);
  }

  public async getApprovalsForStep(stepId: number): Promise<IWorkflowApproval[]> {
    return await approvalRepository.getApprovalsForStep(stepId);
  }
}

export const approvalService = new ApprovalService();
