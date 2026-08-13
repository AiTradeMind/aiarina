import { PositionType, PositionStatus, SnapshotType, PortfolioEventType } from "../types/index.ts";

export const POSITION_TYPES: PositionType[] = [
  "LONG",
  "SHORT",
  "INTRADAY",
  "DELIVERY",
  "OPTIONS",
  "FUTURES",
  "COMMODITY",
  "ETF",
  "CUSTOM",
];

export const POSITION_STATUSES: PositionStatus[] = [
  "OPEN",
  "INCREASED",
  "REDUCED",
  "PARTIALLY_CLOSED",
  "CLOSED",
  "ARCHIVED",
];

export const SNAPSHOT_TYPES: SnapshotType[] = [
  "DAILY",
  "INTRADAY",
  "PORTFOLIO",
  "POSITION",
  "PNL",
  "EXPOSURE",
];

export const PORTFOLIO_EVENT_TYPES: PortfolioEventType[] = [
  "POSITION_OPENED",
  "POSITION_INCREASED",
  "POSITION_REDUCED",
  "POSITION_CLOSED",
  "PNL_UPDATED",
  "MTM_UPDATED",
  "EXPOSURE_UPDATED",
  "SNAPSHOT_CREATED",
  "PORTFOLIO_ARCHIVED",
];

export const PORTFOLIO_PIPELINE_STAGES = [
  "RECEIVE_OMS_EXECUTION",
  "VALIDATE_GOVERNANCE",
  "VALIDATE_PORTFOLIO",
  "VALIDATE_POSITION",
  "UPDATE_POSITION",
  "UPDATE_HOLDINGS",
  "RECALCULATE_MTM",
  "RECALCULATE_PNL",
  "UPDATE_EXPOSURE",
  "CREATE_SNAPSHOT",
  "PERSIST",
  "READY",
] as const;

export const DEFAULT_PORTFOLIO_ID = "PF-MAIN-001";
