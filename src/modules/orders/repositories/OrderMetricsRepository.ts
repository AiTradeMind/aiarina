import { sql, eq, and } from "drizzle-orm";
import { getDb } from "../../../db/client.ts";
import { enterpriseOrderMetrics } from "../../../db/schema.ts";

export class OrderMetricsRepository {
  public async ensureMetricsTable(): Promise<void> {
    const db = getDb();
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS enterprise_order_metrics (
        id SERIAL PRIMARY KEY,
        organization_id VARCHAR(50) NOT NULL,
        date DATE NOT NULL,
        total_orders INTEGER DEFAULT 0 NOT NULL,
        created_orders INTEGER DEFAULT 0 NOT NULL,
        filled_orders INTEGER DEFAULT 0 NOT NULL,
        cancelled_orders INTEGER DEFAULT 0 NOT NULL,
        rejected_orders INTEGER DEFAULT 0 NOT NULL,
        expired_orders INTEGER DEFAULT 0 NOT NULL,
        modified_orders INTEGER DEFAULT 0 NOT NULL,
        validation_failures INTEGER DEFAULT 0 NOT NULL,
        duplicate_requests INTEGER DEFAULT 0 NOT NULL,
        total_volume NUMERIC DEFAULT 0 NOT NULL,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL
      );

      CREATE UNIQUE INDEX IF NOT EXISTS ent_order_metrics_org_date_idx ON enterprise_order_metrics(organization_id, date);
    `);
  }

  public async incrementMetric(organizationId: string, metric: string, amount: number = 1, volume: number = 0): Promise<void> {
    const db = getDb();
    const today = new Date().toISOString().split('T')[0];

    const safeMetricMap: Record<string, string> = {
      totalOrders: 'total_orders',
      createdOrders: 'created_orders',
      filledOrders: 'filled_orders',
      cancelledOrders: 'cancelled_orders',
      rejectedOrders: 'rejected_orders',
      expiredOrders: 'expired_orders',
      modifiedOrders: 'modified_orders',
      validationFailures: 'validation_failures',
      duplicateRequests: 'duplicate_requests'
    };

    const columnName = safeMetricMap[metric];
    if (!columnName) return;

    await db.execute(sql`
      INSERT INTO enterprise_order_metrics (organization_id, date, ${sql.identifier(columnName)}, total_volume, updated_at)
      VALUES (${organizationId}, ${today}, ${amount}, ${volume}, NOW())
      ON CONFLICT (organization_id, date)
      DO UPDATE SET 
        ${sql.identifier(columnName)} = enterprise_order_metrics.${sql.identifier(columnName)} + ${amount},
        total_volume = enterprise_order_metrics.total_volume + ${volume},
        updated_at = NOW();
    `);
  }

  public async getMetricsByDate(organizationId: string, date: string): Promise<any> {
    const db = getDb();
    const result = await db.select()
      .from(enterpriseOrderMetrics)
      .where(and(eq(enterpriseOrderMetrics.organizationId, organizationId), eq(enterpriseOrderMetrics.date, date)))
      .limit(1);
    
    return result[0] || null;
  }

  public async getMetricsRange(organizationId: string, startDate: string, endDate: string): Promise<any[]> {
    const db = getDb();
    const result = await db.execute(sql`
      SELECT * FROM enterprise_order_metrics 
      WHERE organization_id = ${organizationId} 
      AND date >= ${startDate} 
      AND date <= ${endDate}
      ORDER BY date ASC
    `);
    return (result as any).rows || result;
  }
}

export const orderMetricsRepository = new OrderMetricsRepository();
