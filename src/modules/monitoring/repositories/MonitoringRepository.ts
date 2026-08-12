import { getDb } from "../../../db/client";
import { sql } from "drizzle-orm";

export class MonitoringRepository {
  async ensureTables(): Promise<void> {
    const db = getDb();
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS enterprise_monitoring (
        id VARCHAR(64) PRIMARY KEY,
        organization_id VARCHAR(64) NOT NULL,
        name VARCHAR(128) NOT NULL,
        status VARCHAR(32) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS idx_monitoring_created_at ON enterprise_monitoring (created_at);

      CREATE TABLE IF NOT EXISTS enterprise_monitoring_history (
        id VARCHAR(64) PRIMARY KEY,
        monitoring_id VARCHAR(64) NOT NULL,
        event_type VARCHAR(32) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS idx_monitoring_history_created_at ON enterprise_monitoring_history (created_at);

      CREATE TABLE IF NOT EXISTS enterprise_service_health (
        id VARCHAR(64) PRIMARY KEY,
        service_name VARCHAR(64) NOT NULL,
        status VARCHAR(32) NOT NULL,
        last_check TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS enterprise_system_metrics (
        id VARCHAR(64) PRIMARY KEY,
        metric_name VARCHAR(64) NOT NULL,
        metric_value NUMERIC NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS enterprise_api_metrics (
        id VARCHAR(64) PRIMARY KEY,
        api_path VARCHAR(128) NOT NULL,
        latency NUMERIC NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS enterprise_worker_metrics_history (
        id VARCHAR(64) PRIMARY KEY,
        worker_id VARCHAR(64) NOT NULL,
        metrics_data JSONB NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS enterprise_queue_metrics_history (
        id VARCHAR(64) PRIMARY KEY,
        queue_name VARCHAR(64) NOT NULL,
        queue_length INTEGER NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS enterprise_alert_correlation (
        id VARCHAR(64) PRIMARY KEY,
        alert_ids JSONB NOT NULL,
        correlation_reason TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS enterprise_monitoring_snapshots (
        id VARCHAR(64) PRIMARY KEY,
        snapshot_data JSONB NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
  }
}

export const monitoringRepository = new MonitoringRepository();
