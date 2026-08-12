export interface IEnterprisePortfolio {
  id: string;
  organizationId: string;
  type: 'PAPER' | 'LIVE' | 'MARGIN';
  status: 'ACTIVE' | 'SUSPENDED';
  cashBalance: string;
  blockedCash: string;
  availableCash: string;
  equity: string;
  usedMargin: string;
  availableMargin: string;
  buyingPower: string;
  portfolioValue: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IEnterprisePosition {
  id: string;
  portfolioId: string;
  organizationId: string;
  symbol: string;
  assetClass: 'NSE_STOCKS' | 'BSE_STOCKS' | 'ETF' | 'INDEX' | 'STOCK_FUTURES' | 'INDEX_FUTURES' | 'STOCK_OPTIONS' | 'INDEX_OPTIONS' | 'COMMODITIES';
  status: 'OPEN' | 'CLOSED';
  openQuantity: string;
  averagePrice: string;
  currentMarketPrice: string;
  marketValue: string;
  unrealizedPnl: string;
  realizedPnl: string;
  holdingPeriodDays: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IEnterprisePositionHistory {
  id: number;
  positionId: string;
  executionId: string | null;
  action: 'OPEN' | 'INCREASE' | 'REDUCE' | 'CLOSE' | 'REOPEN';
  quantity: string;
  price: string;
  timestamp: Date;
}

export interface IEnterprisePortfolioSnapshot {
  id: number;
  portfolioId: string;
  snapshotDate: string;
  cashBalance: string;
  equity: string;
  portfolioValue: string;
  createdAt: Date;
}

export interface UpdatePortfolioFromExecutionPayload {
  organizationId: string;
  portfolioId: string;
  symbol: string;
  assetClass: string;
  side: 'BUY' | 'SELL';
  quantity: string;
  price: string;
  executionId: string;
}
