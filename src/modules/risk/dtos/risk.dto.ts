import { RiskType, RiskLevel, RiskDecisionAction } from "../constants/index.ts";

export interface CreateRiskProfileDto {
  profileId?: string;
  name: string;
  riskLevel?: RiskLevel;
  targetId?: string;
  status?: 'ACTIVE' | 'SUSPENDED' | 'HALTED' | 'ARCHIVED';
}

export interface UpdateRiskProfileDto {
  name?: string;
  riskLevel?: RiskLevel;
  status?: 'ACTIVE' | 'SUSPENDED' | 'HALTED' | 'ARCHIVED';
}

export interface UpdateRiskLimitsDto {
  maxPositionSize?: number;
  maxDailyLoss?: number;
  maxCapitalUtilization?: number;
  maxConcentrationRatio?: number;
  maxDrawdown?: number;
  minLiquidityScore?: number;
  requiredMarginRatio?: number;
}

export interface EvaluateRiskRequestDto {
  requestId?: string;
  targetId: string;
  riskType?: RiskType;
  orderValue?: number;
  positionSize?: number;
  dailyPnl?: number;
  portfolioValue?: number;
  availableMargin?: number;
  requiredMargin?: number;
  assetClass?: 'EQUITY' | 'CRYPTO' | 'FOREX' | 'COMMODITY' | 'OPTIONS' | 'FUTURES';
  volatilityIndex?: number;
  liquidityScore?: number;
  metadata?: Record<string, any>;
}

export interface UpdateRiskMetadataDto {
  volatilityThreshold?: number;
  marginCallLevel?: number;
  tags?: string[];
  customRules?: Record<string, any>;
}
