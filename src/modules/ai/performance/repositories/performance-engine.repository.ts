import { eq, desc, sql } from "drizzle-orm";
import { getDb } from "../../../../db/client.ts";
import {
  aiPerformance,
  aiPerformanceMetrics,
  aiScorecards,
  aiBenchmarks,
  aiRankings
} from "../../../../db/schema.ts";

export interface CreatePerformanceInput {
  modelId: string;
  responseTime: number;
  reasoningDepth: number;
  evidenceCoverage: number;
  confidenceStability: number;
  researchQuality: number;
  consensusContribution: number;
  accuracy: number;
  reliability: number;
  latency: number;
  tokensUsed: number;
  cost: number;
}

export interface CreatePerformanceMetricsInput {
  modelId: string;
  rollingAccuracy: number;
  movingAccuracy: number;
  trendAnalysis: any;
  performanceDrift: number;
  regressionDetected: boolean;
  improvementRate: number;
  decayRate: number;
  benchmarkComparison: any;
}

export class PerformanceEngineRepository {
  async ensureTablesExist(): Promise<void> {
    const db = getDb();
    try {
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS ai_performance (
          id SERIAL PRIMARY KEY,
          model_id VARCHAR(50) NOT NULL,
          response_time DOUBLE PRECISION NOT NULL DEFAULT 0,
          reasoning_depth DOUBLE PRECISION NOT NULL DEFAULT 0,
          evidence_coverage DOUBLE PRECISION NOT NULL DEFAULT 0,
          confidence_stability DOUBLE PRECISION NOT NULL DEFAULT 0,
          research_quality DOUBLE PRECISION NOT NULL DEFAULT 0,
          consensus_contribution DOUBLE PRECISION NOT NULL DEFAULT 0,
          accuracy DOUBLE PRECISION NOT NULL DEFAULT 0,
          reliability DOUBLE PRECISION NOT NULL DEFAULT 0,
          latency DOUBLE PRECISION NOT NULL DEFAULT 0,
          tokens_used INTEGER NOT NULL DEFAULT 0,
          cost DOUBLE PRECISION NOT NULL DEFAULT 0,
          timestamp TIMESTAMP DEFAULT NOW() NOT NULL
        );

        CREATE TABLE IF NOT EXISTS ai_performance_metrics (
          id SERIAL PRIMARY KEY,
          model_id VARCHAR(50) NOT NULL,
          rolling_accuracy DOUBLE PRECISION NOT NULL DEFAULT 0,
          moving_accuracy DOUBLE PRECISION NOT NULL DEFAULT 0,
          trend_analysis JSONB DEFAULT '{}',
          performance_drift DOUBLE PRECISION NOT NULL DEFAULT 0,
          regression_detected BOOLEAN NOT NULL DEFAULT FALSE,
          improvement_rate DOUBLE PRECISION NOT NULL DEFAULT 0,
          decay_rate DOUBLE PRECISION NOT NULL DEFAULT 0,
          benchmark_comparison JSONB DEFAULT '{}',
          created_at TIMESTAMP DEFAULT NOW() NOT NULL
        );
      `);
    } catch (err: any) {
      console.error("Failed to verify/create performance tables:", err);
    }
  }

  async savePerformance(data: CreatePerformanceInput): Promise<any> {
    await this.ensureTablesExist();
    const db = getDb();
    const result = await db.insert(aiPerformance).values(data).returning();
    return result[0];
  }

  async getPerformanceHistory(modelId?: string): Promise<any[]> {
    await this.ensureTablesExist();
    const db = getDb();
    if (modelId) {
      return db.select().from(aiPerformance)
        .where(eq(aiPerformance.modelId, modelId))
        .orderBy(desc(aiPerformance.timestamp));
    }
    return db.select().from(aiPerformance).orderBy(desc(aiPerformance.timestamp));
  }

  async savePerformanceMetrics(data: CreatePerformanceMetricsInput): Promise<any> {
    await this.ensureTablesExist();
    const db = getDb();
    const result = await db.insert(aiPerformanceMetrics).values(data).returning();
    return result[0];
  }

  async getPerformanceMetrics(modelId?: string): Promise<any[]> {
    await this.ensureTablesExist();
    const db = getDb();
    if (modelId) {
      return db.select().from(aiPerformanceMetrics)
        .where(eq(aiPerformanceMetrics.modelId, modelId))
        .orderBy(desc(aiPerformanceMetrics.createdAt));
    }
    return db.select().from(aiPerformanceMetrics).orderBy(desc(aiPerformanceMetrics.createdAt));
  }

  async saveScorecard(data: any): Promise<void> {
    await this.ensureTablesExist();
    const db = getDb();
    const existing = await db.select().from(aiScorecards).where(eq(aiScorecards.modelId, data.modelId)).limit(1);
    if (existing && existing.length > 0) {
      await db.update(aiScorecards).set({ ...data, updatedAt: new Date() }).where(eq(aiScorecards.modelId, data.modelId));
    } else {
      await db.insert(aiScorecards).values({
        id: `card_${data.modelId}`,
        ...data,
        updatedAt: new Date()
      });
    }
  }

  async getScorecard(modelId: string): Promise<any | null> {
    await this.ensureTablesExist();
    const db = getDb();
    const result = await db.select().from(aiScorecards).where(eq(aiScorecards.modelId, modelId)).limit(1);
    return result[0] || null;
  }

  async getAllScorecards(): Promise<any[]> {
    await this.ensureTablesExist();
    const db = getDb();
    return db.select().from(aiScorecards).orderBy(desc(aiScorecards.updatedAt));
  }

  async saveRanking(data: any): Promise<void> {
    await this.ensureTablesExist();
    const db = getDb();
    const existing = await db.select().from(aiRankings).where(eq(aiRankings.id, data.id)).limit(1);
    if (existing && existing.length > 0) {
      await db.update(aiRankings).set({ ...data, updatedAt: new Date() }).where(eq(aiRankings.id, data.id));
    } else {
      await db.insert(aiRankings).values({
        updatedAt: new Date(),
        ...data
      });
    }
  }

  async getRankings(): Promise<any[]> {
    await this.ensureTablesExist();
    const db = getDb();
    return db.select().from(aiRankings).orderBy(aiRankings.rank);
  }

  async getBenchmarks(): Promise<any[]> {
    await this.ensureTablesExist();
    const db = getDb();
    return db.select().from(aiBenchmarks).orderBy(desc(aiBenchmarks.timestamp));
  }
}
