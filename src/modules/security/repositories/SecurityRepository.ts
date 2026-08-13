import { getDb } from "../../../db/client";
import { sql } from "drizzle-orm";

export class SecurityRepository {
  async ensureTables(): Promise<void> {
    const db = getDb();
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS enterprise_security_events (
        id VARCHAR(64) PRIMARY KEY,
        event_type VARCHAR(64) NOT NULL,
        event_details JSONB NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS idx_security_events_created_at ON enterprise_security_events (created_at);

      CREATE TABLE IF NOT EXISTS enterprise_security_alerts (
        id VARCHAR(64) PRIMARY KEY,
        alert_type VARCHAR(64) NOT NULL,
        details JSONB NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS idx_security_alerts_created_at ON enterprise_security_alerts (created_at);

      CREATE TABLE IF NOT EXISTS enterprise_sessions (
        id VARCHAR(64) PRIMARY KEY,
        session_data JSONB NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS idx_sessions_created_at ON enterprise_sessions (created_at);

      CREATE TABLE IF NOT EXISTS enterprise_devices (
        id VARCHAR(64) PRIMARY KEY,
        device_data JSONB NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS idx_devices_created_at ON enterprise_devices (created_at);

      CREATE TABLE IF NOT EXISTS enterprise_access_history (
        id VARCHAR(64) PRIMARY KEY,
        access_details JSONB NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS idx_access_history_created_at ON enterprise_access_history (created_at);

      CREATE TABLE IF NOT EXISTS enterprise_permission_audit (
        id VARCHAR(64) PRIMARY KEY,
        permission_data JSONB NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS idx_permission_audit_created_at ON enterprise_permission_audit (created_at);

      CREATE TABLE IF NOT EXISTS enterprise_security_metrics (
        id VARCHAR(64) PRIMARY KEY,
        metric_data JSONB NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS idx_security_metrics_created_at ON enterprise_security_metrics (created_at);

      CREATE TABLE IF NOT EXISTS enterprise_security_health (
        id VARCHAR(64) PRIMARY KEY,
        health_data JSONB NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS idx_security_health_created_at ON enterprise_security_health (created_at);

      CREATE TABLE IF NOT EXISTS enterprise_security_policies (
        id VARCHAR(64) PRIMARY KEY,
        policy_name VARCHAR(64) NOT NULL,
        policy_config JSONB NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS idx_security_policies_created_at ON enterprise_security_policies (created_at);

      CREATE TABLE IF NOT EXISTS enterprise_threat_events (
        id VARCHAR(64) PRIMARY KEY,
        threat_data JSONB NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS idx_threat_events_created_at ON enterprise_threat_events (created_at);
    `);
  }
}

export const securityRepository = new SecurityRepository();
