import { getDb } from "../../../db/client.ts";
import { ep16JournalEntries, ep16LedgerTransactions, omsOrders, portfolioPositions, auditLogs } from "../../../db/schema.ts";
import { UniversalAuditRepository } from "../repositories/audit.repository.ts";
import { asc, eq } from "drizzle-orm";

export class ReplayFramework {
  private auditRepo = new UniversalAuditRepository();

  async replayAccountingLedger() {
    const db = getDb();
    const journals = await db.select().from(ep16JournalEntries).orderBy(asc(ep16JournalEntries.createdAt));
    const lines = await db.select().from(ep16LedgerTransactions).orderBy(asc(ep16LedgerTransactions.transactionDate));

    let replayedDebits = 0;
    let replayedCredits = 0;

    for (const l of lines) {
      const amt = parseFloat(l.amount);
      if (l.transactionType === "DEBIT") replayedDebits += amt;
      else replayedCredits += amt;
    }

    const isRebalanceMatch = Math.abs(replayedDebits - replayedCredits) < 0.01;

    await this.auditRepo.log({
      category: "ACCOUNTING",
      action: "REPLAY_COMPLETED",
      details: {
        journalEntriesCount: journals.length,
        linesCount: lines.length,
        replayedDebits,
        replayedCredits,
        isRebalanceMatch,
      },
    });

    return {
      success: true,
      journalsReplayed: journals.length,
      linesReplayed: lines.length,
      totalDebits: replayedDebits,
      totalCredits: replayedCredits,
      isBalanced: isRebalanceMatch,
      replayedAt: new Date().toISOString(),
    };
  }

  async replayOrderWorkflow(orderId: string) {
    const db = getDb();
    const order = await db.select().from(omsOrders).where(eq(omsOrders.orderId, orderId)).limit(1);
    if (order.length === 0) {
      throw new Error(`Order ${orderId} not found for replay.`);
    }

    const audits = await db.select().from(auditLogs).where(eq(auditLogs.targetId, orderId)).orderBy(asc(auditLogs.createdAt));

    return {
      order: order[0],
      auditHistory: audits,
      replayedAt: new Date().toISOString(),
    };
  }
}
