export const ORDER_TYPES = [
  'MARKET',
  'LIMIT',
  'STOP',
  'STOP_LIMIT',
  'TRAILING_STOP',
  'BRACKET',
  'OCO',
  'ICEBERG',
  'CUSTOM',
] as const;

export type OrderType = typeof ORDER_TYPES[number];

export const ORDER_SIDES = [
  'BUY',
  'SELL',
  'EXIT',
  'REDUCE',
  'INCREASE',
] as const;

export type OrderSide = typeof ORDER_SIDES[number];

export const ORDER_STATUSES = [
  'CREATED',
  'VALIDATED',
  'QUEUED',
  'READY',
  'SUBMITTED',
  'PARTIALLY_FILLED',
  'FILLED',
  'CANCELLED',
  'REJECTED',
  'EXPIRED',
  'ARCHIVED',
] as const;

export type OrderStatus = typeof ORDER_STATUSES[number];

export const OMS_PIPELINE_STAGES = [
  'RECEIVE_RISK_APPROVED',
  'VALIDATE_GOVERNANCE',
  'VALIDATE_DECISION',
  'VALIDATE_FUNDS',
  'VALIDATE_WALLET',
  'VALIDATE_RISK',
  'CREATE_ORDER',
  'REGISTER_LIFECYCLE',
  'QUEUE_ORDER',
  'READY_ORDER',
] as const;

export type OMSPipelineStage = typeof OMS_PIPELINE_STAGES[number];
