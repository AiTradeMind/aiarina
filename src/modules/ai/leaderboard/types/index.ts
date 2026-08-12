export interface AiLeaderboard {
  id: string;
  categoryId: string;
  name: string;
  description: string | null;
  lastCalculated: Date;
  updatedAt: Date;
}

export interface AiRanking {
  id: string;
  leaderboardId: string;
  modelId: string;
  rank: number;
  previousRank: number | null;
  score: number;
  updatedAt: Date;
}

export interface AiScorecard {
  id: string;
  modelId: string;
  winRate: number;
  lossRate: number;
  roi: number;
  sharpeRatio: number;
  profitFactor: number;
  drawdown: number;
  trades: number;
  avgConfidence: number;
  consensusAccuracy: number;
  reasoningAccuracy: number;
  predictionAccuracy: number;
  researchReports: number;
  strategySuccess: number;
  riskScore: number;
  latency: number;
  responseTime: number;
  costEfficiency: number;
  tokenUsage: number;
  memoryScore: number;
  reliabilityScore: number;
  healthScore: number;
  updatedAt: Date;
}

export interface AiPerformanceHistory {
  id: string;
  modelId: string;
  categoryId: string;
  previousRank: number | null;
  currentRank: number;
  scoreDelta: number;
  reason: string | null;
  timestamp: Date;
}

export interface AiBenchmark {
  id: string;
  name: string;
  provider: string;
  benchmarkType: string;
  score: number;
  maxScore: number;
  timestamp: Date;
}
