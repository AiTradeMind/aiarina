import { getDb } from "../../../db/client.ts";
import {
  brainKnowledge,
  brainMemory,
  brainContext,
  brainFoundationSessions,
  brainMetadata,
} from "../../../db/schema.ts";
import { eq, desc, and, gte, like, sql } from "drizzle-orm";
import {
  BrainKnowledgeItem,
  CreateKnowledgeDTO,
  QueryKnowledgeDTO,
  BrainMemoryRecord,
  StoreMemoryDTO,
  QueryMemoryDTO,
  BrainContextRecord,
  BuildContextDTO,
  QueryContextDTO,
  BrainSessionRecord,
  CreateSessionDTO,
  BrainMetadataRecord,
} from "../types/index.ts";
import logger from "../../../lib/logger.ts";

export class BrainRepository {
  // Memory fallbacks for high resiliency
  private static knowledgeStore: Map<string, BrainKnowledgeItem> = new Map();
  private static memoryStore: Map<string, BrainMemoryRecord> = new Map();
  private static contextStore: Map<string, BrainContextRecord> = new Map();
  private static sessionStore: Map<string, BrainSessionRecord> = new Map();
  private static metadataStore: Map<string, BrainMetadataRecord> = new Map();

  // ==========================================
  // Knowledge Operations
  // ==========================================

