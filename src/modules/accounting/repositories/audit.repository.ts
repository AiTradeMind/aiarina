import { getDb } from "../../../db/client.ts";
import { auditLogs, ep16AccountingAudit } from "../../../db/schema.ts";
import { eq, desc, like, or } from "drizzle-orm";

export class UniversalAuditRepository {
  async log(data: {
    auditId?: string;
    correlationId?: string;
    category: "AI" | "USER" | "ORDERS" | "RISK" | "PORTFOLIO" | "WALLET" | "FUND" | "ACCOUNTING" | "CONFIGURATION" | "SYSTEM";
    action: string;
    actorId?: string;
    targetId?: string;
    details?: any;
    isImmutable?: boolean;
  }) {
    const db = getDb();
    const auditId = data.auditId || `AUD_${Date.now()}_${Math.floor(Math.random() * 10000)}`;

    const inserted = await db.insert(auditLogs).values({
      auditId,
      correlationId: data.correlationId || null,
      category: data.category,
      action: data.action,
      actorId: data.actorId || "SYSTEM",
      targetId: data.targetId || null,
      details: data.details || {},
      isImmutable: data.isImmutable ?? true,
    }).returning();

    // Mirror to ep16AccountingAudit if category is ACCOUNTING
    if (data.category === "ACCOUNTING") {
      await db.insert(ep16AccountingAudit).values({
        action: data.action,
        entityType: "UNIVERSAL_AUDIT",
        details: typeof data.details === "string" ? data.details : JSON.stringify(data.details || {}),
      });
    }

    return inserted[0];
  }

  async findRecent(limit = 100) {
    const db = getDb();
    return await db.select().from(auditLogs).orderBy(desc(auditLogs.createdAt)).limit(limit);
  }

  async search(queryStr: string) {
    const db = getDb();
    const pattern = `%${queryStr}%`;
    return await db.select().from(auditLogs)
      .where(or(
        like(auditLogs.action, pattern),
        like(auditLogs.category, pattern),
        like(auditLogs.actorId, pattern),
        like(auditLogs.targetId, pattern),
        like(auditLogs.auditId, pattern),
        like(auditLogs.correlationId, pattern)
      ))
      .orderBy(desc(auditLogs.createdAt))
      .limit(100);
  }

  async findByCorrelationId(correlationId: string) {
    const db = getDb();
    return await db.select().from(auditLogs).where(eq(auditLogs.correlationId, correlationId)).orderBy(desc(auditLogs.createdAt));
  }
}
