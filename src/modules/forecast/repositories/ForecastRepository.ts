import { getDb } from "../../../db/client";
import { sql } from "drizzle-orm";

export class ForecastRepository {
  async ensureTables(): Promise<void> {
    const db = getDb();
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS enterprise_forecasts (
        id VARCHAR(64) PRIMARY KEY,
        organization_id VARCHAR(64) NOT NULL,
        entity_id VARCHAR(64) NOT NULL,
        config JSONB NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS enterprise_forecast_history (
        id VARCHAR(64) PRIMARY KEY,
        forecast_id VARCHAR(64) NOT NULL,
        prediction JSONB NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS enterprise_prediction_models (
        id VARCHAR(64) PRIMARY KEY,
        model_name VARCHAR(64) NOT NULL,
        metadata JSONB NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS enterprise_prediction_metrics (
        id VARCHAR(64) PRIMARY KEY,
        forecast_id VARCHAR(64) NOT NULL,
        metrics JSONB NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS enterprise_confidence_scores (
        id VARCHAR(64) PRIMARY KEY,
        forecast_id VARCHAR(64) NOT NULL,
        score NUMERIC(5,4) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS enterprise_forecast_snapshots (
        id VARCHAR(64) PRIMARY KEY,
        forecast_id VARCHAR(64) NOT NULL,
        snapshot_data JSONB NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS enterprise_forecast_accuracy (
        id VARCHAR(64) PRIMARY KEY,
        forecast_id VARCHAR(64) NOT NULL,
        accuracy_data JSONB NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
  }
}

export const forecastRepository = new ForecastRepository();
