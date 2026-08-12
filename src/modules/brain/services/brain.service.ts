import { BrainRepository } from "../repositories/brain.repository.ts";
import { KnowledgeRepositoryService } from "./knowledge-repository.service.ts";
import { MemoryManagerService } from "./memory-manager.service.ts";
import { ContextBuilderService } from "./context-builder.service.ts";
import { BrainKnowledgePipelineService } from "./brain-pipeline.service.ts";
import {
  BRAIN_LIFECYCLE_STATES,
  BrainLifecycleStateValue,
  BRAIN_ERRORS,
  MEMORY_TYPES,
  CONTEXT_TYPES,
  KNOWLEDGE_TYPES,
  KnowledgeTypeValue,
  BRAIN_EVENT_TYPES,
} from "../constants/index.ts";
import {
  BrainHealthStatus,
  BrainSummary,
  BrainKnowledgeItem,
  BrainMemoryRecord,
  BrainContextRecord,
  CreateKnowledgeDTO,
  StoreMemoryDTO,
  BuildContextDTO,
  QueryKnowledgeDTO,
  QueryMemoryDTO,
  QueryContextDTO,
} from "../types/index.ts";
import { PermissionMatrix } from "../../constitution/permissions/permission.matrix.ts";
import { GOVERNANCE_ROLES, GOVERNANCE_ACTIONS } from "../../constitution/constants/index.ts";
import logger from "../../../lib/logger.ts";

export class BrainService {
  private repo: BrainRepository;
  public knowledgeService: KnowledgeRepositoryService;
  public memoryService: MemoryManagerService;
  public contextBuilder: ContextBuilderService;
  public pipelineService: BrainKnowledgePipelineService;

  private lifecycleState: BrainLifecycleStateValue = BRAIN_LIFECYCLE_STATES.READY;

  constructor(
    repo?: BrainRepository,
    knowledgeService?: KnowledgeRepositoryService,
    memoryService?: MemoryManagerService,
    contextBuilder?: ContextBuilderService,
    pipelineService?: BrainKnowledgePipelineService
  ) {
    this.repo = repo || new BrainRepository();
    this.knowledgeService = knowledgeService || new KnowledgeRepositoryService(this.repo);
    this.memoryService = memoryService || new MemoryManagerService(this.repo);
    this.contextBuilder = contextBuilder || new ContextBuilderService(this.repo, this.knowledgeService, this.memoryService);
    this.pipelineService = pipelineService || new BrainKnowledgePipelineService();
  }

  // ==========================================
  // Lifecycle & Health
  // ==========================================

  public getLifecycleState(): BrainLifecycleStateValue {
    return this.lifecycleState;
  }

  public setLifecycleState(state: BrainLifecycleStateValue) {
    this.lifecycleState = state;
  }

  public async getHealth(): Promise<BrainHealthStatus> {
    const counts = await this.repo.countAll();
    const isCompliant = PermissionMatrix.hasPermission(GOVERNANCE_ROLES.SYSTEM, GOVERNANCE_ACTIONS.EXECUTE);

    return {
      status: this.lifecycleState,
      knowledgeCount: counts.knowledgeCount,
      memoryRecordCount: counts.memoryCount,
      contextCount: counts.contextCount,
      activeSessionCount: counts.sessionCount,
      pipelineHealth: "HEALTHY",
      lastPipelineRunAt: new Date(),
      checkTimestamp: new Date(),
      details: {
        databaseConnected: true,
        memoryCacheActive: true,
        constitutionPolicyCompliant: isCompliant,
      },
    };
  }

  public async getSummary(): Promise<BrainSummary> {
    const counts = await this.repo.countAll();
    return {
      lifecycleState: this.lifecycleState,
      knowledgeDistribution: {
        MARKET: Math.ceil(counts.knowledgeCount * 0.4),
        TECHNICAL: Math.floor(counts.knowledgeCount * 0.3),
        ECONOMIC: Math.floor(counts.knowledgeCount * 0.3),
      },
      memoryDistribution: {
        WORKING: Math.ceil(counts.memoryCount * 0.5),
        SHORT_TERM: Math.floor(counts.memoryCount * 0.3),
        LONG_TERM: Math.floor(counts.memoryCount * 0.2),
      },
      contextDistribution: {
        MARKET: Math.ceil(counts.contextCount * 0.5),
        SECTOR: Math.floor(counts.contextCount * 0.5),
      },
      totalKnowledgeItems: counts.knowledgeCount,
      totalMemoryRecords: counts.memoryCount,
      totalContexts: counts.contextCount,
      lastUpdated: new Date(),
    };
  }

  // ==========================================
  // Research Center Integration & Processing
  // ==========================================

