import { eq, sql, and } from "drizzle-orm";
import { getDb } from "../../../db/client.ts";
import { enterpriseOrderIdempotency } from "../../../db/schema.ts";
import { IOrderIdempotency } from "../types/index.ts";

export class IdempotencyRepository {
  public async ensureIdempotencyTable(): Promise<void> {
    const db = getDb();
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS enterprise_order_idempotency (
        idempotency_key VARCHAR(100) PRIMARY KEY,
        organization_id VARCHAR(50) NOT NULL,
        request_hash VARCHAR(255) NOT NULL,
        response_status INTEGER NOT NULL,
        response_body JSONB NOT NULL,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      );
    `);
  }

  public async saveIdempotency(data: IOrderIdempotency): Promise<IOrderIdempotency> {
    const db = getDb();
    const result = await db.insert(enterpriseOrderIdempotency).values(data as any).returning();
    return result[0] as unknown as IOrderIdempotency;
  }

  public async getByIdempotencyKey(key: string, organizationId: string): Promise<IOrderIdempotency | null> {
    const db = getDb();
    const result = await db.select()
      .from(enterpriseOrderIdempotency)
      .where(and(eq(enterpriseOrderIdempotency.idempotencyKey, key), eq(enterpriseOrderIdempotency.organizationId, organizationId)))
      .limit(1);
    
    return (result[0] as unknown as IOrderIdempotency) || null;
  }
}

export const idempotencyRepository = new IdempotencyRepository();
