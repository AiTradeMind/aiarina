// Legacy Strategy Types
export type StrategyType = 'PRE_TRADE_ALLOCATION' | 'LIQUIDITY_PROFILER' | 'SENTIMENT_ARBITRAGE' | string;
export type StrategyExecutionAction = 'ALLOW' | 'REJECT' | 'REVIEW';

export interface Strategy {
  id: number;
  name: string;
  type: StrategyType;
  isActive: boolean;
  priority: number;
  confidenceThreshold: string;
  organizationId: string;
  config: any;
  createdAt: string;
  updatedAt: string;
}

export interface StrategyVersion {
  id: number;
  strategyId: number;
  version: string;
  changelog: string;
  createdAt: string;
}

export interface StrategyRule {
  id: number;
  strategyId: number;
  name: string;
  condition: string;
  action: StrategyExecutionAction;
  isActive: boolean;
  priority: number;
}

export interface StrategyExecution {
  id: number;
  strategyId: number | null;
  organizationId: string;
  decisionId: number | null;
  inputData: any;
  outputAction: StrategyExecutionAction;
  rationale: string;
  latencyMs: number;
  createdAt: string;
}

export interface StrategyResult {
  id: number;
  executionId: number;
  timestamp: string;
  pnl: string;
  success: boolean;
  metrics: any;
}

export interface EvaluateStrategyRequest {
  type: StrategyType;
  input: {
    ticker?: string;
    side?: 'BUY' | 'SELL';
    quantity?: string;
    confidence?: string;
    [key: string]: any;
  };
  userId: number;
  decisionId?: number;
}


// EP08 - New Enterprise Strategy Types
export interface EnterpriseStrategyRegistry {
  id: string;
  name: string;
  category: string; // e.g., Trend Following, Breakout, etc.
  version: string;
  owner: string;
  status: 'ENABLED' | 'DISABLED';
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface EnterpriseStrategyLibraryItem {
  id: string;
  name: string;
  description: string;
  category: string;
  isEnabled: boolean;
  rules: string[];
}

export interface EnterpriseStrategyParameters {
  id: string;
  strategyId: string;
  version: string;
  riskProfile: string; // conservative, moderate, aggressive
  timeframe: string; // 15m, 1h, 1d
  volumeRules: Record<string, any>;
  liquidityRules: Record<string, any>;
  volatilityRules: Record<string, any>;
  trendRules: Record<string, any>;
  sessionRules: Record<string, any>;
  marketConditions: string[];
  createdAt: Date;
}

export interface EnterpriseStrategyEvaluation {
  id: string;
  strategyId: string;
  sessionId: string; // EP07 Session Reference
  score: number; // 0 to 100
  marketStatusValid: boolean;
  contextValid: boolean;
  reasoningValid: boolean;
  confidenceValid: boolean;
  evaluationDetails: Record<string, any>;
  createdAt: Date;
}

export interface EnterpriseStrategyRanking {
  id: string;
  strategyId: string;
  score: number;
  confidence: number;
  suitability: string; // HIGH, MEDIUM, LOW
  priority: number;
  rankOrder: number;
  createdAt: Date;
}

export interface EnterpriseStrategyCandidate {
  id: string;
  strategyId: string;
  aiModelId: string; // EP07 Model Id
  instrument: string; // Symbol
  direction: 'LONG' | 'SHORT' | 'NEUTRAL';
  confidence: number;
  reasoningRef: string; // Ref to EP07 Reasoning id
  status: 'PENDING_COMMITTEE_DECISION' | 'APPROVED' | 'REJECTED';
  createdAt: Date;
}

export interface EnterpriseStrategyRuntime {
  id: string;
  strategyId: string;
  queueName: string;
  priority: number;
  executionStatus: 'QUEUED' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  retryCount: number;
  timeoutMs: number;
  logs: string;
  startedAt?: Date;
  finishedAt?: Date;
}

export interface EnterpriseStrategyEvent {
  id: string;
  strategyId: string;
  eventType: 'StrategyStarted' | 'StrategyEvaluated' | 'CandidateCreated' | 'CandidateRejected' | 'RankingCompleted' | 'ValidationCompleted';
  payload: Record<string, any>;
  createdAt: Date;
}

export interface EnterpriseStrategyAudit {
  id: string;
  strategyId: string;
  auditType: 'Strategy' | 'Evaluation' | 'Ranking' | 'Candidate' | 'Parameter';
  hash: string; // SHA-256 protected
  content: Record<string, any>;
  createdAt: Date;
}
