import { getDb } from "../../../db/client";
import { sql } from "drizzle-orm";

export class NotificationRepository {
  async ensureTables(): Promise<void> {
    const db = getDb();
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS enterprise_notifications (
        id VARCHAR(64) PRIMARY KEY,
        organization_id VARCHAR(64) NOT NULL,
        message TEXT NOT NULL,
        priority VARCHAR(16) NOT NULL,
        status VARCHAR(32) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS enterprise_notification_history (
        id VARCHAR(64) PRIMARY KEY,
        notification_id VARCHAR(64) NOT NULL,
        event_type VARCHAR(32) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS enterprise_notification_preferences (
        id VARCHAR(64) PRIMARY KEY,
        organization_id VARCHAR(64) NOT NULL,
        preferences JSONB NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS enterprise_notification_templates (
        id VARCHAR(64) PRIMARY KEY,
        template_name VARCHAR(64) NOT NULL,
        template_data JSONB NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS enterprise_notification_delivery (
        id VARCHAR(64) PRIMARY KEY,
        notification_id VARCHAR(64) NOT NULL,
        channel VARCHAR(32) NOT NULL,
        status VARCHAR(32) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS enterprise_notification_metrics (
        id VARCHAR(64) PRIMARY KEY,
        metric_data JSONB NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS enterprise_notification_queue (
        id VARCHAR(64) PRIMARY KEY,
        notification_id VARCHAR(64) NOT NULL,
        queue_status VARCHAR(32) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
  }
}

export const notificationRepository = new NotificationRepository();
