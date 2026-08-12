import logger from '../../../lib/logger';

export interface ApprovalRequest {
  id: string;
  type: 'RELEASE' | 'CONFIGURATION' | 'BACKUP' | 'MAINTENANCE' | 'EMERGENCY' | 'AUDIT';
  title: string;
  requestedBy: string;
  payload: any;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: Date;
  reviewedAt?: Date;
  reviewedBy?: string;
}

export class ApprovalCenterEngine {
  private static instance: ApprovalCenterEngine;
  private approvals: Map<string, ApprovalRequest> = new Map();

  private constructor() {
    this.seedApprovals();
  }

  public static getInstance(): ApprovalCenterEngine {
    if (!ApprovalCenterEngine.instance) {
      ApprovalCenterEngine.instance = new ApprovalCenterEngine();
    }
    return ApprovalCenterEngine.instance;
  }

  private seedApprovals(): void {
    const id = 'appr_001';
    this.approvals.set(id, {
      id,
      type: 'RELEASE',
      title: 'Deploy Phase 16 Enterprise Production Control Plane',
      requestedBy: 'release-manager@arinasys.internal',
      payload: { version: '1.16.0', target: 'Production' },
      status: 'PENDING',
      createdAt: new Date()
    });
  }

  public getApprovals(): ApprovalRequest[] {
    return Array.from(this.approvals.values());
  }

  public createApproval(type: any, title: string, requestedBy: string, payload: any): ApprovalRequest {
    const id = `appr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const req: ApprovalRequest = {
      id,
      type,
      title,
      requestedBy,
      payload,
      status: 'PENDING',
      createdAt: new Date()
    };
    this.approvals.set(id, req);
    logger.info({ approvalId: id, type, title }, 'Approval request created');
    return req;
  }

  public reviewApproval(id: string, approved: boolean, reviewer: string): void {
    const req = this.approvals.get(id);
    if (!req) throw new Error(`Approval request not found: ${id}`);
    req.status = approved ? 'APPROVED' : 'REJECTED';
    req.reviewedAt = new Date();
    req.reviewedBy = reviewer;
    logger.info({ approvalId: id, status: req.status, reviewer }, 'Approval request reviewed');
  }
}
