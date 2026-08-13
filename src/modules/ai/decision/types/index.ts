export type DecisionType = 'MARKET_ANALYSIS' | 'STOCK_ANALYSIS' | 'RISK_ANALYSIS' | 'PORTFOLIO_REVIEW' | 'TRADE_VALIDATION' | 'RESEARCH' | 'NEWS_ANALYSIS' | 'SENTIMENT_ANALYSIS';
export type DecisionStatus = 'PENDING' | 'COMPLETED' | 'FAILED';
export type RecommendationAction = 'BUY' | 'SELL' | 'HOLD' | 'NEUTRAL';

export interface AIDecision {
  id: number;
  organizationId: string | null;
  userId: number | null;
  type: DecisionType;
  decision: any;
  confidence: string;
  modelIds: number[];
  consensusMetadata: any;
  status: DecisionStatus;
  createdAt: string;
}

export interface AIRecommendation {
  id: number;
  organizationId: string | null;
  decisionId: number | null;
  ticker: string | null;
  action: RecommendationAction | null;
  rationale: string | null;
  isApplied: boolean;
  createdAt: string;
}

export interface DecisionRequest {
  type: DecisionType;
  input: any;
  modelIds?: number[]; // Optional specific models to use
  requireConsensus?: boolean;
}

export interface ConsensusRequest {
  type: DecisionType;
  input: any;
  modelIds: number[];
}

export interface AnalyzeRequest {
  target: string; // e.g. "RELIANCE", "MARKET_SENTIMENT"
  context?: any;
}
