import { eq, sql, desc, and } from "drizzle-orm";
import { getDb } from "../../../db/client.ts";
import { enterpriseOrderVersions } from "../../../db/schema.ts";
import { IOrderVersion } from "../types/index.ts";

export class OrderVersionRepository {
  public async ensureVersionTable(): Promise<void> {
    const db = getDb();
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS enterprise_order_versions (
        id SERIAL PRIMARY KEY,
        order_id VARCHAR(50) NOT NULL REFERENCES enterprise_orders(id) ON DELETE CASCADE,
        version_number INTEGER NOT NULL,
        previous_version_id INTEGER,
        change_reason VARCHAR(255),
        changed_by INTEGER,
        changed_at TIMESTAMP DEFAULT NOW() NOT NULL,
        order_snapshot JSONB NOT NULL
      );

      CREATE INDEX IF NOT EXISTS idx_ent_order_versions_order_id ON enterprise_order_versions(order_id);
    `);
  }

  public async saveVersion(versionData: Omit<IOrderVersion, 'id'>): Promise<IOrderVersion> {
    const db = getDb();
    const result = await db.insert(enterpriseOrderVersions).values(versionData as any).returning();
    return result[0] as unknown as IOrderVersion;
  }

  public async getVersions(orderId: string): Promise<IOrderVersion[]> {
    const db = getDb();
    const result = await db.select()
      .from(enterpriseOrderVersions)
      .where(eq(enterpriseOrderVersions.orderId, orderId))
      .orderBy(desc(enterpriseOrderVersions.versionNumber));
    return result as unknown as IOrderVersion[];
  }
}

export const orderVersionRepository = new OrderVersionRepository();
