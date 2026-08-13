// @ts-nocheck
export interface IRiskPolicy {
  id: string;
  organizationId: string;
  entityType: 'PORTFOLIO' | 'STRATEGY' | 'AI_MODEL' | 'ORGANIZATION';
  entityId: string;
  riskType: 'MARGIN' | 'EXPOSURE' | 'DRAWDOWN' | 'DAILY_LOSS' | 'POSITION_LIMIT' | 'LEVERAGE' | 'LIQUIDITY' | 'CONSECUTIVE_LOSSES';
  limitValue: string;
  action: 'BLOCK' | 'ALERT';
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IRiskEvent {
  id: number;
  organizationId: string;
  entityType: string;
  entityId: string;
  riskType: string;
  message: string;
  timestamp: Date;
}

export interface IRiskMetric {
  id: string;
  organizationId: string;
  entityType: string;
  entityId: string;
  currentExposure: string;
  dailyLoss: string;
  drawdown: string;
  consecutiveLosses: number;
  updatedAt: Date;
}

export interface IRiskSnapshot {
  id: number;
  organizationId: string;
  entityType: string;
  entityId: string;
  snapshotDate: string;
  exposure: string;
  drawdown: string;
  createdAt: Date;
}

export interface PreTradeValidationPayload {
  organizationId: string;
  portfolioId: string;
  symbol: string;
  side: 'BUY' | 'SELL';
  quantity: string;
  price: string;
  strategyId?: string;
  aiModelId?: string;
}

export interface IRiskPolicy {
  id: string;
  organizationId: string;
  entityType: string;
  entityId: string;
  riskType: string;
  limitValue: string;
  action: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IRiskEvent {
  id: number;
  organizationId: string;
  entityType: string;
  entityId: string;
  riskType: string;
  message: string;
  timestamp: Date;
}

export interface IRiskMetric {
  id: string;
  organizationId: string;
  entityType: string;
  entityId: string;
  currentExposure: string;
  dailyLoss: string;
  drawdown: string;
  consecutiveLosses: number;
  updatedAt: Date;
}

export interface IRiskSnapshot {
  id: number;
  organizationId: string;
  entityType: string;
  entityId: string;
  snapshotDate: Date;
  exposure: string;
  drawdown: string;
  createdAt: Date;
}

export interface PreTradeValidationPayload {
  organizationId: string;
  portfolioId: string;
  symbol: string;
  side: 'BUY' | 'SELL';
  quantity: string;
  price: string;
  strategyId?: string;
  aiModelId?: string;
}
export interface RiskEngineProfile { id?: string; [key: string]: any; }
export interface RiskAssessment { id?: string; [key: string]: any; }
export interface RiskEngineLimits { [key: string]: any; }
export interface RiskEngineEvent { [key: string]: any; }
export interface RiskHistoryRecord { [key: string]: any; }
export interface RiskEngineMetadata { [key: string]: any; }
export interface RiskAssessmentMetrics { [key: string]: any; }
export interface RiskValidationRequest { [key: string]: any; }
export interface RiskValidationResult { [key: string]: any; }
export interface RiskAction { [key: string]: any; }
export interface RiskEvent { [key: string]: any; }
export interface RiskAssessmentRequest { [key: string]: any; }
export interface RiskProfile { [key: string]: any; }
export interface RiskPipelineResult { [key: string]: any; }
export interface PipelineStageLog { [key: string]: any; }
