import { getDb } from "../../../db/client.ts";
import { enterpriseRiskPolicies, enterpriseRiskEvents, enterpriseRiskMetrics, enterpriseRiskSnapshots } from "../../../db/schema.ts";
import { eq, and, sql } from "drizzle-orm";
import { IRiskPolicy, IRiskEvent, IRiskMetric, IRiskSnapshot } from "../types/index.ts";

export class RiskRepository {
  public async getPolicies(entityType: string, entityId: string): Promise<IRiskPolicy[]> {
    const db = getDb();
    return (await db.select().from(enterpriseRiskPolicies)
      .where(and(
        eq(enterpriseRiskPolicies.entityType, entityType),
        eq(enterpriseRiskPolicies.entityId, entityId),
        eq(enterpriseRiskPolicies.isActive, true)
      ))) as IRiskPolicy[];
  }

  public async getMetric(entityType: string, entityId: string): Promise<IRiskMetric | null> {
    const db = getDb();
    const result = await db.select().from(enterpriseRiskMetrics)
      .where(and(
        eq(enterpriseRiskMetrics.entityType, entityType),
        eq(enterpriseRiskMetrics.entityId, entityId)
      )).limit(1);
    return (result[0] as IRiskMetric) || null;
  }

  public async createMetric(metric: Partial<IRiskMetric>): Promise<void> {
    const db = getDb();
    await db.insert(enterpriseRiskMetrics).values(metric as any);
  }

  public async updateMetric(id: string, updates: Partial<IRiskMetric>): Promise<void> {
    const db = getDb();
    await db.update(enterpriseRiskMetrics).set({ ...updates, updatedAt: sql`CURRENT_TIMESTAMP` }).where(eq(enterpriseRiskMetrics.id, id));
  }

  public async logEvent(event: Omit<IRiskEvent, 'id' | 'timestamp'>): Promise<void> {
    const db = getDb();
    await db.insert(enterpriseRiskEvents).values(event as any);
  }

  public async getSnapshots(entityType: string, entityId: string): Promise<IRiskSnapshot[]> {
    const db = getDb();
    return (await db.select().from(enterpriseRiskSnapshots)
      .where(and(
        eq(enterpriseRiskSnapshots.entityType, entityType),
        eq(enterpriseRiskSnapshots.entityId, entityId)
      )).orderBy(sql`${enterpriseRiskSnapshots.snapshotDate} DESC`)) as IRiskSnapshot[];
  }

  public async ensureTables(): Promise<void> {
    const db = getDb();
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS enterprise_risk_policies (
        id VARCHAR(50) PRIMARY KEY,
        organization_id VARCHAR(50) NOT NULL,
        entity_type VARCHAR(20) NOT NULL,
        entity_id VARCHAR(50) NOT NULL,
        risk_type VARCHAR(30) NOT NULL,
        limit_value NUMERIC NOT NULL,
        action VARCHAR(20) NOT NULL,
        is_active BOOLEAN NOT NULL DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
      )
    `);
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS enterprise_risk_events (
        id SERIAL PRIMARY KEY,
        organization_id VARCHAR(50) NOT NULL,
        entity_type VARCHAR(20) NOT NULL,
        entity_id VARCHAR(50) NOT NULL,
        risk_type VARCHAR(30) NOT NULL,
        message TEXT NOT NULL,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
      )
    `);
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS enterprise_risk_metrics (
        id VARCHAR(50) PRIMARY KEY,
        organization_id VARCHAR(50) NOT NULL,
        entity_type VARCHAR(20) NOT NULL,
        entity_id VARCHAR(50) NOT NULL,
        current_exposure NUMERIC DEFAULT 0,
        daily_loss NUMERIC DEFAULT 0,
        drawdown NUMERIC DEFAULT 0,
        consecutive_losses INTEGER DEFAULT 0,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
      )
    `);
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS enterprise_risk_snapshots (
        id SERIAL PRIMARY KEY,
        organization_id VARCHAR(50) NOT NULL,
        entity_type VARCHAR(20) NOT NULL,
        entity_id VARCHAR(50) NOT NULL,
        snapshot_date DATE NOT NULL,
        exposure NUMERIC DEFAULT 0,
        drawdown NUMERIC DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
      )
    `);
  }
}

export const riskRepository = new RiskRepository();
