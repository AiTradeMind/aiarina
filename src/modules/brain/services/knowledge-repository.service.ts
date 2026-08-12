import { BrainRepository } from "../repositories/brain.repository.ts";
import { KNOWLEDGE_TYPES, KnowledgeTypeValue, BRAIN_ERRORS } from "../constants/index.ts";
import { BrainKnowledgeItem, CreateKnowledgeDTO, QueryKnowledgeDTO } from "../types/index.ts";
import logger from "../../../lib/logger.ts";

export class KnowledgeRepositoryService {
  private repo: BrainRepository;

  constructor(repo?: BrainRepository) {
    this.repo = repo || new BrainRepository();
  }

  /**
   * Store structured knowledge in the AI Brain Knowledge Repository
   */
  public async storeKnowledge(dto: CreateKnowledgeDTO): Promise<BrainKnowledgeItem> {
    if (!dto.knowledgeType || !Object.values(KNOWLEDGE_TYPES).includes(dto.knowledgeType as any)) {
      throw new Error(BRAIN_ERRORS.INVALID_KNOWLEDGE_TYPE);
    }
    if (!dto.title || !dto.content) {
      throw new Error("Title and Content are required to store knowledge.");
    }

    const item = await this.repo.createKnowledge(dto);
    logger.info(
      { type: "KNOWLEDGE_STORED", knowledgeId: item.knowledgeId, knowledgeType: item.knowledgeType },
      "Knowledge item successfully stored in AI Brain Knowledge Repository"
    );
    return item;
  }

  /**
   * Get single knowledge item by ID
   */
  public async getKnowledgeById(knowledgeId: string): Promise<BrainKnowledgeItem | null> {
    return await this.repo.getKnowledgeById(knowledgeId);
  }

  /**
   * Query knowledge items with filters
   */
  public async queryKnowledge(query: QueryKnowledgeDTO = {}): Promise<BrainKnowledgeItem[]> {
    return await this.repo.queryKnowledge(query);
  }

  /**
   * Merge two knowledge items into a consolidated knowledge record
   */
  public async mergeKnowledge(
    primaryKnowledgeId: string,
    secondaryKnowledgeId: string,
    operator: string = "SYSTEM"
  ): Promise<BrainKnowledgeItem> {
    const primary = await this.getKnowledgeById(primaryKnowledgeId);
    const secondary = await this.getKnowledgeById(secondaryKnowledgeId);

    if (!primary || !secondary) {
      throw new Error("One or both knowledge items to merge were not found.");
    }

    const mergedContent = `${primary.content}\n\n--- Merged Knowledge (${secondary.knowledgeId}) ---\n${secondary.content}`;
    const mergedTags = Array.from(new Set([...(primary.tags || []), ...(secondary.tags || [])]));
    const mergedConfidence = Math.max(primary.confidence || 85, secondary.confidence || 85);

    const merged = await this.storeKnowledge({
      researchId: primary.researchId || secondary.researchId || undefined,
      knowledgeType: primary.knowledgeType,
      title: `Consolidated: ${primary.title}`,
      summary: primary.summary || secondary.summary || undefined,
      content: mergedContent,
      tags: mergedTags,
      confidence: mergedConfidence,
      source: `MERGED(${primary.source}, ${secondary.source})`,
      metadata: {
        mergedFrom: [primary.knowledgeId, secondary.knowledgeId],
        mergedBy: operator,
        mergedAt: new Date().toISOString(),
      },
    });

    return merged;
  }

  /**
   * Returns supported Knowledge Types
   */
  public getKnowledgeTypes(): string[] {
    return Object.values(KNOWLEDGE_TYPES);
  }
}
