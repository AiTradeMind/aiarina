export interface IPerformanceMetric {
  id: string;
  organizationId: string;
  entityType: 'AI_MODEL' | 'STRATEGY' | 'PORTFOLIO' | 'MARKET' | 'ORGANIZATION';
  entityId: string;
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  winRate: number;
  lossRate: number;
  grossPnL: number;
  netPnL: number;
  roi: number;
  maxDrawdown: number;
  profitFactor: number;
  expectancy: number;
  avgHoldingTimeMs: number;
  capitalEfficiency: number;
  riskScore: number;
  consistencyScore: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IPerformanceSnapshot {
  id: number;
  organizationId: string;
  entityType: string;
  entityId: string;
  snapshotDate: Date;
  metrics: Record<string, any>;
  createdAt: Date;
}

export interface IAIRanking {
  id: number;
  organizationId: string;
  aiModelId: string;
  rank: number;
  score: number;
  updatedAt: Date;
}

export interface IStrategyRanking {
  id: number;
  organizationId: string;
  strategyId: string;
  rank: number;
  score: number;
  updatedAt: Date;
}
