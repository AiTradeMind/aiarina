export interface StrategyBacktest {
  id: string;
  strategyId: string;
  versionId: string;
  status: string;
  createdTime: Date;
}

export interface StrategyBacktestRun {
  id: string;
  backtestId: string;
  configuration: any;
  status: string;
  progress: number;
  startTime: Date;
  endTime: Date | null;
}

export interface StrategyBacktestOrder {
  id: string;
  runId: string;
  paperOrderId: number | null;
  ticker: string;
  type: string;
  side: string;
  quantity: string;
  price: string | null;
  status: string;
  createdTime: Date;
}

export interface StrategyBacktestPosition {
  id: string;
  runId: string;
  ticker: string;
  quantity: string;
  averagePrice: string;
  updatedTime: Date;
}

export interface StrategyBacktestTrade {
  id: string;
  runId: string;
  ticker: string;
  side: string;
  quantity: string;
  executionPrice: string;
  timestamp: Date;
}

export interface StrategyBacktestMetrics {
  id: string;
  runId: string;
  netProfit: number | null;
  grossProfit: number | null;
  grossLoss: number | null;
  roi: number | null;
  cagr: number | null;
  winRate: number | null;
  profitFactor: number | null;
  sharpeRatio: number | null;
  maxDrawdown: number | null;
  recoveryFactor: number | null;
  totalTrades: number | null;
  createdTime: Date;
}

export interface StrategyBacktestReport {
  id: string;
  runId: string;
  summary: string | null;
  riskAnalysis: string | null;
  suggestions: string | null;
  createdTime: Date;
}

export interface StrategyBacktestEquityCurve {
  id: string;
  runId: string;
  timestamp: Date;
  equity: number;
}

export interface StrategyBacktestHistory {
  id: string;
  strategyId: string;
  runId: string;
  userId: string | null;
  notes: string | null;
  timestamp: Date;
}
