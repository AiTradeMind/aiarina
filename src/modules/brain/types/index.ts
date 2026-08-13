import {
  KnowledgeTypeValue,
  MemoryTypeValue,
  ContextTypeValue,
  BrainPipelineStageValue,
  BrainLifecycleStateValue,
} from "../constants/index.ts";

export interface BrainKnowledgeItem {
  id?: number;
  knowledgeId: string;
  researchId?: string | null;
  knowledgeType: KnowledgeTypeValue;
  title: string;
  summary?: string | null;
  content: string;
  tags?: string[];
  confidence?: number;
  source?: string | null;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateKnowledgeDTO {
  researchId?: string;
  knowledgeType: KnowledgeTypeValue;
  title: string;
  summary?: string;
  content: string;
  tags?: string[];
  confidence?: number;
  source?: string;
  metadata?: Record<string, any>;
}

export interface QueryKnowledgeDTO {
  knowledgeType?: KnowledgeTypeValue;
  researchId?: string;
  tag?: string;
  symbol?: string;
  minConfidence?: number;
  keyword?: string;
  limit?: number;
  offset?: number;
}

export interface BrainMemoryRecord {
  id?: number;
  memoryId: string;
  memoryType: MemoryTypeValue;
  key: string;
  value: Record<string, any> | any;
  sessionId?: string | null;
  ttl?: number | null;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface StoreMemoryDTO {
  memoryType: MemoryTypeValue;
  key: string;
  value: Record<string, any> | any;
  sessionId?: string;
  ttl?: number;
  metadata?: Record<string, any>;
}

export interface QueryMemoryDTO {
  memoryType?: MemoryTypeValue;
  key?: string;
  sessionId?: string;
  limit?: number;
  offset?: number;
}

export interface BrainContextRecord {
  id?: number;
  contextId: string;
  contextType: ContextTypeValue;
  title: string;
  payload: Record<string, any>;
  reasoning?: string | null;
  confidenceScore?: number;
  metadata?: Record<string, any>;
  createdAt: Date;
}

export interface BuildContextDTO {
  contextType: ContextTypeValue;
  title: string;
  knowledgeIds?: string[];
  researchIds?: string[];
  entitySymbols?: string[];
  customInputs?: Record<string, any>;
  userContext?: Record<string, any>;
}

export interface QueryContextDTO {
  contextType?: ContextTypeValue;
  contextId?: string;
  limit?: number;
  offset?: number;
}

export interface BrainSessionRecord {
  id?: number;
  sessionId: string;
  userId?: string | null;
  status: "ACTIVE" | "INACTIVE" | "ARCHIVED";
  memorySummary?: Record<string, any>;
  activeContextId?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateSessionDTO {
  userId?: string;
  activeContextId?: string;
  memorySummary?: Record<string, any>;
}

export interface BrainMetadataRecord {
  metadataId: string;
  key: string;
  value: Record<string, any>;
  updatedAt: Date;
}

export interface BrainPipelineStageHistory {
  stage: BrainPipelineStageValue;
  timestamp: Date;
  durationMs: number;
  status: "SUCCESS" | "WARNING" | "FAILED";
  details?: string;
}

export interface BrainPipelineRunRecord {
  runId: string;
  knowledgeId: string;
  currentStage: BrainPipelineStageValue;
  executionTimeMs: number;
  failureReason?: string | null;
  retryCount: number;
  stageHistory: BrainPipelineStageHistory[];
  createdAt: Date;
}

export interface BrainHealthStatus {
  status: BrainLifecycleStateValue;
  knowledgeCount: number;
  memoryRecordCount: number;
  contextCount: number;
  activeSessionCount: number;
  pipelineHealth: "HEALTHY" | "DEGRADED" | "CRITICAL";
  lastPipelineRunAt?: Date | null;
  checkTimestamp: Date;
  details: {
    databaseConnected: boolean;
    memoryCacheActive: boolean;
    constitutionPolicyCompliant: boolean;
  };
}

export interface BrainSummary {
  lifecycleState: BrainLifecycleStateValue;
  knowledgeDistribution: Record<string, number>;
  memoryDistribution: Record<string, number>;
  contextDistribution: Record<string, number>;
  totalKnowledgeItems: number;
  totalMemoryRecords: number;
  totalContexts: number;
  lastUpdated: Date;
}
