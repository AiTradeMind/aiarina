import { getDb } from "../../../db/client.ts";
import {
  decisionRecords,
  decisionContext,
  decisionEvidence,
  decisionMetadata,
  decisionHistory,
} from "../../../db/schema.ts";
import { eq, desc, and, sql } from "drizzle-orm";
import {
  DecisionRecord,
  EvaluateDecisionDTO,
  QueryDecisionDTO,
  DecisionContextRecord,
  DecisionEvidenceRecord,
  DecisionHistoryRecord,
} from "../types/index.ts";
import logger from "../../../lib/logger.ts";

export class DecisionRepository {
  // In-memory fallback stores for high resiliency
  private static decisionStore: Map<string, DecisionRecord> = new Map();
  private static contextStore: Map<string, DecisionContextRecord> = new Map();
  private static evidenceStore: Map<string, DecisionEvidenceRecord> = new Map();
  private static historyStore: Map<string, DecisionHistoryRecord[]> = new Map();

  // ==========================================
  // Decision Records Operations
  // ==========================================

  public async saveDecision(record: DecisionRecord): Promise<DecisionRecord> {
    DecisionRepository.decisionStore.set(record.decisionId, record);

    try {
      const db = getDb();
      await db.insert(decisionRecords).values({
        decisionId: record.decisionId,
        contextId: record.contextId,
        symbol: record.symbol,
        decisionType: record.decisionType,
        status: record.status,
        confidence: record.confidence,
        confidenceScore: String(record.confidenceScore),
        riskScore: String(record.riskScore),
        priority: record.priority,
        reasoningSummary: record.reasoningSummary,
        supportingEvidence: record.supportingEvidence as any,
        knowledgeReferences: record.knowledgeReferences as any,
        policyReferences: record.policyReferences as any,
        metadata: record.metadata as any,
      });
    } catch (err: any) {
      logger.warn({ type: "DECISION_REPO_WARN", error: err.message }, "Fallback to memory store for saveDecision");
    }

    return record;
  }