  public async createKnowledge(dto: CreateKnowledgeDTO): Promise<BrainKnowledgeItem> {
    const knowledgeId = `KNW-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const now = new Date();

    const record: BrainKnowledgeItem = {
      knowledgeId,
      researchId: dto.researchId || null,
      knowledgeType: dto.knowledgeType,
      title: dto.title,
      summary: dto.summary || null,
      content: dto.content,
      tags: dto.tags || [],
      confidence: dto.confidence ?? 85.0,
      source: dto.source || "SYSTEM",
      metadata: dto.metadata || {},
      createdAt: now,
      updatedAt: now,
    };

    BrainRepository.knowledgeStore.set(knowledgeId, record);

    try {
      const db = getDb();
      await db.insert(brainKnowledge).values({
        knowledgeId: record.knowledgeId,
        researchId: record.researchId,
        knowledgeType: record.knowledgeType,
        title: record.title,
        summary: record.summary,
        content: record.content,
        tags: record.tags as any,
        confidence: String(record.confidence),
        source: record.source,
        metadata: record.metadata as any,
      });
    } catch (err: any) {
      logger.warn({ type: "BRAIN_REPO_WARN", error: err.message }, "Fallback to memory store for createKnowledge");
    }

    return record;
  }

  public async getKnowledgeById(knowledgeId: string): Promise<BrainKnowledgeItem | null> {
    try {
      const db = getDb();
      const rows = await db
        .select()
        .from(brainKnowledge)
        .where(eq(brainKnowledge.knowledgeId, knowledgeId))
        .limit(1);

      if (rows.length > 0) {
        const r = rows[0];
        return {
          id: r.id,
          knowledgeId: r.knowledgeId,
          researchId: r.researchId,
          knowledgeType: r.knowledgeType as any,
          title: r.title,
          summary: r.summary,
          content: r.content,
          tags: (r.tags as string[]) || [],
          confidence: Number(r.confidence),
          source: r.source,
          metadata: (r.metadata as Record<string, any>) || {},
          createdAt: r.createdAt ? new Date(r.createdAt) : new Date(),
          updatedAt: r.updatedAt ? new Date(r.updatedAt) : new Date(),
        };
      }
    } catch (err: any) {
      logger.warn({ type: "BRAIN_REPO_WARN", error: err.message }, "Fallback to memory store for getKnowledgeById");
    }

    return BrainRepository.knowledgeStore.get(knowledgeId) || null;
  }

  public async queryKnowledge(query: QueryKnowledgeDTO = {}): Promise<BrainKnowledgeItem[]> {
    try {
      const db = getDb();
      const conditions = [];

      if (query.knowledgeType) {
        conditions.push(eq(brainKnowledge.knowledgeType, query.knowledgeType));
      }
      if (query.researchId) {
        conditions.push(eq(brainKnowledge.researchId, query.researchId));
      }

      let q = db.select().from(brainKnowledge);
      if (conditions.length > 0) {
        q = q.where(and(...conditions)) as any;
      }

      const rows = await q.orderBy(desc(brainKnowledge.createdAt)).limit(query.limit || 100);
      if (rows.length > 0) {
        let results = rows.map((r) => ({
          id: r.id,
          knowledgeId: r.knowledgeId,
          researchId: r.researchId,
          knowledgeType: r.knowledgeType as any,
          title: r.title,
          summary: r.summary,
          content: r.content,
          tags: (r.tags as string[]) || [],
          confidence: Number(r.confidence),
          source: r.source,
          metadata: (r.metadata as Record<string, any>) || {},
          createdAt: r.createdAt ? new Date(r.createdAt) : new Date(),
          updatedAt: r.updatedAt ? new Date(r.updatedAt) : new Date(),
        }));

        if (query.minConfidence !== undefined) {
          results = results.filter((k) => (k.confidence || 0) >= query.minConfidence!);
        }
        if (query.tag) {
          const lowerTag = query.tag.toLowerCase();
          results = results.filter((k) => k.tags?.some((t) => t.toLowerCase() === lowerTag));
        }
        if (query.keyword) {
          const kw = query.keyword.toLowerCase();
          results = results.filter(
            (k) =>
              k.title.toLowerCase().includes(kw) ||
              k.content.toLowerCase().includes(kw) ||
              k.summary?.toLowerCase().includes(kw)
          );
        }

        return results;
      }
    } catch (err: any) {
      logger.warn({ type: "BRAIN_REPO_WARN", error: err.message }, "Fallback to memory store for queryKnowledge");
    }

    let items = Array.from(BrainRepository.knowledgeStore.values());
    if (query.knowledgeType) items = items.filter((i) => i.knowledgeType === query.knowledgeType);
    if (query.researchId) items = items.filter((i) => i.researchId === query.researchId);
    if (query.minConfidence !== undefined) items = items.filter((i) => (i.confidence || 0) >= query.minConfidence!);
    if (query.tag) {
      const lowerTag = query.tag.toLowerCase();
      items = items.filter((i) => i.tags?.some((t) => t.toLowerCase() === lowerTag));
    }
    if (query.keyword) {
      const kw = query.keyword.toLowerCase();
      items = items.filter(
        (i) =>
          i.title.toLowerCase().includes(kw) ||
          i.content.toLowerCase().includes(kw) ||
          i.summary?.toLowerCase().includes(kw)
      );
    }
    return items.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()).slice(0, query.limit || 100);
  }

  // ==========================================
  // Memory Operations
  // ==========================================

  public async storeMemory(dto: StoreMemoryDTO): Promise<BrainMemoryRecord> {
    const memoryId = `MEM-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const now = new Date();

    const record: BrainMemoryRecord = {
      memoryId,
      memoryType: dto.memoryType,
      key: dto.key,
      value: dto.value,
      sessionId: dto.sessionId || null,
      ttl: dto.ttl || null,
      metadata: dto.metadata || {},
      createdAt: now,
      updatedAt: now,
    };

    BrainRepository.memoryStore.set(memoryId, record);
    // Also index by key
    BrainRepository.memoryStore.set(`KEY:${dto.key}`, record);

    try {
      const db = getDb();
      await db.insert(brainMemory).values({
        memoryId: record.memoryId,
        memoryType: record.memoryType,
        key: record.key,
        value: record.value as any,
        sessionId: record.sessionId,
        ttl: record.ttl,
        metadata: record.metadata as any,
      });
    } catch (err: any) {
      logger.warn({ type: "BRAIN_REPO_WARN", error: err.message }, "Fallback to memory store for storeMemory");
    }

    return record;
  }

