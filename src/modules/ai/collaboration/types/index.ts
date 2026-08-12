export interface AiCollaboration {
  id: string;
  name: string;
  type: string; // SEQUENTIAL, PARALLEL, HIERARCHICAL, CONSENSUS, RESEARCH, STRATEGY, RISK_REVIEW, PORTFOLIO_REVIEW
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CollaborationSession {
  id: string;
  collaborationId: string;
  objective: string;
  status: string;
  startTime: Date;
  endTime: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CollaborationMember {
  id: string;
  sessionId: string;
  modelId: string;
  role: string; // COORDINATOR, RESEARCHER, ANALYST, REVIEWER, RISK_ADVISOR, MEMORY_ADVISOR, STRATEGY_ADVISOR, OBSERVER
  status: string;
  joinedAt: Date;
}

export interface CollaborationTask {
  id: string;
  sessionId: string;
  memberId: string | null;
  description: string;
  status: string;
  resultData: any;
  createdAt: Date;
  updatedAt: Date;
}

export interface CollaborationMessage {
  id: string;
  sessionId: string;
  senderMemberId: string | null;
  content: string;
  messageType: string;
  timestamp: Date;
}

export interface CollaborationResult {
  id: string;
  sessionId: string;
  finalRecommendation: string | null;
  supportingEvidence: any;
  participatingModels: any;
  executionTimeMs: number | null;
  cost: number | null;
  tokenUsage: any;
  consensusSummary: string | null;
  createdAt: Date;
}

export interface CollaborationConsensus {
  id: string;
  sessionId: string;
  agreementScore: number;
  conflictScore: number;
  confidence: number;
  majorityDecision: string | null;
  minorityOpinion: string | null;
  escalationRequired: boolean;
  createdAt: Date;
}

export interface CollaborationHistory {
  id: string;
  sessionId: string;
  action: string;
  details: any;
  timestamp: Date;
}
