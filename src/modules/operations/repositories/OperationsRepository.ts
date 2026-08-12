import { getDb } from "../../../db/client";
import { sql } from "drizzle-orm";

export class OperationsRepository {
  async ensureTables(): Promise<void> {
    const db = getDb();
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS enterprise_operations_dashboard (
        id VARCHAR(64) PRIMARY KEY,
        status VARCHAR(32) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS enterprise_operations_widgets (
        id VARCHAR(64) PRIMARY KEY,
        widget_type VARCHAR(64) NOT NULL,
        config JSONB NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS enterprise_operations_layout (
        id VARCHAR(64) PRIMARY KEY,
        layout_config JSONB NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS enterprise_operations_activity (
        id VARCHAR(64) PRIMARY KEY,
        activity_type VARCHAR(64) NOT NULL,
        details JSONB NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS enterprise_operations_alerts (
        id VARCHAR(64) PRIMARY KEY,
        alert_type VARCHAR(64) NOT NULL,
        details JSONB NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS enterprise_operations_status (
        id VARCHAR(64) PRIMARY KEY,
        status_data JSONB NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS enterprise_operations_metrics (
        id VARCHAR(64) PRIMARY KEY,
        metric_data JSONB NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS enterprise_operations_snapshots (
        id VARCHAR(64) PRIMARY KEY,
        snapshot_data JSONB NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS enterprise_operations_sessions (
        id VARCHAR(64) PRIMARY KEY,
        session_data JSONB NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
  }
}

export const operationsRepository = new OperationsRepository();
