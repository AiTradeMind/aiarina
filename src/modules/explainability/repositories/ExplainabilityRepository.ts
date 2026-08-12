import { getDb } from "../../../db/client";
import { sql } from "drizzle-orm";

export class ExplainabilityRepository {
  async ensureTables(): Promise<void> {
    const db = getDb();
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS enterprise_explanations (
        id VARCHAR(64) PRIMARY KEY,
        organization_id VARCHAR(64) NOT NULL,
        decision_id VARCHAR(64) NOT NULL,
        explanation TEXT NOT NULL,
        confidence_score NUMERIC(5,4),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS enterprise_decision_evidence (
        id VARCHAR(64) PRIMARY KEY,
        decision_id VARCHAR(64) NOT NULL,
        evidence_data JSONB NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS enterprise_decision_timelines (
        id VARCHAR(64) PRIMARY KEY,
        decision_id VARCHAR(64) NOT NULL,
        timeline_data JSONB NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS enterprise_confidence_history (
        id VARCHAR(64) PRIMARY KEY,
        decision_id VARCHAR(64) NOT NULL,
        confidence_score NUMERIC(5,4) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS enterprise_reasoning_history (
        id VARCHAR(64) PRIMARY KEY,
        decision_id VARCHAR(64) NOT NULL,
        reasoning TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS enterprise_alternative_decisions (
        id VARCHAR(64) PRIMARY KEY,
        decision_id VARCHAR(64) NOT NULL,
        alternative_data JSONB NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS enterprise_explanation_versions (
        id VARCHAR(64) PRIMARY KEY,
        decision_id VARCHAR(64) NOT NULL,
        version_data JSONB NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
  }
}

export const explainabilityRepository = new ExplainabilityRepository();
