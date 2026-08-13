export const RISK_TYPES = [
  'MARKET_RISK',
  'POSITION_RISK',
  'CAPITAL_RISK',
  'MARGIN_RISK',
  'EXPOSURE_RISK',
  'VOLATILITY_RISK',
  'LIQUIDITY_RISK',
  'CONCENTRATION_RISK',
  'OPTIONS_RISK',
  'FUTURES_RISK',
  'COMMODITY_RISK',
  'CUSTOM_RISK'
] as const;

export type RiskType = typeof RISK_TYPES[number];

export const RISK_OPERATIONS = [
  'CALCULATE',
  'VALIDATE',
  'APPROVE',
  'REJECT',
  'MONITOR',
  'REASSESS',
  'ARCHIVE'
] as const;

export type RiskOperation = typeof RISK_OPERATIONS[number];

export const RISK_LEVELS = [
  'VERY_LOW',
  'LOW',
  'MEDIUM',
  'HIGH',
  'CRITICAL',
  'BLOCKED'
] as const;

export type RiskLevel = typeof RISK_LEVELS[number];

export const RISK_DECISION_ACTIONS = [
  'APPROVED',
  'REJECTED',
  'MONITOR',
  'REASSESS'
] as const;

export type RiskDecisionAction = typeof RISK_DECISION_ACTIONS[number];

export const PIPELINE_STAGES = [
  'REQUEST',
  'VALIDATE_GOVERNANCE',
  'LOAD_RISK_RULES',
  'EVALUATE_EXPOSURE',
  'VALIDATE_LIMITS',
  'CALCULATE_RISK',
  'APPROVE_REJECT',
  'AUDIT',
  'READY'
] as const;

export type PipelineStage = typeof PIPELINE_STAGES[number];
