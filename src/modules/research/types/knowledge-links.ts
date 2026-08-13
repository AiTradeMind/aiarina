/**
 * Knowledge Links Interfaces for Future Platform Component Integration
 * (Phase 2.2A Enterprise Hardening)
 * Pure interface declarations - no active implementation required.
 */

export interface AIBrainLink {
  brainId?: string;
  modelSignature?: string;
  embeddingVectorId?: string;
  readinessScore: number;
  lastProcessedAt?: Date;
}

export interface AIDecisionLink {
  decisionId?: string;
  recommendationType?: "BUY" | "SELL" | "HOLD" | "WATCH" | "NEUTRAL";
  confidenceThreshold?: number;
  policyApproved?: boolean;
}

export interface LearningEngineLink {
  featureSetId?: string;
  trainingWeight?: number;
  feedbackScore?: number;
  isUsedForTraining?: boolean;
}

export interface StrategyEngineLink {
  strategyId?: string;
  signalCorrelation?: number;
  timeframe?: string;
  validityWindowMs?: number;
}

export interface PortfolioLink {
  assetClass?: string;
  impactedHoldings?: string[];
  exposureRiskDelta?: number;
}

export interface OMSLink {
  orderConstraintId?: string;
  blockedSymbols?: string[];
  executionPreconditionMet?: boolean;
}

export interface KnowledgeLinks {
  aiBrain?: AIBrainLink;
  aiDecision?: AIDecisionLink;
  learningEngine?: LearningEngineLink;
  strategyEngine?: StrategyEngineLink;
  portfolio?: PortfolioLink;
  oms?: OMSLink;
}
