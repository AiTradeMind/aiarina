export interface StrategySeason {
  id: string;
  name: string;
  type: string;
  startDate: string;
  endDate: string;
  isActive: boolean | null;
  createdTime: string;
}

export interface StrategyLeaderboard {
  id: string;
  name: string;
  category: string;
  seasonId: string;
  updatedTime: string;
}

export interface StrategyRanking {
  id: string;
  leaderboardId: string;
  strategyId: string;
  rank: number;
  previousRank: number | null;
  score: number;
  rating: string | null;
  updatedTime: string;
}

export interface StrategyScorecard {
  id: string;
  strategyId: string;
  seasonId: string | null;
  overallScore: number;
  backtestingScore: number | null;
  paperTradingScore: number | null;
  riskScore: number | null;
  consistencyScore: number | null;
  capitalEfficiency: number | null;
  recoveryScore: number | null;
  executionQuality: number | null;
  compositeRating: string | null;
  updatedTime: string;
}

export interface StrategyRatingHistory {
  id: string;
  strategyId: string;
  rating: string;
  score: number;
  timestamp: string;
}

export interface StrategyBenchmark {
  id: string;
  strategyId: string;
  benchmarkName: string;
  strategyReturn: number | null;
  benchmarkReturn: number | null;
  alpha: number | null;
  beta: number | null;
  updatedTime: string;
}

export interface StrategyAward {
  id: string;
  strategyId: string;
  seasonId: string | null;
  awardType: string;
  description: string | null;
  awardedTime: string;
}

export interface StrategyScoreHistory {
  id: string;
  strategyId: string;
  score: number;
  timestamp: string;
}
