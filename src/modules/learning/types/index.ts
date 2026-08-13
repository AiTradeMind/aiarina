export type EntityType = 'AI_MODEL' | 'STRATEGY' | 'MARKET' | 'PORTFOLIO' | 'ORGANIZATION';

export type SnapshotType = 'DAILY' | 'WEEKLY' | 'MONTHLY';

export type FeedbackType = 'POSITIVE' | 'NEGATIVE' | 'STRATEGY' | 'RISK' | 'EXECUTION' | 'PORTFOLIO';

export type PatternType = 
  | 'WINNING' 
  | 'LOSING' 
  | 'REPEATED_MISTAKE' 
  | 'SUCCESSFUL_CONDITION' 
  | 'UNSUCCESSFUL_CONDITION';

export type MarketCondition = 
  | 'HIGH_VOLATILITY' 
  | 'LOW_VOLATILITY' 
  | 'TREND' 
  | 'RANGE';

export type KnowledgeCategory = 
  | 'LESSONS_LEARNED' 
  | 'BEST_PRACTICES' 
  | 'AVOIDED_MISTAKES' 
  | 'SUCCESSFUL_CONDITIONS' 
  | 'FAILED_CONDITIONS' 
  | 'MARKET_NOTES' 
  | 'RESEARCH_NOTES';

export interface ILearningRecord {
  id: string;
  organizationId: string;
  aiModelId: string;
  strategyId?: string;
  tradeId?: string;
  decision: string;
  reason: string;
  confidence: number;
  marketContext: Record<string, any>;
  indicatorsUsed: string[];
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  result: 'SUCCESS' | 'FAILURE';
  pnl?: number;
  learningOutcome: string;
  createdAt: Date;
}

export interface ILearningFeedback {
  id: string;
  organizationId: string;
  aiModelId?: string;
  strategyId?: string;
  feedbackType: FeedbackType;
  title: string;
  content: string;
  metadata: Record<string, any>;
  createdAt: Date;
}

export interface ILearningSnapshot {
  id: number;
  organizationId: string;
  entityType: EntityType;
  entityId: string;
  snapshotType: SnapshotType;
  snapshotDate: Date;
  metrics: {
    totalDecisions: number;
    successRate: number;
    learningScore: number;
    improvementScore: number;
    consistencyRankInput: number;
    patternsDetected: number;
    [key: string]: any;
  };
  createdAt: Date;
}

export interface ILearningPattern {
  id: string;
  organizationId: string;
  aiModelId?: string;
  strategyId?: string;
  patternName: string;
  patternType: PatternType;
  marketCondition: MarketCondition;
  frequency: number;
  winRate: number;
  impactScore: number;
  metadata: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface ILearningQueueItem {
  id: string;
  organizationId: string;
  sourceModule: 'TRADE_JOURNAL' | 'PNL_ENGINE' | 'PERFORMANCE_ENGINE' | 'RISK_ENGINE' | 'PORTFOLIO_ENGINE' | 'ORCHESTRATOR' | 'RESEARCH_ENGINE';
  eventType: string;
  payload: Record<string, any>;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  attempts: number;
  errorMessage?: string;
  createdAt: Date;
  processedAt?: Date;
}

export interface IKnowledgeEntry {
  id: string;
  organizationId: string;
  category: KnowledgeCategory;
  title: string;
  summary: string;
  details: Record<string, any>;
  entityType?: EntityType;
  entityId?: string;
  score: number;
  tags: string[];
  createdAt: Date;
}

export interface ILearningObservability {
  learningProgress: number;
  queuePendingCount: number;
  patternDetectionCount: number;
  feedbackGeneratedCount: number;
  knowledgeUpdateCount: number;
  decisionAnalysisCount: number;
}
