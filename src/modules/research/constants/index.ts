export const RESEARCH_CATEGORIES = {
  MARKET: "Market",
  TECHNICAL: "Technical",
  FUNDAMENTAL: "Fundamental",
  ECONOMIC: "Economic",
  CORPORATE_ACTIONS: "Corporate Actions",
  NEWS: "News",
  SENTIMENT: "Sentiment",
  OPTIONS: "Options",
  FUTURES: "Futures",
  COMMODITY: "Commodity",
  MANUAL_NOTES: "Manual Notes",
  AI_GENERATED: "AI Generated",
  CUSTOM: "Custom",
} as const;

export type ResearchCategoryValue = (typeof RESEARCH_CATEGORIES)[keyof typeof RESEARCH_CATEGORIES];

export const RESEARCH_STATUSES = {
  DRAFT: "DRAFT",
  COLLECTING: "COLLECTING",
  PROCESSING: "PROCESSING",
  READY: "READY",
  ARCHIVED: "ARCHIVED",
  FAILED: "FAILED",
} as const;

export type ResearchStatusValue = (typeof RESEARCH_STATUSES)[keyof typeof RESEARCH_STATUSES];

export const RESEARCH_ERRORS = {
  NOT_FOUND: "Research item not found",
  INVALID_CATEGORY: "Invalid research category",
  INVALID_STATUS: "Invalid research status",
  CREATION_FAILED: "Failed to create research item",
  UPDATE_FAILED: "Failed to update research item",
  DELETE_FAILED: "Failed to delete research item",
  UNAUTHORIZED: "Unauthorized research access or insufficient governance permission",
} as const;

export const RESEARCH_EVENT_TYPES = {
  CREATED: "RESEARCH_CREATED",
  UPDATED: "RESEARCH_UPDATED",
  ARCHIVED: "RESEARCH_ARCHIVED",
  DELETED: "RESEARCH_DELETED",
  CLASSIFICATION_UPDATED: "RESEARCH_CLASSIFICATION_UPDATED",
  STATUS_CHANGED: "RESEARCH_STATUS_CHANGED",
} as const;

export const DEFAULT_RESEARCH_CONFIG = {
  DEFAULT_PAGE_SIZE: 50,
  MAX_PAGE_SIZE: 200,
} as const;

// Phase 2.2A Enterprise Hardening Constants
export const RESEARCH_SOURCE_TYPES = {
  NSE: "NSE",
  BSE: "BSE",
  COMMODITY: "COMMODITY",
  TRADINGVIEW: "TradingView",
  NEWS: "News",
  ECONOMIC_CALENDAR: "Economic Calendar",
  CORPORATE_FILING: "Corporate Filing",
  MANUAL: "Manual",
  CSV: "CSV",
  PDF: "PDF",
  REST_API: "REST API",
  AI_GENERATED: "AI Generated",
  CUSTOM: "Custom",
} as const;

export type ResearchSourceTypeValue = (typeof RESEARCH_SOURCE_TYPES)[keyof typeof RESEARCH_SOURCE_TYPES];

export const PIPELINE_STAGES = {
  INGEST: "INGEST",
  NORMALIZE: "NORMALIZE",
  CLEAN: "CLEAN",
  EXTRACT: "EXTRACT",
  CLASSIFY: "CLASSIFY",
  VERIFY: "VERIFY",
  INDEX: "INDEX",
  READY: "READY",
} as const;

export type PipelineStageValue = (typeof PIPELINE_STAGES)[keyof typeof PIPELINE_STAGES];

export const CONFIDENCE_LEVELS = {
  LOW: "LOW",
  MEDIUM: "MEDIUM",
  HIGH: "HIGH",
  VERY_HIGH: "VERY_HIGH",
  VERIFIED: "VERIFIED",
} as const;

export type ConfidenceLevelValue = (typeof CONFIDENCE_LEVELS)[keyof typeof CONFIDENCE_LEVELS];

export const ENTITY_TYPES = {
  COMPANY: "Company",
  STOCK: "Stock",
  SECTOR: "Sector",
  INDUSTRY: "Industry",
  EXCHANGE: "Exchange",
  INDEX: "Index",
  COMMODITY: "Commodity",
  CURRENCY: "Currency",
  CEO: "CEO",
  COUNTRY: "Country",
  SYMBOL: "Symbol",
  EVENT: "Event",
} as const;

export type EntityTypeValue = (typeof ENTITY_TYPES)[keyof typeof ENTITY_TYPES];

export const RELATIONSHIP_TYPES = {
  SUPPORTS: "Supports",
  CONTRADICTS: "Contradicts",
  RELATED: "Related",
  DERIVED_FROM: "Derived From",
  REFERENCES: "References",
  LINKED_TO: "Linked To",
} as const;

export type RelationshipTypeValue = (typeof RELATIONSHIP_TYPES)[keyof typeof RELATIONSHIP_TYPES];

export const DUPLICATE_TYPES = {
  NEWS: "Duplicate News",
  FILING: "Duplicate Filing",
  EVENT: "Duplicate Event",
  RESEARCH: "Duplicate Research",
  SOURCES: "Duplicate Sources",
} as const;

export type DuplicateTypeValue = (typeof DUPLICATE_TYPES)[keyof typeof DUPLICATE_TYPES];
