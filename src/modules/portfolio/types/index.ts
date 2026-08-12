export type PositionType =
  | "LONG"
  | "SHORT"
  | "INTRADAY"
  | "DELIVERY"
  | "OPTIONS"
  | "FUTURES"
  | "COMMODITY"
  | "ETF"
  | "CUSTOM";

export type PositionStatus =
  | "OPEN"
  | "INCREASED"
  | "REDUCED"
  | "PARTIALLY_CLOSED"
  | "CLOSED"
  | "ARCHIVED";

export type SnapshotType =
  | "DAILY"
  | "INTRADAY"
  | "PORTFOLIO"
  | "POSITION"
  | "PNL"
  | "EXPOSURE";

export type PortfolioEventType =
  | "POSITION_OPENED"
  | "POSITION_INCREASED"
  | "POSITION_REDUCED"
  | "POSITION_CLOSED"
  | "PNL_UPDATED"
  | "MTM_UPDATED"
  | "EXPOSURE_UPDATED"
  | "SNAPSHOT_CREATED"
  | "PORTFOLIO_ARCHIVED";

export interface PortfolioAccount {
  id?: number;
  portfolioId: string;
  fundId?: string;
  name: string;
  status: "ACTIVE" | "INACTIVE" | "ARCHIVED";
  totalValue: number;
  cashBalance: number;
  unrealizedPnl: number;
  realizedPnl: number;
  grossExposure: number;
  netExposure: number;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface PortfolioPosition {
  id?: number;
  positionId: string;
  portfolioId: string;
  symbol: string;
  positionType: PositionType;
  status: PositionStatus;
  netQuantity: number;
  averagePrice: number;
  currentPrice: number;
  marketValue: number;
  costValue: number;
  unrealizedPnl: number;
  realizedPnl: number;
  todaysPnl: number;
  totalPnl: number;
  roi: number;
  capitalUsed: number;
  exposure: number;
  holdingPeriodDays: number;
  openedAt?: string | Date;
  lastUpdatedAt?: string | Date;
}

export interface PortfolioHolding {
  id?: number;
  holdingId: string;
  portfolioId: string;
  symbol: string;
  assetClass: string;
  quantity: number;
  averageCost: number;
  currentPrice: number;
  totalCost: number;
  currentValue: number;
  unrealizedPnl: number;
  weight: number;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface PortfolioSnapshot {
  id?: number;
  snapshotId: string;
  portfolioId: string;
  snapshotType: SnapshotType;
  totalValue: number;
  unrealizedPnl: number;
  realizedPnl: number;
  grossExposure: number;
  netExposure: number;
  positionCount: number;
  data: Record<string, any>;
  timestamp?: string | Date;
}

export interface PortfolioPnLRecord {
  id?: number;
  pnlRecordId: string;
  portfolioId: string;
  positionId?: string;
  symbol?: string;
  dailyMtm: number;
  runningMtm: number;
  realizedPnl: number;
  unrealizedPnl: number;
  totalPnl: number;
  date: string;
  createdAt?: string | Date;
}

export interface PortfolioEventRecord {
  id?: number;
  eventId: string;
  portfolioId: string;
  eventType: PortfolioEventType;
  payload: Record<string, any>;
  timestamp?: string | Date;
}

export interface PortfolioMetadataRecord {
  id?: number;
  portfolioId: string;
  manager?: string;
  benchmark?: string;
  riskLimits: Record<string, any>;
  customTags: string[];
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface OMSExecutionUpdate {
  orderId: string;
  portfolioId: string;
  symbol: string;
  side: "BUY" | "SELL";
  filledQuantity: number;
  averageFillPrice: number;
  positionType?: PositionType;
  assetClass?: string;
  sector?: string;
  executedAt?: string;
}

export interface PortfolioPipelineStageLog {
  stage: string;
  passed: boolean;
  message: string;
  timestamp: string;
}

export interface PortfolioPipelineResult {
  success: boolean;
  portfolioId: string;
  orderId?: string;
  positionId?: string;
  stageLogs: PortfolioPipelineStageLog[];
  failureReason?: string;
  executionTimeMs: number;
}

export interface PortfolioExposureMetrics {
  grossExposure: number;
  netExposure: number;
  sectorExposure: Record<string, number>;
  instrumentExposure: Record<string, number>;
  longExposure: number;
  shortExposure: number;
  capitalUtilization: number;
  portfolioDistribution: Record<string, number>;
}

export interface PortfolioHealthReport {
  status: "HEALTHY" | "DEGRADED" | "UNHEALTHY";
  activePortfolios: number;
  totalPositions: number;
  systemStance: string;
  checks: Record<string, boolean>;
  timestamp: string;
}
