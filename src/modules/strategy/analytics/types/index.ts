export interface StrategyPerformanceSummary {
  id: string;
  strategyId: string;
  netProfit: number;
  grossProfit: number;
  grossLoss: number;
  roi: number;
  cagr: number;
  profitFactor: number;
  sharpeRatio: number;
  sortinoRatio: number;
  calmarRatio: number;
  winRate: number;
  lossRate: number;
  averageTrade: number;
  recoveryFactor: number;
  maxDrawdown: number;
  averageHoldingTime: number; // in minutes
  capitalUtilization: number;
  strategyStability: number;
  executionEfficiency: number;
  updatedTime: string;
}

export interface StrategyDailyMetrics {
  id: string;
  strategyId: string;
  date: string;
  pnl: number;
  roi: number;
  drawdown: number;
  tradesCount: number;
}

export interface StrategyMonthlyMetrics {
  id: string;
  strategyId: string;
  year: number;
  month: number;
  pnl: number;
  roi: number;
  maxDrawdown: number;
}

export interface StrategyYearlyMetrics {
  id: string;
  strategyId: string;
  year: number;
  pnl: number;
  roi: number;
  maxDrawdown: number;
}

export interface StrategyMetricHistory {
  id: string;
  strategyId: string;
  metricName: string;
  metricValue: number;
  timestamp: string;
}

export interface StrategyAttribution {
  id: string;
  strategyId: string;
  entryLogicContribution: number;
  exitLogicContribution: number;
  riskEngineContribution: number;
  aiBrainContribution: number;
  optimizerContribution: number;
  paperTradingContribution: number;
  marketConditionsContribution: number;
  timestamp: string;
}

export interface StrategyComparison {
  id: string;
  strategyIdA: string;
  strategyIdB: string;
  metricName: string;
  valueA: number | null;
  valueB: number | null;
  comparisonResult: string | null;
  timestamp: string;
}

export interface StrategyReport {
  id: string;
  strategyId: string | null;
  reportType: string; // Executive, Performance, Risk, Capital, Comparison, Optimization, Institutional
  name: string;
  content: any;
  createdBy: string | null;
  createdTime: string;
}

export interface StrategyDashboardCache {
  id: string;
  cacheKey: string;
  data: any;
  updatedTime: string;
}

export interface StrategyAnalyticsDashboard {
  summary: {
    totalStrategies: number;
    activeStrategies: number;
    aggregateRoi: number;
    aggregatePnl: number;
    averageSharpe: number;
    averageWinRate: number;
    averageDrawdown: number;
  };
  topPerformers: Array<{
    strategyId: string;
    name: string;
    roi: number;
    pnl: number;
    sharpeRatio: number;
    winRate: number;
    category: string;
  }>;
  recentActivity: Array<{
    strategyId: string;
    name: string;
    timestamp: string;
    metricValue: number;
    metricName: string;
  }>;
}