  public async getMemoryByKey(key: string): Promise<BrainMemoryRecord | null> {
    try {
      const db = getDb();
      const rows = await db
        .select()
        .from(brainMemory)
        .where(eq(brainMemory.key, key))
        .orderBy(desc(brainMemory.createdAt))
        .limit(1);

      if (rows.length > 0) {
        const r = rows[0];
        return {
          id: r.id,
          memoryId: r.memoryId,
          memoryType: r.memoryType as any,
          key: r.key,
          value: r.value as any,
          sessionId: r.sessionId,
          ttl: r.ttl,
          metadata: (r.metadata as Record<string, any>) || {},
          createdAt: r.createdAt ? new Date(r.createdAt) : new Date(),
          updatedAt: r.updatedAt ? new Date(r.updatedAt) : new Date(),
        };
      }
    } catch (err: any) {
      logger.warn({ type: "BRAIN_REPO_WARN", error: err.message }, "Fallback to memory store for getMemoryByKey");
    }

    return BrainRepository.memoryStore.get(`KEY:${key}`) || null;
  }

  public async queryMemory(query: QueryMemoryDTO = {}): Promise<BrainMemoryRecord[]> {
    try {
      const db = getDb();
      const conditions = [];

      if (query.memoryType) {
        conditions.push(eq(brainMemory.memoryType, query.memoryType));
      }
      if (query.key) {
        conditions.push(eq(brainMemory.key, query.key));
      }
      if (query.sessionId) {
        conditions.push(eq(brainMemory.sessionId, query.sessionId));
      }

      let q = db.select().from(brainMemory);
      if (conditions.length > 0) {
        q = q.where(and(...conditions)) as any;
      }

      const rows = await q.orderBy(desc(brainMemory.createdAt)).limit(query.limit || 100);
      if (rows.length > 0) {
        return rows.map((r) => ({
          id: r.id,
          memoryId: r.memoryId,
          memoryType: r.memoryType as any,
          key: r.key,
          value: r.value as any,
          sessionId: r.sessionId,
          ttl: r.ttl,
          metadata: (r.metadata as Record<string, any>) || {},
          createdAt: r.createdAt ? new Date(r.createdAt) : new Date(),
          updatedAt: r.updatedAt ? new Date(r.updatedAt) : new Date(),
        }));
      }
    } catch (err: any) {
      logger.warn({ type: "BRAIN_REPO_WARN", error: err.message }, "Fallback to memory store for queryMemory");
    }

    let items = Array.from(BrainRepository.memoryStore.values()).filter((m) => m.memoryId.startsWith("MEM-"));
    if (query.memoryType) items = items.filter((m) => m.memoryType === query.memoryType);
    if (query.key) items = items.filter((m) => m.key === query.key);
    if (query.sessionId) items = items.filter((m) => m.sessionId === query.sessionId);

    return items.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()).slice(0, query.limit || 100);
  }

  // ==========================================
  // Context Operations
  // ==========================================

  public async saveContext(
    dto: {
      contextType: string;
      title: string;
      payload: Record<string, any>;
      reasoning?: string;
      confidenceScore?: number;
      metadata?: Record<string, any>;
    }
  ): Promise<BrainContextRecord> {
    const contextId = `CTX-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const now = new Date();

    const record: BrainContextRecord = {
      contextId,
      contextType: dto.contextType as any,
      title: dto.title,
      payload: dto.payload,
      reasoning: dto.reasoning || null,
      confidenceScore: dto.confidenceScore ?? 85.0,
      metadata: dto.metadata || {},
      createdAt: now,
    };

    BrainRepository.contextStore.set(contextId, record);

    try {
      const db = getDb();
      await db.insert(brainContext).values({
        contextId: record.contextId,
        contextType: record.contextType,
        title: record.title,
        payload: record.payload as any,
        reasoning: record.reasoning,
        confidenceScore: String(record.confidenceScore),
        metadata: record.metadata as any,
      });
    } catch (err: any) {
      logger.warn({ type: "BRAIN_REPO_WARN", error: err.message }, "Fallback to memory store for saveContext");
    }

    return record;
  }

  public async queryContext(query: QueryContextDTO = {}): Promise<BrainContextRecord[]> {
    try {
      const db = getDb();
      const conditions = [];

      if (query.contextType) {
        conditions.push(eq(brainContext.contextType, query.contextType));
      }
      if (query.contextId) {
        conditions.push(eq(brainContext.contextId, query.contextId));
      }

      let q = db.select().from(brainContext);
      if (conditions.length > 0) {
        q = q.where(and(...conditions)) as any;
      }

      const rows = await q.orderBy(desc(brainContext.createdAt)).limit(query.limit || 100);
      if (rows.length > 0) {
        return rows.map((r) => ({
          id: r.id,
          contextId: r.contextId,
          contextType: r.contextType as any,
          title: r.title,
          payload: r.payload as any,
          reasoning: r.reasoning,
          confidenceScore: Number(r.confidenceScore),
          metadata: (r.metadata as Record<string, any>) || {},
          createdAt: r.createdAt ? new Date(r.createdAt) : new Date(),
        }));
      }
    } catch (err: any) {
      logger.warn({ type: "BRAIN_REPO_WARN", error: err.message }, "Fallback to memory store for queryContext");
    }

    let items = Array.from(BrainRepository.contextStore.values());
    if (query.contextType) items = items.filter((c) => c.contextType === query.contextType);
    if (query.contextId) items = items.filter((c) => c.contextId === query.contextId);

    return items.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()).slice(0, query.limit || 100);
  }

  // ==========================================
  // Session & Metadata Operations
  // ==========================================

  public async createSession(dto: CreateSessionDTO = {}): Promise<BrainSessionRecord> {
    const sessionId = `SES-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const now = new Date();

    const record: BrainSessionRecord = {
      sessionId,
      userId: dto.userId || "SYSTEM",
      status: "ACTIVE",
      memorySummary: dto.memorySummary || {},
      activeContextId: dto.activeContextId || null,
      createdAt: now,
      updatedAt: now,
    };

    BrainRepository.sessionStore.set(sessionId, record);

    try {
      const db = getDb();
      await db.insert(brainFoundationSessions).values({
        sessionId: record.sessionId,
        userId: record.userId,
        status: record.status,
        memorySummary: record.memorySummary as any,
        activeContextId: record.activeContextId,
      });
    } catch (err: any) {
      logger.warn({ type: "BRAIN_REPO_WARN", error: err.message }, "Fallback to memory store for createSession");
    }

    return record;
  }

  public async countAll(): Promise<{
    knowledgeCount: number;
    memoryCount: number;
    contextCount: number;
    sessionCount: number;
  }> {
    const memKnowledge = BrainRepository.knowledgeStore.size;
    const memMemory = Array.from(BrainRepository.memoryStore.keys()).filter((k) => k.startsWith("MEM-")).length;
    const memContext = BrainRepository.contextStore.size;
    const memSession = BrainRepository.sessionStore.size;

    try {
      const db = getDb();
      const [kRows] = await db.select({ count: sql<number>`count(*)` }).from(brainKnowledge);
      const [mRows] = await db.select({ count: sql<number>`count(*)` }).from(brainMemory);
      const [cRows] = await db.select({ count: sql<number>`count(*)` }).from(brainContext);
      const [sRows] = await db.select({ count: sql<number>`count(*)` }).from(brainFoundationSessions);

      return {
        knowledgeCount: Math.max(Number(kRows?.count || 0), memKnowledge),
        memoryCount: Math.max(Number(mRows?.count || 0), memMemory),
        contextCount: Math.max(Number(cRows?.count || 0), memContext),
        sessionCount: Math.max(Number(sRows?.count || 0), memSession),
      };
    } catch (err) {
      return {
        knowledgeCount: memKnowledge,
        memoryCount: memMemory,
        contextCount: memContext,
        sessionCount: memSession,
      };
    }
  }
}
