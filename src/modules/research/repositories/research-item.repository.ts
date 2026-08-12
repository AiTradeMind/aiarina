import { eq, desc, and, gte, lte, ilike, or, sql } from "drizzle-orm";
import { getDb } from "../../../db/client.ts";
import { 
  researchItems, 
  researchCategories, 
  researchTags, 
  researchMetadata 
} from "../../../db/schema.ts";
import { 
  ResearchItem, 
  CreateResearchDTO, 
  UpdateResearchDTO, 
  ResearchFilterQuery, 
  ResearchSearchResult,
  ResearchCategoryInfo,
  ResearchCenterSummary
} from "../types/index.ts";
import { RESEARCH_CATEGORIES, RESEARCH_STATUSES, RESEARCH_ERRORS } from "../constants/index.ts";
import { ConstitutionRepository } from "../../constitution/repositories/constitution.repository.ts";
import { ResearchRegistry } from "../registry/research.registry.ts";
import logger from "../../../lib/logger.ts";

export class ResearchItemRepository {
  private constitutionRepo: ConstitutionRepository;
  private memoryStore: Map<string, ResearchItem> = new Map();

  constructor(constitutionRepo?: ConstitutionRepository) {
    this.constitutionRepo = constitutionRepo || new ConstitutionRepository();
  }

  /**
   * Helper to map DB row to ResearchItem interface
   */
  private mapRowToResearchItem(row: any): ResearchItem {
    return {
      id: row.id,
      researchId: row.researchId,
      title: row.title,
      content: row.content,
      summary: row.summary || null,
      category: row.category,
      status: row.status,
      source: row.source || null,
      sourceUrl: row.sourceUrl || null,
      author: row.author || null,
      tags: Array.isArray(row.tags) ? row.tags : [],
      metadata: (row.metadata as Record<string, any>) || {},
      confidenceLevel: row.confidenceLevel || "MEDIUM",
      qualityScore: row.qualityScore ? Number(row.qualityScore) : 75,
      isDuplicate: Boolean(row.isDuplicate),
      duplicateOf: row.duplicateOf || null,
      duplicateType: row.duplicateType || null,
      evidenceCount: row.evidenceCount ? Number(row.evidenceCount) : 0,
      organizationId: row.organizationId || null,
      createdBy: row.createdBy || "SYSTEM",
      createdAt: row.createdAt ? new Date(row.createdAt) : new Date(),
      updatedAt: row.updatedAt ? new Date(row.updatedAt) : new Date(),
    };
  }