  public async updateDecisionStatus(
    decisionId: string,
    newStatus: string,
    changedBy: string = "SYSTEM",
    reason?: string
  ): Promise<DecisionRecord | null> {
    const existing = await this.getDecisionById(decisionId);
    if (!existing) return null;

    const fromStatus = existing.status;
    existing.status = newStatus as any;
    existing.updatedAt = new Date();

    DecisionRepository.decisionStore.set(decisionId, existing);

    // Record History
    await this.addHistoryRecord({
      historyId: `DHS-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      decisionId,
      fromStatus,
      toStatus: newStatus,
      changedBy,
      reason,
      createdAt: new Date(),
    });

    try {
      const db = getDb();
      await db
        .update(decisionRecords)
        .set({
          status: newStatus as any,
          updatedAt: new Date(),
        })
        .where(eq(decisionRecords.decisionId, decisionId));
    } catch (err: any) {
      logger.warn({ type: "DECISION_REPO_WARN", error: err.message }, "Fallback to memory store for updateDecisionStatus");
    }

    return existing;
  }

  public async getDecisionById(decisionId: string): Promise<DecisionRecord | null> {
    try {
      const db = getDb();
      const rows = await db
        .select()
        .from(decisionRecords)
        .where(eq(decisionRecords.decisionId, decisionId))
        .limit(1);

      if (rows.length > 0) {
        const r = rows[0];
        return {
          id: r.id,
          decisionId: r.decisionId,
          contextId: r.contextId,
          symbol: r.symbol,
          decisionType: r.decisionType as any,
          status: r.status as any,
          confidence: r.confidence as any,
          confidenceScore: Number(r.confidenceScore),
          riskScore: Number(r.riskScore),
          priority: r.priority as any,
          reasoningSummary: r.reasoningSummary || "",
          supportingEvidence: (r.supportingEvidence as any[]) || [],
          knowledgeReferences: (r.knowledgeReferences as any[]) || [],
          policyReferences: (r.policyReferences as any[]) || [],
          metadata: (r.metadata as Record<string, any>) || {},
          createdAt: r.createdAt ? new Date(r.createdAt) : new Date(),
          updatedAt: r.updatedAt ? new Date(r.updatedAt) : new Date(),
        };
      }
    } catch (err: any) {
      logger.warn({ type: "DECISION_REPO_WARN", error: err.message }, "Fallback to memory store for getDecisionById");
    }

    return DecisionRepository.decisionStore.get(decisionId) || null;
  }

  public async queryDecisions(query: QueryDecisionDTO = {}): Promise<DecisionRecord[]> {
    try {
      const db = getDb();
      const conditions = [];

      if (query.decisionType) {
        conditions.push(eq(decisionRecords.decisionType, query.decisionType));
      }
      if (query.status) {
        conditions.push(eq(decisionRecords.status, query.status));
      }
      if (query.symbol) {
        conditions.push(eq(decisionRecords.symbol, query.symbol));
      }

      let q = db.select().from(decisionRecords);
      if (conditions.length > 0) {
        q = q.where(and(...conditions)) as any;
      }

      const rows = await q.orderBy(desc(decisionRecords.createdAt)).limit(query.limit || 100);
      if (rows.length > 0) {
        return rows.map((r) => ({
          id: r.id,
          decisionId: r.decisionId,
          contextId: r.contextId,
          symbol: r.symbol,
          decisionType: r.decisionType as any,
          status: r.status as any,
          confidence: r.confidence as any,
          confidenceScore: Number(r.confidenceScore),
          riskScore: Number(r.riskScore),
          priority: r.priority as any,
          reasoningSummary: r.reasoningSummary || "",
          supportingEvidence: (r.supportingEvidence as any[]) || [],
          knowledgeReferences: (r.knowledgeReferences as any[]) || [],
          policyReferences: (r.policyReferences as any[]) || [],
          metadata: (r.metadata as Record<string, any>) || {},
          createdAt: r.createdAt ? new Date(r.createdAt) : new Date(),
          updatedAt: r.updatedAt ? new Date(r.updatedAt) : new Date(),
        }));
      }
    } catch (err: any) {
      logger.warn({ type: "DECISION_REPO_WARN", error: err.message }, "Fallback to memory store for queryDecisions");
    }

    let items = Array.from(DecisionRepository.decisionStore.values());
    if (query.decisionType) items = items.filter((d) => d.decisionType === query.decisionType);
    if (query.status) items = items.filter((d) => d.status === query.status);
    if (query.symbol) items = items.filter((d) => d.symbol === query.symbol);

    return items.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()).slice(0, query.limit || 100);
  }

  // ==========================================
  // Context, Evidence & History Operations
  // ==========================================

  public async saveContextSnapshot(
    decisionId: string,
    snapshot: Record<string, any>,
    brainContextId?: string
  ): Promise<DecisionContextRecord> {
    const contextRecordId = `DCX-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const record: DecisionContextRecord = {
      contextRecordId,
      decisionId,
      brainContextId: brainContextId || null,
      snapshot,
      createdAt: new Date(),
    };

    DecisionRepository.contextStore.set(contextRecordId, record);

    try {
      const db = getDb();
      await db.insert(decisionContext).values({
        contextRecordId,
        decisionId,
        brainContextId: record.brainContextId,
        snapshot: record.snapshot as any,
      });
    } catch (err: any) {
      logger.warn({ type: "DECISION_REPO_WARN", error: err.message }, "Fallback to memory store for saveContextSnapshot");
    }

    return record;
  }

  public async addHistoryRecord(history: DecisionHistoryRecord): Promise<DecisionHistoryRecord> {
    const list = DecisionRepository.historyStore.get(history.decisionId) || [];
    list.push(history);
    DecisionRepository.historyStore.set(history.decisionId, list);

    try {
      const db = getDb();
      await db.insert(decisionHistory).values({
        historyId: history.historyId,
        decisionId: history.decisionId,
        fromStatus: history.fromStatus,
        toStatus: history.toStatus,
        changedBy: history.changedBy,
        reason: history.reason,
      });
    } catch (err: any) {
      logger.warn({ type: "DECISION_REPO_WARN", error: err.message }, "Fallback to memory store for addHistoryRecord");
    }

    return history;
  }

  public async getHistory(decisionId?: string): Promise<DecisionHistoryRecord[]> {
    try {
      const db = getDb();
      let q = db.select().from(decisionHistory);
      if (decisionId) {
        q = q.where(eq(decisionHistory.decisionId, decisionId)) as any;
      }
      const rows = await q.orderBy(desc(decisionHistory.createdAt)).limit(100);
      if (rows.length > 0) {
        return rows.map((r) => ({
          id: r.id,
          historyId: r.historyId,
          decisionId: r.decisionId,
          fromStatus: r.fromStatus,
          toStatus: r.toStatus,
          changedBy: r.changedBy || "SYSTEM",
          reason: r.reason,
          createdAt: r.createdAt ? new Date(r.createdAt) : new Date(),
        }));
      }
    } catch (err: any) {
      logger.warn({ type: "DECISION_REPO_WARN", error: err.message }, "Fallback to memory store for getHistory");
    }

    if (decisionId) {
      return DecisionRepository.historyStore.get(decisionId) || [];
    }

    const allHistory: DecisionHistoryRecord[] = [];
    for (const list of DecisionRepository.historyStore.values()) {
      allHistory.push(...list);
    }
    return allHistory.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()).slice(0, 100);
  }

  public async countAll(): Promise<{
    totalCount: number;
    approvedCount: number;
    rejectedCount: number;
    evaluatingCount: number;
  }> {
    const items = Array.from(DecisionRepository.decisionStore.values());
    const memTotal = items.length;
    const memApproved = items.filter((i) => i.status === "APPROVED").length;
    const memRejected = items.filter((i) => i.status === "REJECTED").length;
    const memEvaluating = items.filter((i) => i.status === "EVALUATING" || i.status === "CREATED").length;

    try {
      const db = getDb();
      const [tRows] = await db.select({ count: sql<number>`count(*)` }).from(decisionRecords);
      return {
        totalCount: Math.max(Number(tRows?.count || 0), memTotal),
        approvedCount: memApproved,
        rejectedCount: memRejected,
        evaluatingCount: memEvaluating,
      };
    } catch (err) {
      return {
        totalCount: memTotal,
        approvedCount: memApproved,
        rejectedCount: memRejected,
        evaluatingCount: memEvaluating,
      };
    }
  }
}
