import { getDb } from "../../../db/client";
import { sql } from "drizzle-orm";

export class EvaluationRepository {
  async ensureTables(): Promise<void> {
    const db = getDb();
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS enterprise_evaluations (
        id VARCHAR(64) PRIMARY KEY,
        organization_id VARCHAR(64) NOT NULL,
        entity_id VARCHAR(64) NOT NULL,
        entity_type VARCHAR(32) NOT NULL,
        overall_score NUMERIC(5,4) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS enterprise_ai_scores (
        id VARCHAR(64) PRIMARY KEY,
        evaluation_id VARCHAR(64) NOT NULL,
        scores JSONB NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS enterprise_strategy_scores (
        id VARCHAR(64) PRIMARY KEY,
        evaluation_id VARCHAR(64) NOT NULL,
        scores JSONB NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS enterprise_benchmarks (
        id VARCHAR(64) PRIMARY KEY,
        benchmark_type VARCHAR(64) NOT NULL,
        data JSONB NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS enterprise_rankings (
        id VARCHAR(64) PRIMARY KEY,
        ranking_type VARCHAR(64) NOT NULL,
        rankings JSONB NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
  }

  async insertEvaluation(evalData: any): Promise<void> {
    await this.ensureTables();
    const db = getDb();
    await db.execute(sql`
      INSERT INTO enterprise_evaluations (id, organization_id, entity_id, entity_type, overall_score)
      VALUES (${evalData.id}, ${evalData.organizationId}, ${evalData.entityId}, ${evalData.entityType}, ${evalData.overallScore})
    `);
  }

  async insertScore(tableName: string, scoreData: any): Promise<void> {
    const db = getDb();
    await db.execute(sql`
      INSERT INTO ${sql.raw(tableName)} (id, evaluation_id, scores)
      VALUES (${scoreData.id}, ${scoreData.evaluationId}, ${JSON.stringify(scoreData.scores)}::jsonb)
    `);
  }
}

export const evaluationRepository = new EvaluationRepository();
