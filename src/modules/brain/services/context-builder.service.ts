import { BrainRepository } from "../repositories/brain.repository.ts";
import { KnowledgeRepositoryService } from "./knowledge-repository.service.ts";
import { MemoryManagerService } from "./memory-manager.service.ts";
import { CONTEXT_TYPES, ContextTypeValue, BRAIN_ERRORS } from "../constants/index.ts";
import { BrainContextRecord, BuildContextDTO, QueryContextDTO } from "../types/index.ts";
import logger from "../../../lib/logger.ts";

export class ContextBuilderService {
  private repo: BrainRepository;
  private knowledgeService: KnowledgeRepositoryService;
  private memoryService: MemoryManagerService;

  constructor(
    repo?: BrainRepository,
    knowledgeService?: KnowledgeRepositoryService,
    memoryService?: MemoryManagerService
  ) {
    this.repo = repo || new BrainRepository();
    this.knowledgeService = knowledgeService || new KnowledgeRepositoryService(this.repo);
    this.memoryService = memoryService || new MemoryManagerService(this.repo);
  }

  /**
   * Build a reasoning context (Market, Company, Sector, Portfolio, Strategy, Economic, Global, User, AI)
   * Prepares intelligence for AI Models without placing trades, generating orders, managing portfolios, or executing strategies.
   */
  public async buildContext(dto: BuildContextDTO): Promise<BrainContextRecord> {
    if (!dto.contextType || !Object.values(CONTEXT_TYPES).includes(dto.contextType as any)) {
      throw new Error(BRAIN_ERRORS.INVALID_CONTEXT_TYPE);
    }
    if (!dto.title) {
      throw new Error("Title is required to build a reasoning context.");
    }

    // Retrieve relevant knowledge items if knowledgeIds provided
    let knowledgePayload: any[] = [];
    if (dto.knowledgeIds && dto.knowledgeIds.length > 0) {
      for (const id of dto.knowledgeIds) {
        const item = await this.knowledgeService.getKnowledgeById(id);
        if (item) knowledgePayload.push(item);
      }
    } else {
      // Fetch latest knowledge matching relevant context type
      const items = await this.knowledgeService.queryKnowledge({ limit: 10 });
      knowledgePayload = items;
    }

    // Retrieve relevant working/short-term memory
    const workingMemory = await this.memoryService.queryMemory({ limit: 5 });

    // Assemble rich contextual payload without decision execution
    const payload = {
      contextType: dto.contextType,
      title: dto.title,
      entitySymbols: dto.entitySymbols || [],
      knowledgeItems: knowledgePayload.map((k) => ({
        knowledgeId: k.knowledgeId,
        title: k.title,
        type: k.knowledgeType,
        summary: k.summary,
        confidence: k.confidence,
      })),
      recentMemory: workingMemory.map((m) => ({
        key: m.key,
        type: m.memoryType,
        value: m.value,
      })),
      customInputs: dto.customInputs || {},
      userContext: dto.userContext || {},
      systemGuarantees: {
        tradingProhibited: true,
        orderGenerationProhibited: true,
        portfolioManagementProhibited: true,
        strategyExecutionProhibited: true,
        intelligencePreparationOnly: true,
      },
      assembledAt: new Date().toISOString(),
    };

    const reasoning = `Reasoning Context assembled for AI model consumption in stage [${dto.contextType}]. Includes ${knowledgePayload.length} knowledge sources and ${workingMemory.length} active memory entries.`;

    const record = await this.repo.saveContext({
      contextType: dto.contextType,
      title: dto.title,
      payload,
      reasoning,
      confidenceScore: 90.0,
      metadata: {
        knowledgeCount: knowledgePayload.length,
        memoryCount: workingMemory.length,
        entitySymbols: dto.entitySymbols || [],
      },
    });

    logger.info(
      { type: "CONTEXT_BUILT", contextId: record.contextId, contextType: record.contextType },
      "Reasoning context successfully built for AI model consumption"
    );

    return record;
  }

  /**
   * Query built contexts with filters
   */
  public async queryContexts(query: QueryContextDTO = {}): Promise<BrainContextRecord[]> {
    return await this.repo.queryContext(query);
  }

  /**
   * Returns supported Context Types
   */
  public getContextTypes(): string[] {
    return Object.values(CONTEXT_TYPES);
  }
}