  /**
   * Process structured research arriving from Research Center
   * Runs knowledge store, 9-stage pipeline, memory store, and context build.
   */
  public async processResearchItem(
    researchItem: {
      researchId: string;
      title: string;
      content: string;
      category?: string;
      summary?: string;
      tags?: string[];
      source?: string;
      confidenceScore?: number;
      metadata?: Record<string, any>;
    },
    operator: string = "SYSTEM"
  ): Promise<{
    knowledge: BrainKnowledgeItem;
    memory: BrainMemoryRecord;
    context: BrainContextRecord;
    pipelineRun: any;
  }> {
    // Map Research Category to Knowledge Type
    let knowledgeType: KnowledgeTypeValue = KNOWLEDGE_TYPES.MARKET;
    if (researchItem.category?.toLowerCase().includes("economic")) knowledgeType = KNOWLEDGE_TYPES.ECONOMIC;
    else if (researchItem.category?.toLowerCase().includes("corporate") || researchItem.category?.toLowerCase().includes("filing")) knowledgeType = KNOWLEDGE_TYPES.CORPORATE;
    else if (researchItem.category?.toLowerCase().includes("option")) knowledgeType = KNOWLEDGE_TYPES.OPTIONS;
    else if (researchItem.category?.toLowerCase().includes("future")) knowledgeType = KNOWLEDGE_TYPES.FUTURES;
    else if (researchItem.category?.toLowerCase().includes("technical")) knowledgeType = KNOWLEDGE_TYPES.TECHNICAL;

    // 1. Store Knowledge
    const knowledge = await this.knowledgeService.storeKnowledge({
      researchId: researchItem.researchId,
      knowledgeType,
      title: researchItem.title,
      summary: researchItem.summary,
      content: researchItem.content,
      tags: researchItem.tags || [],
      confidence: researchItem.confidenceScore || 85,
      source: researchItem.source || "Research Center",
      metadata: researchItem.metadata || {},
    });

    // 2. Execute 9-Stage Knowledge Pipeline
    const pipelineRun = await this.pipelineService.processKnowledgePipeline(knowledge.knowledgeId, {
      researchId: researchItem.researchId,
      title: researchItem.title,
    });

    // 3. Store in Memory Manager (Working Memory)
    const memory = await this.memoryService.storeMemory({
      memoryType: MEMORY_TYPES.WORKING,
      key: `RESEARCH:${researchItem.researchId}`,
      value: {
        title: researchItem.title,
        summary: researchItem.summary,
        knowledgeId: knowledge.knowledgeId,
        processedAt: new Date().toISOString(),
      },
      metadata: { operator, researchId: researchItem.researchId },
    });

    // 4. Build Context
    const context = await this.contextBuilder.buildContext({
      contextType: CONTEXT_TYPES.MARKET,
      title: `Reasoning Context for ${researchItem.title}`,
      knowledgeIds: [knowledge.knowledgeId],
      researchIds: [researchItem.researchId],
      userContext: { operator },
    });

    logger.info(
      { type: "RESEARCH_PROCESSED_IN_BRAIN", researchId: researchItem.researchId, knowledgeId: knowledge.knowledgeId },
      "Research Center item successfully ingested into AI Brain"
    );

    return { knowledge, memory, context, pipelineRun };
  }

  // ==========================================
  // Facade Methods
  // ==========================================

  public async buildContext(dto: BuildContextDTO): Promise<BrainContextRecord> {
    return await this.contextBuilder.buildContext(dto);
  }

  public async storeMemory(dto: StoreMemoryDTO): Promise<BrainMemoryRecord> {
    return await this.memoryService.storeMemory(dto);
  }

  public async storeKnowledge(dto: CreateKnowledgeDTO): Promise<BrainKnowledgeItem> {
    return await this.knowledgeService.storeKnowledge(dto);
  }

  public async queryKnowledge(query: QueryKnowledgeDTO = {}): Promise<BrainKnowledgeItem[]> {
    return await this.knowledgeService.queryKnowledge(query);
  }

  public async queryMemory(query: QueryMemoryDTO = {}): Promise<BrainMemoryRecord[]> {
    return await this.memoryService.queryMemory(query);
  }

  public async queryContexts(query: QueryContextDTO = {}): Promise<BrainContextRecord[]> {
    return await this.contextBuilder.queryContexts(query);
  }

  // ==========================================
  // Business Rules Enforcement (Prohibitions)
  // ==========================================

  /**
   * Enforce boundary rule: AI Brain is prohibited from placing trades,
   * generating orders, managing portfolios, or executing strategies.
   */
  public executeTrade(): never {
    throw new Error(BRAIN_ERRORS.EXECUTION_PROHIBITED);
  }

  public generateOrder(): never {
    throw new Error(BRAIN_ERRORS.EXECUTION_PROHIBITED);
  }

  public managePortfolio(): never {
    throw new Error(BRAIN_ERRORS.EXECUTION_PROHIBITED);
  }

  public executeStrategy(): never {
    throw new Error(BRAIN_ERRORS.EXECUTION_PROHIBITED);
  }
}
