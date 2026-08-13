import {
  DecisionTypeValue,
  DecisionStatusValue,
  DecisionConfidenceValue,
  DecisionPriorityValue,
  DecisionPipelineStageValue,
} from "../constants/index.ts";

export interface DecisionRecord {
  id?: number;
  decisionId: string;
  contextId?: string | null;
  symbol?: string | null;
  decisionType: DecisionTypeValue;
  status: DecisionStatusValue;
  confidence: DecisionConfidenceValue;
  confidenceScore: number;
  riskScore: number;
  priority: DecisionPriorityValue;
  reasoningSummary: string;
  supportingEvidence: any[];
  knowledgeReferences: any[];
  policyReferences: any[];
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface EvaluateDecisionDTO {
  contextId?: string;
  brainContext?: Record<string, any>;
  brainKnowledge?: any[];
  brainMemory?: any[];
  researchEvidence?: any[];
  symbol?: string;
  userOverrideType?: DecisionTypeValue;
  customInputs?: Record<string, any>;
  operator?: string;
}

export interface QueryDecisionDTO {
  decisionId?: string;
  decisionType?: DecisionTypeValue;
  status?: DecisionStatusValue;
  confidence?: DecisionConfidenceValue;
  symbol?: string;
  limit?: number;
  offset?: number;
}

export interface DecisionContextRecord {
  id?: number;
  contextRecordId: string;
  decisionId: string;
  brainContextId?: string | null;
  snapshot: Record<string, any>;
  createdAt: Date;
}

export interface DecisionEvidenceRecord {
  id?: number;
  evidenceId: string;
  decisionId: string;
  evidenceType: string;
  source?: string | null;
  content?: string | null;
  score: number;
  createdAt: Date;
}

export interface DecisionHistoryRecord {
  id?: number;
  historyId: string;
  decisionId: string;
  fromStatus?: string | null;
  toStatus: string;
  changedBy: string;
  reason?: string | null;
  createdAt: Date;
}

export interface DecisionPipelineStageHistory {
  stage: DecisionPipelineStageValue;
  timestamp: Date;
  durationMs: number;
  status: "SUCCESS" | "WARNING" | "FAILED";
  details?: string;
}

export interface DecisionPipelineRunRecord {
  runId: string;
  decisionId: string;
  currentStage: DecisionPipelineStageValue;
  executionTimeMs: number;
  failureReason?: string | null;
  stageHistory: DecisionPipelineStageHistory[];
  createdAt: Date;
}

export interface DecisionHealthStatus {
  status: "HEALTHY" | "DEGRADED" | "CRITICAL";
  totalDecisionsCount: number;
  activeEvaluationsCount: number;
  approvedCount: number;
  rejectedCount: number;
  pipelineHealth: "HEALTHY" | "DEGRADED" | "CRITICAL";
  checkTimestamp: Date;
  details: {
    databaseConnected: boolean;
    constitutionPolicyCompliant: boolean;
    brainIntegrationActive: boolean;
  };
}

export interface DecisionSummary {
  totalDecisions: number;
  typeDistribution: Record<string, number>;
  statusDistribution: Record<string, number>;
  confidenceDistribution: Record<string, number>;
  averageConfidenceScore: number;
  averageRiskScore: number;
  lastUpdated: Date;
}
