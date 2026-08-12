export interface GovernanceSession {
  id?: number;
  userId?: number;
  organizationId?: string;
  requestPayload: any;
  responsePayload: any;
  status: 'APPROVED' | 'REJECTED' | 'ESCALATED' | 'PENDING';
  policyCheckStatus: 'PASSED' | 'FAILED';
  safetyCheckStatus: 'PASSED' | 'FAILED';
  governanceLatencyMs: number;
  auditHash: string;
  createdAt?: Date;
}

export interface PolicyViolation {
  id?: number;
  sessionId?: number;
  policyName: string;
  policyType: 'CONSTITUTION' | 'RISK' | 'COMPLIANCE' | 'PROVIDER' | 'BUSINESS';
  violationDetails: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  createdAt?: Date;
}

export interface SafetyReport {
  id?: number;
  sessionId?: number;
  modelId?: string;
  promptRiskScore: number;
  outputRiskScore: number;
  riskFlags: string[];
  scannerLogs: string;
  createdAt?: Date;
}

export interface ExplainabilityRecord {
  id?: number;
  sessionId?: number;
  evidenceTrace: any[];
  reasoningTrace: any[];
  confidenceExplanation: string;
  decisionFactors: any[];
  riskFactors: any[];
  alternativeViews: any[];
  minorityOpinion?: string;
  modelContributions: Record<string, number>;
  createdAt?: Date;
}

export interface ComplianceRecord {
  id?: number;
  sessionId?: number;
  complianceScore: number;
  policyCompliance: boolean;
  ruleCompliance: boolean;
  evidenceCompleteness: boolean;
  researchCompleteness: boolean;
  explainabilityCompleteness: boolean;
  confidenceValidation: boolean;
  createdAt?: Date;
}

export interface HumanReview {
  id?: number;
  sessionId?: number;
  reviewerId?: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'ESCALATED';
  reviewerNotes?: string;
  escalationReason?: string;
  decisionOverride: boolean;
  approvalHistory: any[];
  reviewedAt?: Date;
  createdAt?: Date;
}

export interface GovernanceMetrics {
  id?: number;
  timestamp?: Date;
  policyViolationsCount: number;
  safetyViolationsCount: number;
  governanceLatencyAvg: number;
  reviewQueueSize: number;
  approvalTimeAvg: number;
  auditVolume: number;
  explainabilityCoverage: number;
  complianceScoreAvg: number;
}

export interface AuditReplayRecord {
  id?: number;
  originalSessionId: number;
  replayTriggeredBy?: number;
  replayStatus: 'COMPLETED' | 'FAILED';
  discrepancyDetected: boolean;
  originalHash: string;
  replayHash: string;
  notes?: string;
  createdAt?: Date;
}
