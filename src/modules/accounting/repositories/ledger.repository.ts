import { getDb } from "../../../db/client.ts";
import { ep16GeneralLedger, ep16LedgerTransactions, ep16ChartOfAccounts } from "../../../db/schema.ts";
import { eq, desc } from "drizzle-orm";

export class LedgerRepository {
  async getGeneralLedgerAccount(accountId: number) {
    const db = getDb();
    const res = await db.select().from(ep16GeneralLedger).where(eq(ep16GeneralLedger.accountId, accountId)).limit(1);
    return res[0] || null;
  }

  async getAllGeneralLedgerAccounts() {
    const db = getDb();
    return await db.select().from(ep16GeneralLedger);
  }

  async updateBalance(accountId: number, newBalance: number) {
    const db = getDb();
    const existing = await this.getGeneralLedgerAccount(accountId);
    if (existing) {
      const updated = await db.update(ep16GeneralLedger)
        .set({
          currentBalance: newBalance.toFixed(4),
          lastUpdated: new Date(),
        })
        .where(eq(ep16GeneralLedger.accountId, accountId))
        .returning();
      return updated[0];
    } else {
      const inserted = await db.insert(ep16GeneralLedger).values({
        accountId,
        currentBalance: newBalance.toFixed(4),
        lastUpdated: new Date(),
      }).returning();
      return inserted[0];
    }
  }

  async getTransactionsByAccountId(accountId: number, limit = 100) {
    const db = getDb();
    return await db.select()
      .from(ep16LedgerTransactions)
      .where(eq(ep16LedgerTransactions.accountId, accountId))
      .orderBy(desc(ep16LedgerTransactions.transactionDate))
      .limit(limit);
  }
}
