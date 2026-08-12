export interface StrategyGovernance {
  id: string;
  strategyId: string;
  status: 'Draft' | 'Pending_Review' | 'Approved' | 'Rejected' | 'Published' | 'Archived';
  riskLevel: string | null;
  governanceScore: number;
  isCompliant: boolean;
  lastReviewDate: Date | null;
  updatedBy: string | null;
  updatedTime: Date;
}

export interface StrategyPolicy {
  id: string;
  code: string;
  name: string;
  description: string | null;
  isActive: boolean;
  minThreshold: number | null;
  maxThreshold: number | null;
  severity: 'Critical' | 'Warning' | 'Info';
  createdTime: Date;
}

export interface StrategyPolicyRule {
  id: string;
  policyId: string;
  ruleName: string;
  operator: string;
  targetValue: string | null;
  errorMessage: string | null;
}

export interface StrategyPermission {
  id: string;
  strategyId: string;
  userEmail: string;
  role: string;
  canEdit: boolean;
  canRun: boolean;
  canApprove: boolean;
  grantedBy: string | null;
  grantedTime: Date;
}

export interface StrategyApproval {
  id: string;
  strategyId: string;
  version: string | null;
  status: 'Approved' | 'Rejected' | 'Abstained';
  reviewerEmail: string;
  reviewerRole: string | null;
  comments: string | null;
  decisionTime: Date;
}

export interface StrategyReviewRequest {
  id: string;
  strategyId: string;
  requestedBy: string;
  assigneeEmail: string | null;
  status: 'Open' | 'In_Progress' | 'Completed' | 'Cancelled';
  notes: string | null;
  requestedTime: Date;
  completedTime: Date | null;
}

export interface StrategyReviewHistory {
  id: string;
  requestId: string;
  strategyId: string;
  reviewerEmail: string;
  reviewNotes: string | null;
  scoreAwarded: number;
  decision: 'Approved' | 'Rejected' | 'Request_Changes';
  timestamp: Date;
}

export interface StrategyCompliance {
  id: string;
  strategyId: string;
  policyId: string;
  status: 'Compliant' | 'Non_Compliant' | 'Waived';
  measuredValue: number | null;
  targetValue: number | null;
  checkTime: Date;
  details: string | null;
}

export interface StrategyAuditLog {
  id: string;
  strategyId: string | null;
  action: string;
  performedBy: string;
  ipAddress: string | null;
  originalState: string | null;
  newState: string | null;
  timestamp: Date;
}

export interface StrategyGovernanceHistory {
  id: string;
  strategyId: string;
  previousStatus: string | null;
  newStatus: string;
  reason: string | null;
  changedBy: string | null;
  timestamp: Date;
}
