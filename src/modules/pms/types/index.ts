export interface PMSSnapshot {
  snapshotType: 'LIVE' | 'DAILY' | 'WEEKLY' | 'MONTHLY';
  totalValue: number;
  cashBalance: number;
  netExposure: number;
  realizedPnl: number;
  unrealizedPnl: number;
  timestamp: string;
}

export interface PMSPosition {
  symbol: string;
  exchange: string;
  segment: string;
  direction: 'LONG' | 'SHORT';
  quantity: number;
  averagePrice: number;
  currentPrice: number;
  marketValue: number;
  realizedPnl: number;
  unrealizedPnl: number;
  status: 'OPEN' | 'PARTIAL_CLOSE' | 'FULL_CLOSE' | 'ARCHIVED';
}
