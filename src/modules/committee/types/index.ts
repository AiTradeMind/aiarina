export interface EnterpriseCommitteeSession {
  id: string;
  aiModelId: string;
  workspaceId: string;
  candidateId: string;
  correlationId: string;
  status: 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  createdAt: Date;
}

export interface EnterpriseCommitteeMember {
  id: string;
  sessionId: string;
  role: 'PRIMARY_AI' | 'SECONDARY_AI' | 'RISK_REVIEWER' | 'MARKET_REVIEWER' | 'COMPLIANCE_REVIEWER' | 'HUMAN_OBSERVER';
  weight: number;
  vote: 'APPROVE' | 'REJECT' | 'HOLD' | 'ABSTAIN';
  status: 'PENDING' | 'READY';
  createdAt: Date;
}

export interface EnterpriseCommitteeVote {
  id: string;
  sessionId: string;
  memberId: string;
  role: string;
  vote: 'APPROVE' | 'REJECT' | 'HOLD' | 'ABSTAIN';
  weight: number;
  reason: string;
  createdAt: Date;
}

export interface EnterpriseCommitteeConsensus {
  id: string;
  sessionId: string;
  consensusScore: number; // 0 to 100
  approvalPercent: number; // 0.0 to 1.0
  conflictPercent: number; // 0.0 to 1.0
  confidence: number; // 0 to 100
  decisionStability: 'STABLE' | 'UNSTABLE' | 'MARGINAL';
  createdAt: Date;
}

export interface EnterpriseCommitteeDecision {
  id: string;
  sessionId: string;
  candidateId: string;
  status: 'APPROVED' | 'REJECTED' | 'ON_HOLD';
  reason: string;
  createdAt: Date;
}

export interface EnterpriseCommitteeCertificate {
  id: string;
  decisionId: string;
  consensusScore: number;
  sha256Hash: string;
  digitalSignature: string;
  createdAt: Date;
}

export interface EnterpriseCommitteeRuntime {
  id: string;
  sessionId: string;
  queueName: string;
  status: 'QUEUED' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  retryCount: number;
  timeoutMs: number;
  logs: string;
  startedAt?: Date;
  finishedAt?: Date;
}

export interface EnterpriseCommitteeEvent {
  id: string;
  sessionId: string;
  eventType: 'CommitteeStarted' | 'VotingStarted' | 'ConsensusCompleted' | 'DecisionApproved' | 'DecisionRejected' | 'DecisionHeld';
  payload: Record<string, any>;
  createdAt: Date;
}

export interface EnterpriseCommitteeAudit {
  id: string;
  sessionId: string;
  auditType: 'Voting' | 'Decision' | 'Consensus' | 'Certificate' | 'Runtime';
  hash: string;
  content: Record<string, any>;
  createdAt: Date;
}
