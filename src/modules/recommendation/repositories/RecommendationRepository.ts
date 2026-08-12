import { getDb } from "../../../db/client";
import { sql } from "drizzle-orm";

export class RecommendationRepository {
  async ensureTables(): Promise<void> {
    const db = getDb();
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS enterprise_recommendations (
        id VARCHAR(64) PRIMARY KEY,
        organization_id VARCHAR(64) NOT NULL,
        entity_id VARCHAR(64) NOT NULL,
        type VARCHAR(32) NOT NULL,
        content TEXT NOT NULL,
        priority VARCHAR(16) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS enterprise_recommendation_history (
        id VARCHAR(64) PRIMARY KEY,
        recommendation_id VARCHAR(64) NOT NULL,
        status VARCHAR(32) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS enterprise_ai_insights (
        id VARCHAR(64) PRIMARY KEY,
        organization_id VARCHAR(64) NOT NULL,
        insight_type VARCHAR(32) NOT NULL,
        content TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS enterprise_strategy_recommendations (
        id VARCHAR(64) PRIMARY KEY,
        recommendation_id VARCHAR(64) NOT NULL,
        strategy_data JSONB NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS enterprise_portfolio_recommendations (
        id VARCHAR(64) PRIMARY KEY,
        recommendation_id VARCHAR(64) NOT NULL,
        portfolio_data JSONB NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS enterprise_risk_insights (
        id VARCHAR(64) PRIMARY KEY,
        organization_id VARCHAR(64) NOT NULL,
        risk_data JSONB NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS enterprise_market_insights (
        id VARCHAR(64) PRIMARY KEY,
        organization_id VARCHAR(64) NOT NULL,
        market_data JSONB NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS enterprise_priority_queue (
        id VARCHAR(64) PRIMARY KEY,
        organization_id VARCHAR(64) NOT NULL,
        recommendation_id VARCHAR(64) NOT NULL,
        priority VARCHAR(16) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS enterprise_recommendation_lifecycle (
        id VARCHAR(64) PRIMARY KEY,
        recommendation_id VARCHAR(64) NOT NULL,
        status VARCHAR(32) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
  }
}

export const recommendationRepository = new RecommendationRepository();
