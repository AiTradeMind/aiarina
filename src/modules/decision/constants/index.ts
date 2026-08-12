export const DECISION_TYPES = {
  BUY: "BUY",
  SELL: "SELL",
  HOLD: "HOLD",
  WATCH: "WATCH",
  IGNORE: "IGNORE",
  EXIT: "EXIT",
  REDUCE: "REDUCE",
  INCREASE: "INCREASE",
} as const;

export type DecisionTypeValue = (typeof DECISION_TYPES)[keyof typeof DECISION_TYPES];

export const DECISION_STATUSES = {
  CREATED: "CREATED",
  EVALUATING: "EVALUATING",
  READY: "READY",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
  EXPIRED: "EXPIRED",
  ARCHIVED: "ARCHIVED",
} as const;

export type DecisionStatusValue = (typeof DECISION_STATUSES)[keyof typeof DECISION_STATUSES];

export const DECISION_CONFIDENCE = {
  VERY_LOW: "VERY_LOW",
  LOW: "LOW",
  MEDIUM: "MEDIUM",
  HIGH: "HIGH",
  VERY_HIGH: "VERY_HIGH",
} as const;

export type DecisionConfidenceValue = (typeof DECISION_CONFIDENCE)[keyof typeof DECISION_CONFIDENCE];

export const DECISION_PRIORITY = {
  CRITICAL: "CRITICAL",
  HIGH: "HIGH",
  NORMAL: "NORMAL",
  LOW: "LOW",
} as const;

export type DecisionPriorityValue = (typeof DECISION_PRIORITY)[keyof typeof DECISION_PRIORITY];

export const DECISION_PIPELINE_STAGES = {
  RECEIVE_CONTEXT: "RECEIVE_CONTEXT",
  VALIDATE_INPUTS: "VALIDATE_INPUTS",
  EVALUATE_EVIDENCE: "EVALUATE_EVIDENCE",
  CALCULATE_CONFIDENCE: "CALCULATE_CONFIDENCE",
  CALCULATE_RISK: "CALCULATE_RISK",
  GENERATE_DECISION: "GENERATE_DECISION",
  VALIDATE_GOVERNANCE: "VALIDATE_GOVERNANCE",
  READY: "READY",
} as const;

export type DecisionPipelineStageValue = (typeof DECISION_PIPELINE_STAGES)[keyof typeof DECISION_PIPELINE_STAGES];

export const DECISION_ERRORS = {
  NOT_FOUND: "Decision record not found.",
  INVALID_DECISION_TYPE: "Invalid decision type provided.",
  INVALID_STATUS_TRANSITION: "Invalid decision status transition requested.",
  MISSING_REQUIRED_INPUTS: "Brain context or research evidence is required for decision evaluation.",
  GOVERNANCE_VALIDATION_FAILED: "Governance validation failed for decision.",
  EXECUTION_PROHIBITED: "AI Decision Engine is strictly restricted to opportunity evaluation and decision generation. Trade execution, order creation, portfolio updates, and capital allocation are prohibited in this layer.",
} as const;

export const DECISION_EVENT_TYPES = {
  DECISION_STARTED: "DECISION_EVALUATION_STARTED",
  DECISION_GENERATED: "DECISION_GENERATED",
  DECISION_APPROVED: "DECISION_APPROVED",
  DECISION_REJECTED: "DECISION_REJECTED",
  VALIDATION_FAILED: "DECISION_VALIDATION_FAILED",
  PIPELINE_COMPLETED: "DECISION_PIPELINE_COMPLETED",
} as const;
