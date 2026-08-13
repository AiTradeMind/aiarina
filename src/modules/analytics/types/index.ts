export interface AnalyticsMetrics {
  timestamp: Date;
  entityId: string;
  metricType: string;
  value: number;
}

export interface AnalyticsSummary {
  totalPnL: number;
  winRate: number;
  activeStrategies: number;
  riskExposure: number;
}

export interface AnalyticsSnapshot {
  id?: number;
  organizationId: string;
  snapshotData: any;
  createdAt?: string;
}

export interface AnalyticsMetric {
  id?: number;
  organizationId: string;
  name?: string;
  value?: any;
  metadata?: unknown;
  timestamp: string;
}

export interface AnalyticsPerformance {
  id?: number;
  organizationId: string;
  targetId?: string;
  targetType?: string;
  winRate?: any;
  profitFactor?: any;
  sharpeRatio?: any;
  maxDrawdown?: any;
  pnl?: number;
  updatedAt: string;
}

export interface AnalyticsDashboard {
  id?: number;
  organizationId: string;
  name?: string;
  isDefault?: boolean;
  createdAt: string;
}

export interface AnalyticsReport {
  id?: number;
  organizationId: string;
  userId?: number;
  title: string;
  config: any;
  status: string;
  fileUrl?: string;
  createdAt: string;
}

export interface MarketStatistics {
  id?: number;
  organizationId: string;
  symbol: string;
  averagePrice: number;
  medianPrice: number;
  vwap: number;
  priceDistribution: any;
  stdDev: number;
  variance: number;
  rangeAnalysis: any;
  marketBreadth: any;
  updatedAt?: string;
}

export interface TrendStatistics {
  id?: number;
  organizationId: string;
  symbol: string;
  trendStrength: number;
  trendDuration: number;
  trendStability: number;
  reversalDetected: boolean;
  trendPersistence: number;
  updatedAt?: string;
}

export interface VolumeStatistics {
  id?: number;
  organizationId: string;
  symbol: string;
  averageVolume: number;
  relativeVolume: number;
  volumeProfile: any;
  liquidityScore: number;
  participationScore: number;
  volumeDistribution: any;
  updatedAt?: string;
}

export interface VolatilityStatistics {
  id?: number;
  organizationId: string;
  symbol: string;
  atr: number;
  realizedVolatility: number;
  historicalVolatility: number;
  volatilityRank: number;
  volatilityPercentile: number;
  updatedAt?: string;
}

export interface CorrelationMatrix {
  id?: number;
  organizationId: string;
  symbols: any;
  matrix: any;
  sectorCorrelation: any;
  indexCorrelation: any;
  rollingCorrelation: any;
  updatedAt?: string;
}

export interface MarketHealth {
  id?: number;
  organizationId: string;
  breadthScore: number;
  liquidityIndex: number;
  momentumIndex: number;
  volatilityIndex: number;
  participationIndex: number;
  compositeScore: number;
  updatedAt?: string;
}

export interface AnalyticsHistoryEntry {
  id?: number;
  organizationId: string;
  symbol?: string;
  metricName: string;
  metricValue: number;
  timestamp?: string;
}
