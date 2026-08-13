export const KNOWLEDGE_TYPES = {
  MARKET: "MARKET",
  TECHNICAL: "TECHNICAL",
  FUNDAMENTAL: "FUNDAMENTAL",
  ECONOMIC: "ECONOMIC",
  CORPORATE: "CORPORATE",
  SENTIMENT: "SENTIMENT",
  OPTIONS: "OPTIONS",
  FUTURES: "FUTURES",
  COMMODITY: "COMMODITY",
  HISTORICAL: "HISTORICAL",
  AI_GENERATED: "AI_GENERATED",
  CUSTOM: "CUSTOM",
} as const;

export type KnowledgeTypeValue = (typeof KNOWLEDGE_TYPES)[keyof typeof KNOWLEDGE_TYPES];

export const MEMORY_TYPES = {
  WORKING: "WORKING",
  SHORT_TERM: "SHORT_TERM",
  LONG_TERM: "LONG_TERM",
  SESSION: "SESSION",
  HISTORICAL: "HISTORICAL",
  CACHE: "CACHE",
} as const;

export type MemoryTypeValue = (typeof MEMORY_TYPES)[keyof typeof MEMORY_TYPES];

export const CONTEXT_TYPES = {
  MARKET: "MARKET",
  COMPANY: "COMPANY",
  SECTOR: "SECTOR",
  PORTFOLIO: "PORTFOLIO",
  STRATEGY: "STRATEGY",
  ECONOMIC: "ECONOMIC",
  GLOBAL: "GLOBAL",
  USER: "USER",
  AI: "AI",
} as const;

export type ContextTypeValue = (typeof CONTEXT_TYPES)[keyof typeof CONTEXT_TYPES];

export const BRAIN_PIPELINE_STAGES = {
  RECEIVE: "RECEIVE",
  NORMALIZE: "NORMALIZE",
  MERGE: "MERGE",
  DEDUPLICATE: "DEDUPLICATE",
  ORGANIZE: "ORGANIZE",
  PRIORITIZE: "PRIORITIZE",
  CONTEXT_BUILD: "CONTEXT_BUILD",
  MEMORY_STORE: "MEMORY_STORE",
  READY: "READY",
} as const;

export type BrainPipelineStageValue = (typeof BRAIN_PIPELINE_STAGES)[keyof typeof BRAIN_PIPELINE_STAGES];

export const BRAIN_LIFECYCLE_STATES = {
  UNINITIALIZED: "UNINITIALIZED",
  INITIALIZING: "INITIALIZING",
  READY: "READY",
  DEGRADED: "DEGRADED",
  BUSY: "BUSY",
  PAUSED: "PAUSED",
  ERROR: "ERROR",
} as const;

export type BrainLifecycleStateValue = (typeof BRAIN_LIFECYCLE_STATES)[keyof typeof BRAIN_LIFECYCLE_STATES];

export const BRAIN_ERRORS = {
  NOT_FOUND: "Knowledge item, memory record, or context not found.",
  INVALID_KNOWLEDGE_TYPE: "Invalid knowledge type provided.",
  INVALID_MEMORY_TYPE: "Invalid memory type provided.",
  INVALID_CONTEXT_TYPE: "Invalid context type provided.",
  PIPELINE_FAILED: "Brain knowledge processing pipeline execution failed.",
  UNAUTHORIZED: "Unauthorized brain operation requested.",
  EXECUTION_PROHIBITED: "AI Brain Foundation is strictly restricted to intelligence preparation. Trading execution, order generation, portfolio management, and strategy execution are prohibited in this layer.",
} as const;

export const BRAIN_EVENT_TYPES = {
  KNOWLEDGE_RECEIVED: "BRAIN_KNOWLEDGE_RECEIVED",
  KNOWLEDGE_UPDATED: "BRAIN_KNOWLEDGE_UPDATED",
  MEMORY_STORED: "BRAIN_MEMORY_STORED",
  MEMORY_RETRIEVED: "BRAIN_MEMORY_RETRIEVED",
  CONTEXT_BUILT: "BRAIN_CONTEXT_BUILT",
  PIPELINE_COMPLETED: "BRAIN_PIPELINE_COMPLETED",
  HEALTH_CHECK: "BRAIN_HEALTH_CHECK",
} as const;
