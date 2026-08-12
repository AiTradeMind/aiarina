import { getDb } from "../../../db/client.ts";
import { ep16ChartOfAccounts, ep16GeneralLedger, accountBalances } from "../../../db/schema.ts";
import { eq, and, sql, asc } from "drizzle-orm";
import { AccountType } from "../types/index.ts";

export class AccountingRepository {
  async findAllAccounts() {
    const db = getDb();
    const accounts = await db.select().from(ep16ChartOfAccounts).orderBy(asc(ep16ChartOfAccounts.accountCode));
    const gls = await db.select().from(ep16GeneralLedger);
    const glMap = new Map<number, string>();
    gls.forEach(g => {
      if (g.accountId !== null) glMap.set(g.accountId, g.currentBalance);
    });

    return accounts.map(a => ({
      ...a,
      currentBalance: parseFloat(glMap.get(a.id) || "0"),
    }));
  }

  async findAccountById(id: number) {
    const db = getDb();
    const res = await db.select().from(ep16ChartOfAccounts).where(eq(ep16ChartOfAccounts.id, id)).limit(1);
    return res[0] || null;
  }

  async findAccountByCode(accountCode: string) {
    const db = getDb();
    const res = await db.select().from(ep16ChartOfAccounts).where(eq(ep16ChartOfAccounts.accountCode, accountCode)).limit(1);
    return res[0] || null;
  }

  async createAccount(data: { accountCode: string; accountName: string; accountType: AccountType; currency?: string; description?: string }) {
    const db = getDb();
    const inserted = await db.insert(ep16ChartOfAccounts).values({
      accountCode: data.accountCode,
      accountName: data.accountName,
      accountType: data.accountType,
      currency: data.currency || "INR",
      description: data.description || null,
      isActive: true,
    }).returning();

    const newAcc = inserted[0];
    await db.insert(ep16GeneralLedger).values({
      accountId: newAcc.id,
      currentBalance: "0",
    });

    return newAcc;
  }

  async updateAccount(id: number, data: Partial<{ accountName: string; accountType: AccountType; description: string; isActive: boolean }>) {
    const db = getDb();
    const updated = await db.update(ep16ChartOfAccounts)
      .set({
        ...(data.accountName && { accountName: data.accountName }),
        ...(data.accountType && { accountType: data.accountType }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
      })
      .where(eq(ep16ChartOfAccounts.id, id))
      .returning();

    return updated[0];
  }

  async getAccountBalances(accountId: number, periodId?: number) {
    const db = getDb();
    let query = db.select().from(accountBalances).where(eq(accountBalances.accountId, accountId));
    if (periodId) {
      query = db.select().from(accountBalances).where(and(eq(accountBalances.accountId, accountId), eq(accountBalances.periodId, periodId))) as any;
    }
    return await query;
  }

  async upsertAccountBalances(data: {
    accountId: number;
    accountCode?: string;
    periodId?: number;
    openingBalance: number;
    closingBalance: number;
    currentBalance: number;
    runningBalance: number;
    debitTotal: number;
    creditTotal: number;
    periodBalance: number;
    carryForward: number;
  }) {
    const db = getDb();
    const existing = await db.select().from(accountBalances).where(eq(accountBalances.accountId, data.accountId)).limit(1);

    if (existing.length > 0) {
      const updated = await db.update(accountBalances).set({
        openingBalance: data.openingBalance,
        closingBalance: data.closingBalance,
        currentBalance: data.currentBalance,
        runningBalance: data.runningBalance,
        debitTotal: data.debitTotal,
        creditTotal: data.creditTotal,
        periodBalance: data.periodBalance,
        carryForward: data.carryForward,
        updatedAt: new Date(),
      }).where(eq(accountBalances.accountId, data.accountId)).returning();
      return updated[0];
    } else {
      const inserted = await db.insert(accountBalances).values({
        accountId: data.accountId,
        accountCode: data.accountCode || "",
        periodId: data.periodId || null,
        openingBalance: data.openingBalance,
        closingBalance: data.closingBalance,
        currentBalance: data.currentBalance,
        runningBalance: data.runningBalance,
        debitTotal: data.debitTotal,
        creditTotal: data.creditTotal,
        periodBalance: data.periodBalance,
        carryForward: data.carryForward,
      }).returning();
      return inserted[0];
    }
  }
}
