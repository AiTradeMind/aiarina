import { getDb } from "../../../db/client.ts";
import { correlationRegistry } from "../../../db/schema.ts";
import { eq } from "drizzle-orm";
import crypto from "crypto";

export class CorrelationService {
  generateCorrelationId(): string {
    return `CORR_${Date.now()}_${crypto.randomBytes(4).toString("hex").toUpperCase()}`;
  }

  async registerCorrelation(data: {
    correlationId?: string;
    decisionId?: string;
    riskAssessmentId?: string;
    orderId?: string;
    positionId?: string;
    journalEntryId?: string;
    auditId?: string;
    metadata?: any;
  }) {
    const db = getDb();
    const corrId = data.correlationId || this.generateCorrelationId();

    const existing = await db.select().from(correlationRegistry).where(eq(correlationRegistry.correlationId, corrId)).limit(1);

    if (existing.length > 0) {
      const updated = await db.update(correlationRegistry).set({
        ...(data.decisionId && { decisionId: data.decisionId }),
        ...(data.riskAssessmentId && { riskAssessmentId: data.riskAssessmentId }),
        ...(data.orderId && { orderId: data.orderId }),
        ...(data.positionId && { positionId: data.positionId }),
        ...(data.journalEntryId && { journalEntryId: data.journalEntryId }),
        ...(data.auditId && { auditId: data.auditId }),
        ...(data.metadata && { metadata: data.metadata }),
        updatedAt: new Date(),
      }).where(eq(correlationRegistry.correlationId, corrId)).returning();
      return updated[0];
    } else {
      const inserted = await db.insert(correlationRegistry).values({
        correlationId: corrId,
        decisionId: data.decisionId || null,
        riskAssessmentId: data.riskAssessmentId || null,
        orderId: data.orderId || null,
        positionId: data.positionId || null,
        journalEntryId: data.journalEntryId || null,
        auditId: data.auditId || null,
        status: "ACTIVE",
        metadata: data.metadata || {},
      }).returning();
      return inserted[0];
    }
  }

  async getCorrelationChain(correlationId: string) {
    const db = getDb();
    const res = await db.select().from(correlationRegistry).where(eq(correlationRegistry.correlationId, correlationId)).limit(1);
    return res[0] || null;
  }
}

export const correlationService = new CorrelationService();