  /**
   * Create a new Research Item in storage
   */
  public async createResearchItem(dto: CreateResearchDTO): Promise<ResearchItem> {
    const researchId = `RES-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const status = dto.status || RESEARCH_STATUSES.DRAFT;
    const category = dto.category || RESEARCH_CATEGORIES.MARKET;
    const tags = dto.tags || [];
    const metadata = dto.metadata || {};
    const createdBy = dto.createdBy || "SYSTEM";

    try {
      const db = getDb();
      const [inserted] = await db
        .insert(researchItems)
        .values({
          researchId,
          title: dto.title,
          content: dto.content,
          summary: dto.summary || null,
          category,
          status,
          source: dto.source || null,
          sourceUrl: dto.sourceUrl || null,
          author: dto.author || null,
          tags,
          metadata,
          organizationId: dto.organizationId || null,
          createdBy,
        })
        .returning();

      const item = this.mapRowToResearchItem(inserted);
      this.memoryStore.set(item.researchId, item);

      await this.constitutionRepo.recordAuditLog(
        "RESEARCH_CREATED",
        "RESEARCH_ITEM",
        researchId,
        createdBy,
        { title: dto.title, category, status }
      );

      return item;
    } catch (error: any) {
      logger.warn({ type: "RESEARCH_REPO_WARN", error: error.message }, "Falling back to in-memory research creation");
      
      const item: ResearchItem = {
        id: this.memoryStore.size + 1,
        researchId,
        title: dto.title,
        content: dto.content,
        summary: dto.summary || null,
        category,
        status,
        source: dto.source || null,
        sourceUrl: dto.sourceUrl || null,
        author: dto.author || null,
        tags,
        metadata,
        confidenceLevel: dto.confidenceLevel || "MEDIUM",
        qualityScore: dto.qualityScore || 75,
        organizationId: dto.organizationId || null,
        createdBy,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      this.memoryStore.set(researchId, item);
      return item;
    }
  }

  /**
   * Find research item by numerical ID or string researchId
   */
  public async getResearchItemById(idOrResearchId: string | number): Promise<ResearchItem | null> {
    const isNumeric = typeof idOrResearchId === "number" || (!isNaN(Number(idOrResearchId)) && !String(idOrResearchId).startsWith("RES-"));

    try {
      const db = getDb();
      let query;

      if (isNumeric) {
        query = db.select().from(researchItems).where(eq(researchItems.id, Number(idOrResearchId))).limit(1);
      } else {
        query = db.select().from(researchItems).where(eq(researchItems.researchId, String(idOrResearchId))).limit(1);
      }

      const [row] = await query;
      if (row) {
        const item = this.mapRowToResearchItem(row);
        this.memoryStore.set(item.researchId, item);
        return item;
      }
    } catch (error: any) {
      logger.warn({ type: "RESEARCH_REPO_WARN", error: error.message }, "Memory fallback for getResearchItemById");
    }

    // Memory fallback
    if (isNumeric) {
      const numericId = Number(idOrResearchId);
      for (const item of this.memoryStore.values()) {
        if (item.id === numericId) return item;
      }
    } else {
      const key = String(idOrResearchId);
      if (this.memoryStore.has(key)) return this.memoryStore.get(key)!;
    }

    return null;
  }

  /**
   * Query research items with flexible search, filtering, and pagination
   */
  public async getResearchItems(filter: ResearchFilterQuery): Promise<ResearchSearchResult> {
    const limit = filter.limit && filter.limit > 0 ? filter.limit : 50;
    const offset = filter.offset && filter.offset >= 0 ? filter.offset : 0;

    try {
      const db = getDb();
      const conditions: any[] = [];

      if (filter.category) {
        conditions.push(eq(researchItems.category, filter.category));
      }

      if (filter.status) {
        conditions.push(eq(researchItems.status, filter.status));
      }

      if (filter.organizationId) {
        conditions.push(eq(researchItems.organizationId, filter.organizationId));
      }

      if (filter.source) {
        conditions.push(ilike(researchItems.source, `%${filter.source}%`));
      }

      if (filter.fromDate) {
        conditions.push(gte(researchItems.createdAt, new Date(filter.fromDate)));
      }

      if (filter.toDate) {
        conditions.push(lte(researchItems.createdAt, new Date(filter.toDate)));
      }

      if (filter.keyword) {
        const kw = `%${filter.keyword}%`;
        conditions.push(
          or(
            ilike(researchItems.title, kw),
            ilike(researchItems.content, kw),
            ilike(researchItems.summary, kw),
            ilike(researchItems.source, kw),
            ilike(researchItems.author, kw)
          )
        );
      }

      const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

      const rows = await db
        .select()
        .from(researchItems)
        .where(whereClause)
        .orderBy(desc(researchItems.createdAt))
        .limit(limit)
        .offset(offset);

      let items = rows.map((r) => this.mapRowToResearchItem(r));

      if (filter.tag) {
        const tagLower = filter.tag.toLowerCase();
        items = items.filter((item) => item.tags.some((t) => t.toLowerCase().includes(tagLower)));
      }

      // Populate memory cache
      items.forEach((item) => this.memoryStore.set(item.researchId, item));

      return {
        items,
        total: items.length,
        limit,
        offset,
        filter,
      };
    } catch (error: any) {
      logger.warn({ type: "RESEARCH_REPO_WARN", error: error.message }, "Memory fallback for getResearchItems");

      let items = Array.from(this.memoryStore.values());

      if (filter.category) {
        items = items.filter((i) => i.category === filter.category);
      }
      if (filter.status) {
        items = items.filter((i) => i.status === filter.status);
      }
      if (filter.source) {
        items = items.filter((i) => i.source && i.source.toLowerCase().includes(filter.source!.toLowerCase()));
      }
      if (filter.tag) {
        items = items.filter((i) => i.tags.some((t) => t.toLowerCase().includes(filter.tag!.toLowerCase())));
      }
      if (filter.keyword) {
        const kw = filter.keyword.toLowerCase();
        items = items.filter(
          (i) =>
            i.title.toLowerCase().includes(kw) ||
            i.content.toLowerCase().includes(kw) ||
            (i.summary && i.summary.toLowerCase().includes(kw))
        );
      }

      const total = items.length;
      const paginated = items.slice(offset, offset + limit);

      return {
        items: paginated,
        total,
        limit,
        offset,
        filter,
      };
    }
  }

  /**
   * Update an existing research item
   */
  public async updateResearchItem(
    idOrResearchId: string | number,
    dto: UpdateResearchDTO,
    operator: string = "SYSTEM"
  ): Promise<ResearchItem> {
    const existing = await this.getResearchItemById(idOrResearchId);
    if (!existing) {
      throw new Error(RESEARCH_ERRORS.NOT_FOUND);
    }

    const updatedTitle = dto.title !== undefined ? dto.title : existing.title;
    const updatedContent = dto.content !== undefined ? dto.content : existing.content;
    const updatedSummary = dto.summary !== undefined ? dto.summary : existing.summary;
    const updatedCategory = dto.category !== undefined ? dto.category : existing.category;
    const updatedStatus = dto.status !== undefined ? dto.status : existing.status;
    const updatedSource = dto.source !== undefined ? dto.source : existing.source;
    const updatedSourceUrl = dto.sourceUrl !== undefined ? dto.sourceUrl : existing.sourceUrl;
    const updatedAuthor = dto.author !== undefined ? dto.author : existing.author;
    const updatedTags = dto.tags !== undefined ? dto.tags : existing.tags;
    const updatedMetadata = dto.metadata !== undefined ? { ...existing.metadata, ...dto.metadata } : existing.metadata;

    try {
      const db = getDb();
      await db
        .update(researchItems)
        .set({
          title: updatedTitle,
          content: updatedContent,
          summary: updatedSummary,
          category: updatedCategory,
          status: updatedStatus,
          source: updatedSource,
          sourceUrl: updatedSourceUrl,
          author: updatedAuthor,
          tags: updatedTags,
          metadata: updatedMetadata,
          updatedAt: new Date(),
        })
        .where(eq(researchItems.researchId, existing.researchId));

      await this.constitutionRepo.recordAuditLog(
        "RESEARCH_UPDATED",
        "RESEARCH_ITEM",
        existing.researchId,
        operator,
        { title: updatedTitle, category: updatedCategory, status: updatedStatus }
      );
    } catch (error: any) {
      logger.warn({ type: "RESEARCH_REPO_WARN", error: error.message }, "Memory fallback for updateResearchItem");
    }

    const updatedItem: ResearchItem = {
      ...existing,
      title: updatedTitle,
      content: updatedContent,
      summary: updatedSummary,
      category: updatedCategory,
      status: updatedStatus,
      source: updatedSource,
      sourceUrl: updatedSourceUrl,
      author: updatedAuthor,
      tags: updatedTags,
      metadata: updatedMetadata,
      updatedAt: new Date(),
    };

    this.memoryStore.set(existing.researchId, updatedItem);
    return updatedItem;
  }

  /**
   * Delete or archive a research item
   */
  public async deleteResearchItem(idOrResearchId: string | number, operator: string = "SYSTEM"): Promise<boolean> {
    const existing = await this.getResearchItemById(idOrResearchId);
    if (!existing) {
      throw new Error(RESEARCH_ERRORS.NOT_FOUND);
    }

    try {
      const db = getDb();
      await db.delete(researchItems).where(eq(researchItems.researchId, existing.researchId));

      await this.constitutionRepo.recordAuditLog(
        "RESEARCH_DELETED",
        "RESEARCH_ITEM",
        existing.researchId,
        operator,
        { title: existing.title }
      );
    } catch (error: any) {
      logger.warn({ type: "RESEARCH_REPO_WARN", error: error.message }, "Memory fallback for deleteResearchItem");
    }

    this.memoryStore.delete(existing.researchId);
    return true;
  }

  /**
   * Get all research categories
   */
  public async getResearchCategories(): Promise<ResearchCategoryInfo[]> {
    try {
      const db = getDb();
      const rows = await db.select().from(researchCategories);
      if (rows && rows.length > 0) {
        return rows.map((r) => ({
          categoryId: r.categoryId,
          name: r.name,
          description: r.description || "",
          isSystem: r.isSystem,
        }));
      }
    } catch (error: any) {
      logger.warn({ type: "RESEARCH_REPO_WARN", error: error.message }, "Using system research categories registry");
    }

    return ResearchRegistry.getCategories();
  }

  /**
   * Get research center summary
   */
  public async getResearchCenterSummary(): Promise<ResearchCenterSummary> {
    const categories = await this.getResearchCategories();
    const statuses = Object.values(RESEARCH_STATUSES);
    const searchRes = await this.getResearchItems({ limit: 10 });

    const statusCounts: Record<string, number> = {};
    statuses.forEach((s) => (statusCounts[s] = 0));

    const categoryCounts: Record<string, number> = {};
    categories.forEach((c) => (categoryCounts[c.name] = 0));

    const allRes = await this.getResearchItems({ limit: 1000 });
    allRes.items.forEach((item) => {
      if (statusCounts[item.status] !== undefined) statusCounts[item.status]++;
      if (categoryCounts[item.category] !== undefined) categoryCounts[item.category]++;
    });

    return {
      totalItems: allRes.total,
      statusCounts,
      categoryCounts,
      categories,
      statuses,
      latestItems: searchRes.items,
    };
  }
}
