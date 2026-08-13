import { eq, desc, sql } from "drizzle-orm";
import { getDb } from "../../../../db/client.ts";
import {
  aiLearningHistory,
  aiLearningFeedback
} from "../../../../db/schema.ts";

export interface CreateLearningHistoryInput {
  modelId: string;
  successPatterns: any[];
  failurePatterns: any[];
  researchOutcomes: any[];
  consensusOutcomes: any[];
  knowledgeUpdates: any[];
  historicalBehavior: any[];
}

export interface CreateLearningFeedbackInput {
  modelId: string;
  strengths: string[];
  weaknesses: string[];
  recurringErrors: string[];
  missingEvidence: string[];
  reasoningGaps: string[];
  improvementSuggestions: string[];
  confidenceCalibration: number;
}

export class LearningEngineRepository {
  async ensureTablesExist(): Promise<void> {
    const db = getDb();
    try {
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS ai_learning_history (
          id SERIAL PRIMARY KEY,
          model_id VARCHAR(50) NOT NULL,
          success_patterns JSONB DEFAULT '[]',
          failure_patterns JSONB DEFAULT '[]',
          research_outcomes JSONB DEFAULT '[]',
          consensus_outcomes JSONB DEFAULT '[]',
          knowledge_updates JSONB DEFAULT '[]',
          historical_behavior JSONB DEFAULT '[]',
          created_at TIMESTAMP DEFAULT NOW() NOT NULL
        );

        CREATE TABLE IF NOT EXISTS ai_learning_feedback (
          id SERIAL PRIMARY KEY,
          model_id VARCHAR(50) NOT NULL,
          strengths JSONB DEFAULT '[]',
          weaknesses JSONB DEFAULT '[]',
          recurring_errors JSONB DEFAULT '[]',
          missing_evidence JSONB DEFAULT '[]',
          reasoning_gaps JSONB DEFAULT '[]',
          improvement_suggestions JSONB DEFAULT '[]',
          confidence_calibration DOUBLE PRECISION NOT NULL DEFAULT 1.0,
          created_at TIMESTAMP DEFAULT NOW() NOT NULL
        );
      `);
    } catch (err: any) {
      console.error("Failed to verify/create learning tables:", err);
    }
  }

  async saveLearningHistory(data: CreateLearningHistoryInput): Promise<any> {
    await this.ensureTablesExist();
    const db = getDb();
    const result = await db.insert(aiLearningHistory).values(data).returning();
    return result[0];
  }

  async getLearningHistory(modelId?: string): Promise<any[]> {
    await this.ensureTablesExist();
    const db = getDb();
    if (modelId) {
      return db.select().from(aiLearningHistory)
        .where(eq(aiLearningHistory.modelId, modelId))
        .orderBy(desc(aiLearningHistory.createdAt));
    }
    return db.select().from(aiLearningHistory).orderBy(desc(aiLearningHistory.createdAt));
  }

  async saveLearningFeedback(data: CreateLearningFeedbackInput): Promise<any> {
    await this.ensureTablesExist();
    const db = getDb();
    const result = await db.insert(aiLearningFeedback).values(data).returning();
    return result[0];
  }

  async getLearningFeedback(modelId?: string): Promise<any[]> {
    await this.ensureTablesExist();
    const db = getDb();
    if (modelId) {
      return db.select().from(aiLearningFeedback)
        .where(eq(aiLearningFeedback.modelId, modelId))
        .orderBy(desc(aiLearningFeedback.createdAt));
    }
    return db.select().from(aiLearningFeedback).orderBy(desc(aiLearningFeedback.createdAt));
  }
}
