export const STRATEGY_TYPES = {
  MOMENTUM: "MOMENTUM",
  TREND_FOLLOWING: "TREND_FOLLOWING",
  MEAN_REVERSION: "MEAN_REVERSION",
  BREAKOUT: "BREAKOUT",
  BREAKDOWN: "BREAKDOWN",
  SCALPING: "SCALPING",
  SWING: "SWING",
  INTRADAY: "INTRADAY",
  POSITIONAL: "POSITIONAL",
  OPTIONS_DIRECTIONAL: "OPTIONS_DIRECTIONAL",
  OPTIONS_VOLATILITY: "OPTIONS_VOLATILITY",
  FUTURES_TREND: "FUTURES_TREND",
  COMMODITY_TREND: "COMMODITY_TREND",
  NEWS_DRIVEN: "NEWS_DRIVEN",
  EVENT_DRIVEN: "EVENT_DRIVEN",
  CUSTOM: "CUSTOM",
} as const;

export type StrategyTypeKey = keyof typeof STRATEGY_TYPES;
export type StrategyTypeValue = typeof STRATEGY_TYPES[StrategyTypeKey];

export const SIGNAL_TYPES = {
  BUY_SIGNAL: "BUY_SIGNAL",
  SELL_SIGNAL: "SELL_SIGNAL",
  EXIT_SIGNAL: "EXIT_SIGNAL",
  HOLD_SIGNAL: "HOLD_SIGNAL",
  WATCH_SIGNAL: "WATCH_SIGNAL",
  IGNORE_SIGNAL: "IGNORE_SIGNAL",
} as const;

export type SignalTypeKey = keyof typeof SIGNAL_TYPES;
export type SignalTypeValue = typeof SIGNAL_TYPES[SignalTypeKey];

export const STRATEGY_STATUSES = {
  DRAFT: "DRAFT",
  ACTIVE: "ACTIVE",
  PAUSED: "PAUSED",
  DISABLED: "DISABLED",
  ARCHIVED: "ARCHIVED",
} as const;

export type StrategyStatusKey = keyof typeof STRATEGY_STATUSES;
export type StrategyStatusValue = typeof STRATEGY_STATUSES[StrategyStatusKey];

export const STRATEGY_PIPELINE_STAGES = {
  LOAD_STRATEGY: "LOAD_STRATEGY",
  VALIDATE_CONFIGURATION: "VALIDATE_CONFIGURATION",
  RECEIVE_BRAIN_CONTEXT: "RECEIVE_BRAIN_CONTEXT",
  EVALUATE_CONDITIONS: "EVALUATE_CONDITIONS",
  GENERATE_SIGNAL: "GENERATE_SIGNAL",
  VALIDATE_CONSTITUTION_POLICIES: "VALIDATE_CONSTITUTION_POLICIES",
  PUBLISH_SIGNAL: "PUBLISH_SIGNAL",
  READY: "READY",
} as const;

export type StrategyPipelineStageKey = keyof typeof STRATEGY_PIPELINE_STAGES;
export type StrategyPipelineStageValue = typeof STRATEGY_PIPELINE_STAGES[StrategyPipelineStageKey];

export const STRATEGY_ERRORS = {
  NOT_FOUND: "Strategy definition not found.",
  INVALID_STRATEGY_TYPE: "Invalid or unsupported strategy type provided.",
  INVALID_STATUS_TRANSITION: "Invalid strategy status transition requested.",
  STRATEGY_DISABLED: "Strategy is disabled or paused; evaluation cannot proceed.",
  GOVERNANCE_VALIDATION_FAILED: "Constitution policy or governance validation failed for strategy.",
  EXECUTION_PROHIBITED: "Strategy Engine Foundation is strictly prohibited from placing orders, executing trades, allocating capital, managing portfolios, or modifying wallets.",
} as const;

export const STRATEGY_EVENT_TYPES = {
  STRATEGY_LOADED: "STRATEGY_LOADED",
  EVALUATION_STARTED: "STRATEGY_EVALUATION_STARTED",
  SIGNAL_GENERATED: "STRATEGY_SIGNAL_GENERATED",
  SIGNAL_PUBLISHED: "STRATEGY_SIGNAL_PUBLISHED",
  VALIDATION_FAILED: "STRATEGY_VALIDATION_FAILED",
  POLICY_REJECTED: "STRATEGY_POLICY_REJECTED",
} as const;
