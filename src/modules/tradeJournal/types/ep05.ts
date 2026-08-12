export interface IEnterpriseTradeJournal {
  id: string;
  organizationId: string;
  portfolioId: string;
  positionId: string;
  executionId: string | null;
  symbol: string;
  action: 'OPEN' | 'CLOSE' | 'PARTIAL_CLOSE' | 'SCALE_IN' | 'SCALE_OUT' | 'REJECTED' | 'CANCELLED';
  side: 'BUY' | 'SELL';
  quantity: string;
  price: string;
  grossPnl: string;
  netPnl: string;
  transactionCosts: string;
  status: 'COMPLETED' | 'REJECTED';
  metadata: any;
  createdAt: Date;
}

export interface IEnterpriseTradeLedger {
  id: number;
  journalId: string;
  entryType: 'DEBIT' | 'CREDIT';
  amount: string;
  currency: string;
  description: string;
  createdAt: Date;
}

export interface IEnterprisePnlSnapshot {
  id: number;
  organizationId: string;
  portfolioId: string;
  period: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';
  snapshotDate: string;
  realizedPnl: string;
  unrealizedPnl: string;
  grossPnl: string;
  netPnl: string;
  createdAt: Date;
}

export interface IEnterpriseTradeStatistics {
  id: string;
  organizationId: string;
  portfolioId: string;
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  winRate: string;
  lossRate: string;
  averageHoldingTimeDays: string;
  averageProfit: string;
  averageLoss: string;
  largestWin: string;
  largestLoss: string;
  profitFactor: string;
  expectancy: string;
  averageRiskReward: string;
  updatedAt: Date;
}

export interface TradeCostConfig {
  enableBrokerage: boolean;
  brokerageRate: number; // e.g. 0.0003 for 0.03%
  enableExchangeCharges: boolean;
  exchangeChargeRate: number;
  enableSTT: boolean;
  sttRate: number;
  enableGST: boolean;
  gstRate: number; // Applied on brokerage + exchange
  enableSebi: boolean;
  sebiRate: number;
  enableStampDuty: boolean;
  stampDutyRate: number;
}
