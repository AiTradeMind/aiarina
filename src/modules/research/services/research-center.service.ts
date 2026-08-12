import { ResearchItemRepository } from "../repositories/research-item.repository.ts";
import { 
  ResearchItem, 
  CreateResearchDTO, 
  UpdateResearchDTO, 
  ResearchFilterQuery, 
  ResearchSearchResult,
  ResearchCategoryInfo,
  ResearchCenterSummary
} from "../types/index.ts";
import { 
  RESEARCH_CATEGORIES, 
  RESEARCH_STATUSES, 
  RESEARCH_ERRORS,
  RESEARCH_EVENT_TYPES 
} from "../constants/index.ts";
import { ResearchRegistry } from "../registry/research.registry.ts";
import { ResearchClassificationEngine } from "../utils/classification.utils.ts";
import { QualityScoringService } from "./quality-scoring.service.ts";
import { DuplicateDetectorService } from "./duplicate-detector.service.ts";
import { EntityExtractorService } from "./entity-extractor.service.ts";
import { RelationshipGraphService } from "./relationship-graph.service.ts";
import { ResearchTimelineService } from "./timeline.service.ts";
import { VersionHistoryService } from "./version-history.service.ts";
import { EnterpriseResearchPipeline } from "./pipeline.service.ts";
import { ResearchEvidenceEngine } from "./evidence-engine.ts";
import logger from "../../../lib/logger.ts";

export class ResearchCenterService {
  private repo: ResearchItemRepository;
  private qualityScorer = new QualityScoringService();
  private duplicateDetector = new DuplicateDetectorService();
  private entityExtractor = new EntityExtractorService();
  private relationshipGraph = new RelationshipGraphService();
  private timelineService = new ResearchTimelineService();
  private versionService = new VersionHistoryService();
  private pipeline = new EnterpriseResearchPipeline();
  private evidenceEngine = new ResearchEvidenceEngine();

  constructor(repo?: ResearchItemRepository) {
    this.repo = repo || new ResearchItemRepository();
  }

  /**
   * Create new research item with classification, enterprise pipeline, quality scoring, duplicate detection & entity extraction
   */
  public async createResearch(dto: CreateResearchDTO, operator: string = "SYSTEM"): Promise<ResearchItem> {
    if (!dto.title || !dto.content) {
      throw new Error("Title and content are required for research item creation.");
    }

    // Validate category or fallback to classified
    let category = dto.category;
    if (!category || !ResearchRegistry.isValidCategory(category)) {
      category = RESEARCH_CATEGORIES.MARKET;
    }

    // Validate status or default to READY
    let status = dto.status || RESEARCH_STATUSES.READY;
    if (!Object.values(RESEARCH_STATUSES).includes(status as any)) {
      status = RESEARCH_STATUSES.DRAFT;
    }

    // Classify content & extract metadata
    const dummyId = `TEMP-${Date.now()}`;
    const classification = ResearchClassificationEngine.classifyContent(
      dummyId,
      dto.title,
      dto.content,
      category
    );

    // Merge extracted tags with user tags
    const combinedTags = Array.from(new Set([...(dto.tags || []), ...classification.extractedTags]));

    // Check existing items for duplicate detection
    const existingResult = await this.repo.getResearchItems({ limit: 100 });
    const duplicateCheck = this.duplicateDetector.detectDuplicates(dto, existingResult.items);

    // Calculate initial quality score
    const qualityScoreResult = this.qualityScorer.calculateQualityScore(dto, 0, 85, true);
    const confidenceLevel = dto.confidenceLevel || this.qualityScorer.deriveConfidenceLevel(qualityScoreResult.finalQualityScore, 0);

    // Merge metadata for AI readiness
    const mergedMetadata = {
      ...(dto.metadata || {}),
      aiLabels: classification.aiLabels,
      normalizedMetadata: classification.normalizedMetadata,
      confidenceScore: classification.confidenceScore,
      classifiedAt: new Date().toISOString(),
      qualityScoreDetails: qualityScoreResult,
      duplicateCheckDetails: duplicateCheck,
      knowledgeLinks: {
        aiBrain: { readinessScore: qualityScoreResult.finalQualityScore },
        aiDecision: { policyApproved: true },
        learningEngine: { isUsedForTraining: true },
        strategyEngine: { timeframe: "DAILY" },
        portfolio: { assetClass: "EQUITY" },
        oms: { executionPreconditionMet: true },
      },
    };

    const finalDto: CreateResearchDTO = {
      ...dto,
      category,
      status,
      tags: combinedTags,
      metadata: mergedMetadata,
      confidenceLevel,
      qualityScore: qualityScoreResult.finalQualityScore,
      createdBy: operator,
    };

    logger.info({ type: RESEARCH_EVENT_TYPES.CREATED, title: dto.title, category }, "Creating research item");
    const createdItem = await this.repo.createResearchItem(finalDto);

    // Record timeline & version history
    this.timelineService.addEvent(createdItem.researchId, "CREATED", `Research item created: ${createdItem.title}`, operator);
    this.versionService.createVersion(createdItem.researchId, createdItem.content, operator, createdItem.summary || undefined);

    // Extract Entities
    this.entityExtractor.extractEntities(createdItem.researchId, createdItem.title, createdItem.content);

    // Record confidence history
    this.qualityScorer.recordConfidence(createdItem.researchId, confidenceLevel as any, "Initial creation confidence");

    // Run background pipeline run simulation
    this.pipeline.runFullPipeline(createdItem.researchId).catch((err) => {
      logger.warn({ error: err.message }, "Background pipeline execution warning");
    });

    return createdItem;
  }

