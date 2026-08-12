export type ResearchType = 'MARKET' | 'STOCK' | 'SECTOR' | 'PORTFOLIO' | 'RISK' | 'STRATEGY' | 'AI_CONSENSUS';
export type ResearchStatus = 'PENDING' | 'COMPLETED' | 'FAILED';

export interface ResearchReport {
  id: number;
  organizationId: string | null;
  userId: number | null;
  type: ResearchType;
  title: string;
  content: any;
  confidenceScore: string | null;
  decisionId: number | null;
  strategyId: number | null;
  status: ResearchStatus;
  createdAt: string;
  updatedAt: string;
}

export interface ResearchSource {
  id: number;
  reportId: number | null;
  name: string;
  url: string | null;
  type: string | null;
  relevance: string | null;
}

export interface ResearchEvidence {
  id: number;
  reportId: number | null;
  type: string;
  content: any;
  sourceId: number | null;
}

export interface ResearchHistory {
  id: number;
  reportId: number | null;
  action: string;
  userId: number | null;
  timestamp: string;
}

export interface ResearchTemplate {
  id: number;
  name: string;
  type: string;
  structure: any;
  isDefault: boolean;
}

export interface GenerateResearchRequest {
  type: ResearchType;
  target: string; // e.g. "RELIANCE"
  decisionId?: number;
  strategyId?: number;
}

export * from "../constants/index.ts";
export * from "./ep06.ts";
export * from "./knowledge-links.ts";
export * from "./ep03.ts";

// Phase 2.2: Research Center Foundation Types & DTOs
export type ResearchCategoryType = 
  | "Market"
  | "Technical"
  | "Fundamental"
  | "Economic"
  | "Corporate Actions"
  | "News"
  | "Sentiment"
  | "Options"
  | "Futures"
  | "Commodity"
  | "Manual Notes"
  | "AI Generated"
  | "Custom"
  | string;

export type ResearchStatusType = 
  | "DRAFT"
  | "COLLECTING"
  | "PROCESSING"
  | "READY"
  | "ARCHIVED"
  | "FAILED";

export interface ResearchItem {
  id: number;
  researchId: string;
  title: string;
  content: string;
  summary: string | null;
  category: ResearchCategoryType;
  status: ResearchStatusType;
  source: string | null;
  sourceUrl: string | null;
  author: string | null;
  tags: string[];
  metadata: Record<string, any>;
  confidenceLevel?: string;
  qualityScore?: number;
  isDuplicate?: boolean;
  duplicateOf?: string | null;
  duplicateType?: string | null;
  evidenceCount?: number;
  knowledgeLinks?: import("./knowledge-links.ts").KnowledgeLinks;
  organizationId: string | null;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateResearchDTO {
  title: string;
  content: string;
  summary?: string;
  category: ResearchCategoryType;
  status?: ResearchStatusType;
  source?: string;
  sourceUrl?: string;
  author?: string;
  tags?: string[];
  metadata?: Record<string, any>;
  confidenceLevel?: string;
  qualityScore?: number;
  organizationId?: string;
  createdBy?: string;
}

export interface UpdateResearchDTO {
  title?: string;
  content?: string;
  summary?: string;
  category?: ResearchCategoryType;
  status?: ResearchStatusType;
  source?: string;
  sourceUrl?: string;
  author?: string;
  tags?: string[];
  metadata?: Record<string, any>;
  confidenceLevel?: string;
  qualityScore?: number;
  isDuplicate?: boolean;
  duplicateOf?: string;
  duplicateType?: string;
}

export interface ResearchFilterQuery {
  keyword?: string;
  category?: ResearchCategoryType;
  status?: ResearchStatusType;
  fromDate?: string;
  toDate?: string;
  tag?: string;
  source?: string;
  organizationId?: string;
  entity?: string;
  confidence?: string;
  minQuality?: number;
  isDuplicate?: boolean;
  limit?: number;
  offset?: number;
}

export interface ResearchSearchResult {
  items: ResearchItem[];
  total: number;
  limit: number;
  offset: number;
  filter: ResearchFilterQuery;
}

export interface ResearchCategoryInfo {
  categoryId: string;
  name: string;
  description: string;
  isSystem: boolean;
}

export interface ResearchTagInfo {
  tagId: string;
  name: string;
  category?: string;
}

export interface ResearchClassificationResult {
  researchId: string;
  classifiedCategory: ResearchCategoryType;
  extractedTags: string[];
  aiLabels: string[];
  normalizedMetadata: Record<string, any>;
  confidenceScore: number;
}

export interface ResearchCenterSummary {
  totalItems: number;
  statusCounts: Record<string, number>;
  categoryCounts: Record<string, number>;
  categories: ResearchCategoryInfo[];
  statuses: string[];
  latestItems: ResearchItem[];
}

// Phase 2.2A Enterprise Hardening Types
export interface ResearchSourceRecord {
  sourceId: string;
  sourceName: string;
  sourceType: string;
  priority: number;
  reliabilityScore: number;
  trustLevel: string;
  status: string;
  metadata: Record<string, any>;
  createdAt?: Date;
}

export interface PipelineStageHistory {
  stage: string;
  timestamp: string;
  status: "SUCCESS" | "FAILED" | "IN_PROGRESS";
  durationMs?: number;
  details?: string;
}

export interface PipelineRunRecord {
  runId: string;
  researchId: string;
  currentStage: string;
  executionTimeMs: number;
  failureReason?: string;
  retryCount: number;
  stageHistory: PipelineStageHistory[];
  createdAt?: Date;
}

export interface ExtendedEvidenceRecord {
  evidenceId: string;
  researchId: string;
  evidenceType: string;
  evidenceSource: string;
  confidence: number;
  reliability: string;
  verification: "VERIFIED" | "UNVERIFIED" | "DISPUTED";
  timestamp: Date;
  metadata: Record<string, any>;
}

export interface QualityScoreResult {
  completeness: number;
  metadataCoverage: number;
  evidenceStrength: number;
  sourceReliability: number;
  validationResult: number;
  finalQualityScore: number;
}

export interface DuplicateDetectionResult {
  isDuplicate: boolean;
  duplicateOf?: string;
  duplicateType?: string;
  similarityScore: number;
  reason?: string;
}

export interface ExtractedEntity {
  entityId: string;
  researchId: string;
  entityType: string;
  name: string;
  value?: string;
  symbol?: string;
  metadata?: Record<string, any>;
}

export interface ResearchRelationship {
  relationshipId: string;
  sourceResearchId: string;
  targetResearchId: string;
  type: string;
  strength: number;
  metadata?: Record<string, any>;
  createdAt?: Date;
}

export interface ResearchVersionRecord {
  versionId: string;
  researchId: string;
  versionNumber: number;
  previousVersionId?: string;
  content: string;
  summary?: string;
  author: string;
  rollbackMetadata?: Record<string, any>;
  createdAt: Date;
}

export interface ResearchTimelineEvent {
  eventId: string;
  researchId: string;
  eventType: "CREATED" | "UPDATED" | "VALIDATED" | "ARCHIVED" | "EVIDENCE_ADDED" | "RELATIONSHIP_ADDED" | "STAGE_TRANSITION" | "VERSION_SAVED";
  description: string;
  author: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

