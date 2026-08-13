import { eq, desc, and } from "drizzle-orm";
import { getDb } from "../../../../db/client.ts";
import { isInvalidOrg } from "../../../../lib/utils.ts";
import { 
  aiLearningRecords, 
  aiLearningScores 
} from "../../../../db/schema.ts";
import { 
  LearningRecord, 
  LearningScore 
} from "../types/index.ts";

export class LearningRepository {
  async createRecord(data: any): Promise<LearningRecord> {
    const db = getDb();
    const result = await db.insert(aiLearningRecords).values(data).returning();
    return {
      ...result[0],
      createdAt: result[0].createdAt.toISOString(),
    };
  }

  async getScores(organizationId: string, targetType?: 'STRATEGY' | 'MODEL'): Promise<LearningScore[]> {
    if (isInvalidOrg(organizationId)) {
      return [];
    }
    const db = getDb();
    let query = db.select().from(aiLearningScores).where(eq(aiLearningScores.organizationId, organizationId));
    
    if (targetType) {
      query = db.select().from(aiLearningScores).where(and(
        eq(aiLearningScores.organizationId, organizationId),
        eq(aiLearningScores.targetType, targetType)
      ));
    }

    const result = await query.orderBy(desc(aiLearningScores.learningScore));
    return result.map(r => ({
      ...r,
      targetType: r.targetType as any,
      updatedAt: r.updatedAt.toISOString(),
    }));
  }

  async upsertScore(organizationId: string, targetId: string, targetType: 'STRATEGY' | 'MODEL', data: Partial<LearningScore>): Promise<void> {
    if (isInvalidOrg(organizationId)) {
      return;
    }
    const db = getDb();
    
    const existing = await db.select().from(aiLearningScores)
      .where(and(
        eq(aiLearningScores.organizationId, organizationId),
        eq(aiLearningScores.targetId, targetId),
        eq(aiLearningScores.targetType, targetType)
      ))
      .limit(1);

    if (existing[0]) {
      await db.update(aiLearningScores)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(aiLearningScores.id, existing[0].id));
    } else {
      await db.insert(aiLearningScores).values({
        organizationId,
        targetId,
        targetType,
        learningScore: data.learningScore || "0.5000",
        confidenceAdjustment: data.confidenceAdjustment || "0.0000",
        ranking: data.ranking || null,
        metadata: data.metadata || {},
        updatedAt: new Date()
      });
    }
  }

  async getRecords(organizationId: string): Promise<LearningRecord[]> {
    if (isInvalidOrg(organizationId)) {
      return [];
    }
    const db = getDb();
    const result = await db.select().from(aiLearningRecords)
      .where(eq(aiLearningRecords.organizationId, organizationId))
      .orderBy(desc(aiLearningRecords.createdAt));
    
    return result.map(r => ({
      ...r,
      createdAt: r.createdAt.toISOString(),
    }));
  }
}
