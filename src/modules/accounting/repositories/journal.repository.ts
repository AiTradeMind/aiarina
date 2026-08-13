import { getDb } from "../../../db/client.ts";
import { ep16JournalEntries, ep16LedgerTransactions } from "../../../db/schema.ts";
import { eq, desc, inArray } from "drizzle-orm";

export class JournalRepository {
  async findEntries(filters?: { tradeId?: number; status?: string }) {
    const db = getDb();
    let query = db.select().from(ep16JournalEntries);

    if (filters?.tradeId) {
      query = query.where(eq(ep16JournalEntries.tradeId, filters.tradeId)) as any;
    } else if (filters?.status) {
      query = query.where(eq(ep16JournalEntries.status, filters.status)) as any;
    }

    return await query.orderBy(desc(ep16JournalEntries.createdAt)).limit(100);
  }

  async findEntryById(id: number) {
    const db = getDb();
    const res = await db.select().from(ep16JournalEntries).where(eq(ep16JournalEntries.id, id)).limit(1);
    return res[0] || null;
  }

  async createEntry(data: {
    entryNumber: string;
    tradeId?: number | null;
    description: string;
    entryDate?: Date;
    totalDebit: number;
    totalCredit: number;
    status?: string;
  }) {
    const db = getDb();
    const inserted = await db.insert(ep16JournalEntries).values({
      entryNumber: data.entryNumber,
      tradeId: data.tradeId || null,
      description: data.description,
      entryDate: data.entryDate || new Date(),
      totalDebit: data.totalDebit.toFixed(4),
      totalCredit: data.totalCredit.toFixed(4),
      status: data.status || "POSTED",
    }).returning();
    return inserted[0];
  }

  async updateEntryStatus(id: number, status: string) {
    const db = getDb();
    const updated = await db.update(ep16JournalEntries)
      .set({ status })
      .where(eq(ep16JournalEntries.id, id))
      .returning();
    return updated[0];
  }

  async getLinesByEntryIds(entryIds: number[]) {
    if (entryIds.length === 0) return [];
    const db = getDb();
    return await db.select().from(ep16LedgerTransactions).where(inArray(ep16LedgerTransactions.journalEntryId, entryIds));
  }

  async createLine(data: {
    journalEntryId: number;
    accountId: number;
    transactionType: "DEBIT" | "CREDIT";
    amount: number;
    balanceAfter?: number;
  }) {
    const db = getDb();
    const inserted = await db.insert(ep16LedgerTransactions).values({
      journalEntryId: data.journalEntryId,
      accountId: data.accountId,
      transactionType: data.transactionType,
      amount: data.amount.toFixed(4),
      balanceAfter: data.balanceAfter !== undefined ? data.balanceAfter.toFixed(4) : null,
    }).returning();
    return inserted[0];
  }
}
