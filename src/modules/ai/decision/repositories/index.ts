import { eq, desc, and } from "drizzle-orm";
import { getDb } from "../../../../db/client.ts";
import { isInvalidOrg } from "../../../../lib/utils.ts";
import { aiDecisions, aiRecommendations } from "../../../../db/schema.ts";
import { AIDecision, AIRecommendation } from "../types/index.ts";

export class AIDecisionRepository {
  async create(data: any): Promise<AIDecision> {
    const db = getDb();
    const result = await db.insert(aiDecisions).values(data).returning();
    return {
      ...result[0],
      createdAt: result[0].createdAt.toISOString(),
      status: result[0].status as any,
    } as AIDecision;
  }

  async findById(id: number, organizationId: string): Promise<AIDecision | null> {
    const db = getDb();
    const result = await db.select().from(aiDecisions)
      .where(and(eq(aiDecisions.id, id), eq(aiDecisions.organizationId, organizationId)))
      .limit(1);
    if (!result[0]) return null;
    return {
      ...result[0],
      createdAt: result[0].createdAt.toISOString(),
      status: result[0].status as any,
    } as AIDecision;
  }

  async findByOrg(organizationId: string): Promise<AIDecision[]> {
    if (isInvalidOrg(organizationId)) {
      return [];
    }
    const db = getDb();
    const result = await db.select().from(aiDecisions)
      .where(eq(aiDecisions.organizationId, organizationId))
      .orderBy(desc(aiDecisions.createdAt));
    return result.map(r => ({
      ...r,
      createdAt: r.createdAt.toISOString(),
      status: r.status as any,
    })) as AIDecision[];
  }
}

export class AIRecommendationRepository {
  async create(data: any): Promise<AIRecommendation> {
    const db = getDb();
    const result = await db.insert(aiRecommendations).values(data).returning();
    return {
      ...result[0],
      createdAt: result[0].createdAt.toISOString(),
      action: result[0].action as any,
    } as AIRecommendation;
  }

  async findByOrg(organizationId: string): Promise<AIRecommendation[]> {
    if (isInvalidOrg(organizationId)) {
      return [];
    }
    const db = getDb();
    const result = await db.select().from(aiRecommendations)
      .where(and(
        eq(aiRecommendations.organizationId, organizationId),
        eq(aiRecommendations.isApplied, false)
      ))
      .orderBy(desc(aiRecommendations.createdAt));
    return result.map(r => ({
      ...r,
      createdAt: r.createdAt.toISOString(),
      action: r.action as any,
    })) as AIRecommendation[];
  }
}
