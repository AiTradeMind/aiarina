import { getDb } from "../../../db/client";
import { sql } from "drizzle-orm";

export class ReportingRepository {
  async ensureTables(): Promise<void> {
    const db = getDb();
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS enterprise_reports (
        id VARCHAR(64) PRIMARY KEY,
        organization_id VARCHAR(64) NOT NULL,
        type VARCHAR(32) NOT NULL,
        report_data JSONB NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS enterprise_report_history (
        id VARCHAR(64) PRIMARY KEY,
        report_id VARCHAR(64) NOT NULL,
        snapshot JSONB NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS enterprise_dashboard_snapshots (
        id VARCHAR(64) PRIMARY KEY,
        organization_id VARCHAR(64) NOT NULL,
        snapshot_data JSONB NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS enterprise_dashboard_widgets (
        id VARCHAR(64) PRIMARY KEY,
        organization_id VARCHAR(64) NOT NULL,
        widget_type VARCHAR(32) NOT NULL,
        configuration JSONB NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS enterprise_executive_reports (
        id VARCHAR(64) PRIMARY KEY,
        organization_id VARCHAR(64) NOT NULL,
        summary_data JSONB NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS enterprise_report_exports (
        id VARCHAR(64) PRIMARY KEY,
        report_id VARCHAR(64) NOT NULL,
        format VARCHAR(16) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS enterprise_dashboard_cache (
        id VARCHAR(64) PRIMARY KEY,
        organization_id VARCHAR(64) NOT NULL,
        cache_key VARCHAR(64) NOT NULL,
        cache_data JSONB NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
  }
}

export const reportingRepository = new ReportingRepository();
