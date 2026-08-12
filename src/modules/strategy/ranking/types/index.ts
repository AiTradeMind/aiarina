export interface StrategyRankingItem {
  rankingId: string;
  candidateId: string;
  strategyId: string;
  aiModelId: string;
  symbol: string;
  assetClass: string;
  market: string;
  direction: 'BUY' | 'SELL';
  rankOrder: number;
  confidence: number;
  qualityScore: number;
  riskScore: number;
  researchScore: number;
  consensusScore: number;
  historicalScore: number;
  marketContextScore: number;
  parameterComplianceScore: number;
  aiReliabilityScore: number;
  executionReadinessScore: number;
  finalScore: number;
  tier: 'Enterprise Grade' | 'Tier A+' | 'Tier A' | 'Tier B' | 'Tier C' | 'Rejected';
  priority: 'CRITICAL' | 'HIGH' | 'NORMAL' | 'LOW';
  committeeStatus: 'APPROVED' | 'PENDING' | 'REJECTED' | 'WATCHLIST' | 'HOLD' | 'ARCHIVED';
  runtimeStatus: 'READY' | 'QUEUED' | 'DEPLOYED' | 'SUSPENDED';
  createdTime: string;
  updatedTime: string;
  scoreBreakdown: {
    confidenceWeight: number;
    riskWeight: number;
    qualityWeight: number;
    researchWeight: number;
    historicalWeight: number;
    marketWeight: number;
    complianceWeight: number;
    reliabilityWeight: number;
  };
  aiReasoning: string;
  committeeVotes: Array<{
    id: string;
    committeeMember: string;
    vote: 'APPROVE' | 'REJECT' | 'ABSTAIN';
    comment: string;
    timestamp: string;
  }>;
  historicalPerformance: {
    winRate: number;
    profitFactor: number;
    maxDrawdown: number;
    sharpeRatio: number;
    totalBacktestTrades: number;
  };
  researchSummary: string;
  indicatorSnapshot: Record<string, any>;
  riskAnalysis: {
    volatilityRisk: string;
    liquidityRisk: string;
    var99: string;
  };
  validationChecks: Array<{
    id: string;
    ruleName: string;
    isValid: boolean;
    message: string;
  }>;
  history: Array<{
    id: string;
    action: string;
    operator: string;
    timestamp: string;
    details: string;
  }>;
  sha256Reference: string;
}

export interface RankingOverview {
  rankings: StrategyRankingItem[];
  statistics: {
    totalRanked: number;
    runtimeReadyCount: number;
    pendingRankingCount: number;
    rejectedCount: number;
    watchlistCount: number;
    averageFinalScore: number;
    averageConfidence: number;
    averageRisk: number;
    averageQuality: number;
    averageProfitFactor: number;
    averageWinRate: number;
    highestRankedStrategy: string;
  };
}

export const EMPTY_RANKING_OVERVIEW: RankingOverview = {
  rankings: [],
  statistics: {
    totalRanked: 0,
    runtimeReadyCount: 0,
    pendingRankingCount: 0,
    rejectedCount: 0,
    watchlistCount: 0,
    averageFinalScore: 0,
    averageConfidence: 0,
    averageRisk: 0,
    averageQuality: 0,
    averageProfitFactor: 0,
    averageWinRate: 0,
    highestRankedStrategy: 'None'
  }
};
