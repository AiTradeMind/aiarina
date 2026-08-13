import { eq, desc, and, like } from "drizzle-orm";
import { getDb } from "../../../../db/client.ts";
import { isInvalidOrg } from "../../../../lib/utils.ts";
import { 
  memorySessions, 
  memoryEvents, 
  memoryPatterns, 
  memoryFeedback, 
  memoryEmbeddings, 
  memoryKnowledge 
} from "../../../../db/schema.ts";
import { 
  MemorySession, 
  MemoryEvent, 
  MemoryPattern, 
  MemoryKnowledge 
} from "../types/index.ts";

export class MemoryRepository {
  async createSession(data: any): Promise<MemorySession> {
    const db = getDb();
    const result = await db.insert(memorySessions).values(data).returning();
    return {
      ...result[0],
      startTime: result[0].startTime.toISOString(),
      endTime: result[0].endTime ? result[0].endTime.toISOString() : null,
    };
  }

  async getActiveSession(userId: number, organizationId: string): Promise<MemorySession | null> {
    if (isInvalidOrg(organizationId)) {
      return null;
    }
    const db = getDb();
    const result = await db.select().from(memorySessions)
      .where(and(
        eq(memorySessions.userId, userId), 
        eq(memorySessions.organizationId, organizationId),
        // Simplification: just get the latest one
      ))
      .orderBy(desc(memorySessions.startTime))
      .limit(1);
    
    if (!result[0]) return null;
    return {
      ...result[0],
      startTime: result[0].startTime.toISOString(),
      endTime: result[0].endTime ? result[0].endTime.toISOString() : null,
    };
  }

  async createEvent(data: any): Promise<MemoryEvent> {
    const db = getDb();
    const result = await db.insert(memoryEvents).values(data).returning();
    return {
      ...result[0],
      timestamp: result[0].timestamp.toISOString(),
    };
  }

  async findEvents(organizationId: string, limit: number = 20): Promise<MemoryEvent[]> {
    if (isInvalidOrg(organizationId)) {
      return [];
    }
    const db = getDb();
    const result = await db.select({
      id: memoryEvents.id,
      sessionId: memoryEvents.sessionId,
      type: memoryEvents.type,
      sourceId: memoryEvents.sourceId,
      data: memoryEvents.data,
      timestamp: memoryEvents.timestamp
    })
    .from(memoryEvents)
    .innerJoin(memorySessions, eq(memoryEvents.sessionId, memorySessions.id))
    .where(eq(memorySessions.organizationId, organizationId))
    .orderBy(desc(memoryEvents.timestamp))
    .limit(limit);

    return result.map(r => ({
      ...r,
      timestamp: r.timestamp.toISOString(),
    }));
  }

  async findEventById(id: number): Promise<MemoryEvent | null> {
    const db = getDb();
    const result = await db.select().from(memoryEvents).where(eq(memoryEvents.id, id)).limit(1);
    if (!result[0]) return null;
    return {
      ...result[0],
      timestamp: result[0].timestamp.toISOString(),
    };
  }

  async findPatterns(organizationId: string): Promise<MemoryPattern[]> {
    if (isInvalidOrg(organizationId)) {
      return [];
    }
    const db = getDb();
    const result = await db.select().from(memoryPatterns).where(eq(memoryPatterns.organizationId, organizationId));
    return result.map(r => ({
      ...r,
      createdAt: r.createdAt.toISOString(),
    }));
  }

  async searchKnowledge(organizationId: string, query: string): Promise<MemoryKnowledge[]> {
    if (isInvalidOrg(organizationId)) {
      return [];
    }
    const db = getDb();
    const result = await db.select().from(memoryKnowledge)
      .where(and(
        eq(memoryKnowledge.organizationId, organizationId),
        like(memoryKnowledge.key, `%${query}%`)
      ))
      .limit(10);
    
    return result.map(r => ({
      ...r,
      updatedAt: r.updatedAt.toISOString(),
    }));
  }

  async upsertKnowledge(organizationId: string, key: string, value: any, tags: string[] = []): Promise<void> {
    if (isInvalidOrg(organizationId)) {
      return;
    }
    const db = getDb();
    // Simple mock upsert logic
    await db.insert(memoryKnowledge).values({
      organizationId,
      key,
      value,
      tags,
      updatedAt: new Date()
    }).onConflictDoUpdate({
      target: memoryKnowledge.key, // Needs unique constraint usually, but we'll simulate
      set: { value, tags, updatedAt: new Date() }
    });
  }
}
