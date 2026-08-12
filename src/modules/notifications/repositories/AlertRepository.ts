import { eq, and, desc, sql } from "drizzle-orm";
import { getDb } from "../../../db/client.ts";
import { enterpriseAlerts } from "../../../db/schema.ts";

export interface EnterpriseAlertItem {
  id: number;
  alertId: string;
  eventId: string;
  alertType: string;
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
  sourceModule: string;
  sourceEntity?: string | null;
  aiModelId?: string | null;
  provider?: string | null;
  version?: string | null;
  market?: string | null;
  category?: string | null;
  exchange?: string | null;
  labId?: string | null;
  instrument?: string | null;
  message: string;
  eventTimestamp: Date;
  status: 'NEW' | 'READ' | 'ACKNOWLEDGED' | 'RESOLVED';
  acknowledgedAt?: Date | null;
  resolvedAt?: Date | null;
  metadata?: any;
  createdAt: Date;
}

export class AlertRepository {
  private static tableEnsured = false;

  async ensureTables(): Promise<void> {
    if (AlertRepository.tableEnsured) return;
    try {
      const db = getDb();
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS enterprise_alerts (
          id SERIAL PRIMARY KEY,
          alert_id VARCHAR(50) NOT NULL UNIQUE,
          event_id VARCHAR(50) NOT NULL,
          alert_type VARCHAR(100) NOT NULL,
          severity VARCHAR(20) NOT NULL,
          source_module VARCHAR(50) NOT NULL,
          source_entity VARCHAR(100),
          ai_model_id VARCHAR(100),
          provider VARCHAR(50),
          version VARCHAR(20),
          market VARCHAR(50) DEFAULT 'INDIAN',
          category VARCHAR(50),
          exchange VARCHAR(50),
          lab_id VARCHAR(50),
          instrument VARCHAR(50),
          message TEXT NOT NULL,
          event_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
          status VARCHAR(20) DEFAULT 'NEW' NOT NULL,
          acknowledged_at TIMESTAMP,
          resolved_at TIMESTAMP,
          metadata JSONB DEFAULT '{}'::jsonb,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
        );
        CREATE INDEX IF NOT EXISTS enterpriseAlerts_alertId_idx ON enterprise_alerts (alert_id);
        CREATE INDEX IF NOT EXISTS enterpriseAlerts_eventId_idx ON enterprise_alerts (event_id);
        CREATE INDEX IF NOT EXISTS enterpriseAlerts_status_idx ON enterprise_alerts (status);
        CREATE INDEX IF NOT EXISTS enterpriseAlerts_severity_idx ON enterprise_alerts (severity);
        CREATE INDEX IF NOT EXISTS enterpriseAlerts_sourceModule_idx ON enterprise_alerts (source_module);
        CREATE INDEX IF NOT EXISTS enterpriseAlerts_aiModelId_idx ON enterprise_alerts (ai_model_id);
        CREATE INDEX IF NOT EXISTS enterpriseAlerts_createdAt_idx ON enterprise_alerts (created_at);
      `);
      AlertRepository.tableEnsured = true;
    } catch (err) {
      console.error("Failed to ensure enterprise_alerts table:", err);
    }
  }

  async createAlert(data: Partial<EnterpriseAlertItem>): Promise<EnterpriseAlertItem> {
    await this.ensureTables();
    const db = getDb();
    
    // Deduplication check: same eventId + alertType
    if (data.eventId && data.alertType) {
      const existing = await db
        .select()
        .from(enterpriseAlerts)
        .where(and(eq(enterpriseAlerts.eventId, data.eventId), eq(enterpriseAlerts.alertType, data.alertType)))
        .limit(1);
      if (existing.length > 0) {
        return existing[0] as unknown as EnterpriseAlertItem;
      }
    }

    const payload = {
      alertId: data.alertId || `ALT-${Math.floor(1000 + Math.random() * 9000)}`,
      eventId: data.eventId || `EVT-${Date.now()}`,
      alertType: data.alertType || 'SYSTEM_EVENT',
      severity: data.severity || 'INFO',
      sourceModule: data.sourceModule || 'SYSTEM',
      sourceEntity: data.sourceEntity || null,
      aiModelId: data.aiModelId || null,
      provider: data.provider || null,
      version: data.version || null,
      market: data.market || 'INDIAN',
      category: data.category || 'SYSTEM',
      exchange: data.exchange || 'NSE',
      labId: data.labId || null,
      instrument: data.instrument || null,
      message: data.message || 'System notification event',
      eventTimestamp: data.eventTimestamp || new Date(),
      status: data.status || 'NEW',
      metadata: data.metadata || {},
    };

    const res = await db.insert(enterpriseAlerts).values(payload).returning();
    return res[0] as unknown as EnterpriseAlertItem;
  }

  async findByAlertId(alertId: string): Promise<EnterpriseAlertItem | null> {
    await this.ensureTables();
    const db = getDb();
    const res = await db.select().from(enterpriseAlerts).where(eq(enterpriseAlerts.alertId, alertId)).limit(1);
    return (res[0] as unknown as EnterpriseAlertItem) || null;
  }

  async listAlerts(filters?: {
    severity?: string;
    status?: string;
    sourceModule?: string;
    aiModelId?: string;
    market?: string;
    category?: string;
    exchange?: string;
    labId?: string;
  }): Promise<EnterpriseAlertItem[]> {
    await this.ensureTables();
    const db = getDb();
    const conditions = [];

    if (filters) {
      if (filters.severity && filters.severity !== 'ALL') conditions.push(eq(enterpriseAlerts.severity, filters.severity));
      if (filters.status && filters.status !== 'ALL') conditions.push(eq(enterpriseAlerts.status, filters.status));
      if (filters.sourceModule && filters.sourceModule !== 'ALL') conditions.push(eq(enterpriseAlerts.sourceModule, filters.sourceModule));
      if (filters.aiModelId && filters.aiModelId !== 'ALL') conditions.push(eq(enterpriseAlerts.aiModelId, filters.aiModelId));
      if (filters.market && filters.market !== 'ALL') conditions.push(eq(enterpriseAlerts.market, filters.market));
      if (filters.category && filters.category !== 'ALL') conditions.push(eq(enterpriseAlerts.category, filters.category));
      if (filters.exchange && filters.exchange !== 'ALL') conditions.push(eq(enterpriseAlerts.exchange, filters.exchange));
      if (filters.labId && filters.labId !== 'ALL') conditions.push(eq(enterpriseAlerts.labId, filters.labId));
    }

    const query = conditions.length > 0 
      ? db.select().from(enterpriseAlerts).where(and(...conditions)).orderBy(desc(enterpriseAlerts.createdAt))
      : db.select().from(enterpriseAlerts).orderBy(desc(enterpriseAlerts.createdAt));

    const res = await query;
    return res as unknown as EnterpriseAlertItem[];
  }

  async updateAlertStatus(
    alertId: string, 
    status: 'NEW' | 'READ' | 'ACKNOWLEDGED' | 'RESOLVED',
    extraUpdates?: { acknowledgedAt?: Date; resolvedAt?: Date }
  ): Promise<EnterpriseAlertItem | null> {
    await this.ensureTables();
    const db = getDb();
    const updates: any = { status };
    if (extraUpdates?.acknowledgedAt) updates.acknowledgedAt = extraUpdates.acknowledgedAt;
    if (extraUpdates?.resolvedAt) updates.resolvedAt = extraUpdates.resolvedAt;

    const res = await db
      .update(enterpriseAlerts)
      .set(updates)
      .where(eq(enterpriseAlerts.alertId, alertId))
      .returning();
    return (res[0] as unknown as EnterpriseAlertItem) || null;
  }
}

export const alertRepository = new AlertRepository();