  /**
   * Get single research item by ID or researchId with populated enterprise search metadata
   */
  public async getResearchById(idOrResearchId: string | number): Promise<ResearchItem> {
    const item = await this.repo.getResearchItemById(idOrResearchId);
    if (!item) {
      throw new Error(RESEARCH_ERRORS.NOT_FOUND);
    }

    // Populate timeline, entities, relationships, evidence count
    const evidenceCount = this.evidenceEngine.getEvidenceCount(item.researchId);
    const entities = this.entityExtractor.getEntitiesByResearchId(item.researchId);
    const relationships = this.relationshipGraph.getRelationships(item.researchId);

    return {
      ...item,
      evidenceCount: Math.max(item.evidenceCount || 0, evidenceCount),
      metadata: {
        ...item.metadata,
        extractedEntities: entities,
        relationships,
      },
    };
  }

  /**
   * Query & Search research items with keyword, category, status, date, tag, source, entity, confidence, minQuality
   */
  public async searchResearch(filter: ResearchFilterQuery): Promise<ResearchSearchResult> {
    // Validate category if provided
    if (filter.category && !ResearchRegistry.isValidCategory(filter.category)) {
      logger.warn({ type: "RESEARCH_SEARCH_WARN", category: filter.category }, "Searching with non-standard category");
    }

    // Validate status if provided
    if (filter.status && !Object.values(RESEARCH_STATUSES).includes(filter.status as any)) {
      throw new Error(RESEARCH_ERRORS.INVALID_STATUS);
    }

    const result = await this.repo.getResearchItems(filter);

    // Enterprise metadata filtering
    let filteredItems = result.items;

    if (filter.confidence) {
      filteredItems = filteredItems.filter((i) => i.confidenceLevel === filter.confidence);
    }

    if (filter.minQuality !== undefined) {
      filteredItems = filteredItems.filter((i) => (i.qualityScore || 0) >= filter.minQuality!);
    }

    if (filter.isDuplicate !== undefined) {
      filteredItems = filteredItems.filter((i) => Boolean(i.isDuplicate) === filter.isDuplicate);
    }

    if (filter.entity) {
      const entLower = filter.entity.toLowerCase();
      filteredItems = filteredItems.filter((i) => {
        const entities = this.entityExtractor.getEntitiesByResearchId(i.researchId);
        return entities.some((e) => e.name.toLowerCase().includes(entLower) || (e.symbol && e.symbol.toLowerCase().includes(entLower)));
      });
    }

    return {
      ...result,
      items: filteredItems,
      total: filteredItems.length,
    };
  }

