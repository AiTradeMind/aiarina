import { getDb } from "../../../db/client.ts";
import { reconciliationReports } from "../../../db/schema.ts";
import { eq, desc } from "drizzle-orm";

export class ReconciliationRepository {
  async saveReport(data: {
    reportId: string;
    fundStatus?: string;
    walletStatus?: string;
    omsStatus?: string;
    portfolioStatus?: string;
    accountingStatus?: string;
    missingEntries?: any[];
    mismatches?: any[];
    duplicates?: any[];
    brokenChain?: boolean;
    status?: string;
    summary?: string;
    details?: any;
  }) {
    const db = getDb();
    const inserted = await db.insert(reconciliationReports).values({
      reportId: data.reportId,
      fundStatus: data.fundStatus || "BALANCED",
      walletStatus: data.walletStatus || "BALANCED",
      omsStatus: data.omsStatus || "BALANCED",
      portfolioStatus: data.portfolioStatus || "BALANCED",
      accountingStatus: data.accountingStatus || "BALANCED",
      missingEntries: data.missingEntries || [],
      mismatches: data.mismatches || [],
      duplicates: data.duplicates || [],
      brokenChain: data.brokenChain || false,
      status: data.status || "BALANCED",
      summary: data.summary || "System Reconciliation Completed",
      details: data.details || {},
    }).returning();
    return inserted[0];
  }

  async getLatestReport() {
    const db = getDb();
    const res = await db.select().from(reconciliationReports).orderBy(desc(reconciliationReports.createdAt)).limit(1);
    return res[0] || null;
  }

  async getAllReports(limit = 50) {
    const db = getDb();
    return await db.select().from(reconciliationReports).orderBy(desc(reconciliationReports.createdAt)).limit(limit);
  }
}
