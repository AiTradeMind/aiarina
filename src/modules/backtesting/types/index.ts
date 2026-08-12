export type BacktestMode = 'SINGLE_STRATEGY' | 'MULTI_STRATEGY' | 'SINGLE_AI' | 'MULTI_AI' | 'PORTFOLIO' | 'ORGANIZATION';
export type ScenarioType = 'BULL' | 'BEAR' | 'SIDEWAYS' | 'HIGH_VOL' | 'LOW_VOL' | 'GAP_UP' | 'GAP_DOWN' | 'CUSTOM';

export interface BacktestConfig {
  id: string;
  organizationId: string;
  mode: BacktestMode;
  scenario: ScenarioType;
  startDate: Date;
  endDate: Date;
  initialCapital: number;
  strategyIds?: string[];
  aiModelIds?: string[];
  commissionRate: number;
  slippage: number;
}

export interface BacktestResult {
  backtestId: string;
  roi: number;
  netPnl: number;
  grossPnl: number;
  maxDrawdown: number;
  winRate: number;
  lossRate: number;
  profitFactor: number;
  sharpeRatio: number;
  sortinoRatio: number;
  tradeCount: number;
}