  /**
   * Update existing research item with re-scoring and version history tracking
   */
  public async updateResearch(
    idOrResearchId: string | number,
    dto: UpdateResearchDTO,
    operator: string = "SYSTEM"
  ): Promise<ResearchItem> {
    const existing = await this.getResearchById(idOrResearchId);

    // Validate category if provided
    if (dto.category && !ResearchRegistry.isValidCategory(dto.category)) {
      throw new Error(RESEARCH_ERRORS.INVALID_CATEGORY);
    }

    // Validate status if provided
    if (dto.status && !Object.values(RESEARCH_STATUSES).includes(dto.status as any)) {
      throw new Error(RESEARCH_ERRORS.INVALID_STATUS);
    }

    // Re-classify content if title or content changed
    let updatedTags = dto.tags || existing.tags;
    let updatedMetadata = { ...existing.metadata, ...(dto.metadata || {}) };

    if (dto.title || dto.content) {
      const classification = ResearchClassificationEngine.classifyContent(
        existing.researchId,
        dto.title || existing.title,
        dto.content || existing.content,
        dto.category || existing.category
      );

      updatedTags = Array.from(new Set([...updatedTags, ...classification.extractedTags]));
      updatedMetadata = {
        ...updatedMetadata,
        aiLabels: classification.aiLabels,
        normalizedMetadata: classification.normalizedMetadata,
        lastReclassifiedAt: new Date().toISOString(),
      };

      // Extract new entities
      this.entityExtractor.extractEntities(existing.researchId, dto.title || existing.title, dto.content || existing.content);
    }

    // Recalculate Quality Score & Confidence
    const updatedQuality = this.qualityScorer.calculateQualityScore(
      { ...existing, ...dto },
      existing.evidenceCount || 0,
      85,
      true
    );
    const confidenceLevel = dto.confidenceLevel || this.qualityScorer.deriveConfidenceLevel(updatedQuality.finalQualityScore, existing.evidenceCount || 0);

    const updated = await this.repo.updateResearchItem(
      idOrResearchId,
      {
        ...dto,
        tags: updatedTags,
        metadata: {
          ...updatedMetadata,
          qualityScoreDetails: updatedQuality,
        },
        confidenceLevel,
        qualityScore: updatedQuality.finalQualityScore,
      },
      operator
    );

    // Record timeline & versioning
    this.timelineService.addEvent(existing.researchId, "UPDATED", `Research item updated: ${updated.title}`, operator);
    this.versionService.createVersion(existing.researchId, updated.content, operator, updated.summary || undefined);

    logger.info({ type: RESEARCH_EVENT_TYPES.UPDATED, researchId: existing.researchId }, "Updated research item");
    return updated;
  }

  /**
   * Delete research item
   */
  public async deleteResearch(idOrResearchId: string | number, operator: string = "SYSTEM"): Promise<boolean> {
    const existing = await this.getResearchById(idOrResearchId);
    const success = await this.repo.deleteResearchItem(existing.researchId, operator);
    this.timelineService.addEvent(existing.researchId, "ARCHIVED", `Research item deleted/archived`, operator);
    logger.info({ type: RESEARCH_EVENT_TYPES.DELETED, researchId: existing.researchId }, "Deleted research item");
    return success;
  }

  /**
   * Add evidence record to research item
   */
  public addEvidence(
    researchId: string,
    evidence: {
      evidenceType: string;
      evidenceSource: string;
      confidence?: number;
      reliability?: string;
      verification?: "VERIFIED" | "UNVERIFIED" | "DISPUTED";
      metadata?: Record<string, any>;
    }
  ) {
    const record = this.evidenceEngine.addEvidence(researchId, evidence);
    this.timelineService.addEvent(researchId, "EVIDENCE_ADDED", `Evidence added (${evidence.evidenceType})`);
    return record;
  }

  /**
   * Add relationship link between research items
   */
  public addRelationship(
    sourceResearchId: string,
    targetResearchId: string,
    type: any,
    strength: number = 1.0,
    metadata?: Record<string, any>
  ) {
    const rel = this.relationshipGraph.addRelationship(sourceResearchId, targetResearchId, type, strength, metadata);
    this.timelineService.addEvent(sourceResearchId, "RELATIONSHIP_ADDED", `Relationship added: ${type} -> ${targetResearchId}`);
    return rel;
  }

  /**
   * Get timeline for research item
   */
  public getTimeline(researchId: string) {
    return this.timelineService.getTimeline(researchId);
  }

  /**
   * Get version history for research item
   */
  public getVersions(researchId: string) {
    return this.versionService.getVersions(researchId);
  }

  /**
   * Get supported Research Categories
   */
  public async getCategories(): Promise<ResearchCategoryInfo[]> {
    return await this.repo.getResearchCategories();
  }

  /**
   * Get supported Research Statuses
   */
  public getStatuses(): string[] {
    return Object.values(RESEARCH_STATUSES);
  }

  /**
   * Get overall Research Center summary
   */
  public async getSummary(): Promise<ResearchCenterSummary> {
    return await this.repo.getResearchCenterSummary();
  }
}

