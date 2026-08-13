import { getDb } from "../../../db/client.ts";
import { enterpriseTradeJournal, enterpriseTradeLedger, enterprisePnlSnapshots, enterpriseTradeStatistics } from "../../../db/schema.ts";
import { eq, and, sql } from "drizzle-orm";
import { IEnterpriseTradeJournal, IEnterpriseTradeLedger, IEnterprisePnlSnapshot, IEnterpriseTradeStatistics } from "../types/ep05.ts";

export class TradeRepository {
  public async createJournalEntry(data: Partial<IEnterpriseTradeJournal>): Promise<IEnterpriseTradeJournal> {
    const db = getDb();
    const result = await db.insert(enterpriseTradeJournal).values({
      id: data.id!,
      organizationId: data.organizationId!,
      portfolioId: data.portfolioId!,
      positionId: data.positionId!,
      executionId: data.executionId,
      symbol: data.symbol!,
      action: data.action!,
      side: data.side!,
      quantity: data.quantity || "0",
      price: data.price || "0",
      grossPnl: data.grossPnl || "0",
      netPnl: data.netPnl || "0",
      transactionCosts: data.transactionCosts || "0",
      status: data.status || "COMPLETED",
      metadata: data.metadata || {}
    }).returning();
    return result[0] as IEnterpriseTradeJournal;
  }

  public async getTradesByPortfolio(portfolioId: string, status?: string): Promise<IEnterpriseTradeJournal[]> {
    const db = getDb();
    const conditions = [eq(enterpriseTradeJournal.portfolioId, portfolioId)];
    if (status) conditions.push(eq(enterpriseTradeJournal.status, status));
    let query = db.select().from(enterpriseTradeJournal).where(and(...conditions));
    return (await query.orderBy(sql`${enterpriseTradeJournal.createdAt} DESC`)) as IEnterpriseTradeJournal[];
  }

  public async getTradeById(id: string, organizationId: string): Promise<IEnterpriseTradeJournal | null> {
    const db = getDb();
    const result = await db.select().from(enterpriseTradeJournal)
      .where(and(eq(enterpriseTradeJournal.id, id), eq(enterpriseTradeJournal.organizationId, organizationId)))
      .limit(1);
    return (result[0] as IEnterpriseTradeJournal) || null;
  }

  public async createLedgerEntry(data: Partial<IEnterpriseTradeLedger>): Promise<IEnterpriseTradeLedger> {
    const db = getDb();
    const result = await db.insert(enterpriseTradeLedger).values({
      journalId: data.journalId!,
      entryType: data.entryType!,
      amount: data.amount!,
      currency: data.currency || "INR",
      description: data.description || ""
    }).returning();
    return result[0] as IEnterpriseTradeLedger;
  }

  public async getPnlSnapshots(portfolioId: string): Promise<IEnterprisePnlSnapshot[]> {
    const db = getDb();
    return (await db.select().from(enterprisePnlSnapshots).where(eq(enterprisePnlSnapshots.portfolioId, portfolioId)).orderBy(sql`${enterprisePnlSnapshots.snapshotDate} DESC`)) as IEnterprisePnlSnapshot[];
  }

  public async getTradeStatistics(portfolioId: string): Promise<IEnterpriseTradeStatistics | null> {
    const db = getDb();
    const result = await db.select().from(enterpriseTradeStatistics).where(eq(enterpriseTradeStatistics.portfolioId, portfolioId)).limit(1);
    return (result[0] as IEnterpriseTradeStatistics) || null;
  }

  public async ensureTables(): Promise<void> {
    const db = getDb();
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS enterprise_trade_journal (
        id VARCHAR(50) PRIMARY KEY,
        organization_id VARCHAR(50) NOT NULL,
        portfolio_id VARCHAR(50) NOT NULL,
        position_id VARCHAR(50) NOT NULL,
        execution_id VARCHAR(50),
        symbol VARCHAR(50) NOT NULL,
        action VARCHAR(20) NOT NULL,
        side VARCHAR(10) NOT NULL,
        quantity NUMERIC NOT NULL DEFAULT 0,
        price NUMERIC NOT NULL DEFAULT 0,
        gross_pnl NUMERIC DEFAULT 0,
        net_pnl NUMERIC DEFAULT 0,
        transaction_costs NUMERIC DEFAULT 0,
        status VARCHAR(20) NOT NULL,
        metadata JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
      )
    `);

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS enterprise_trade_ledger (
        id SERIAL PRIMARY KEY,
        journal_id VARCHAR(50) NOT NULL REFERENCES enterprise_trade_journal(id) ON DELETE CASCADE,
        entry_type VARCHAR(20) NOT NULL,
        amount NUMERIC NOT NULL,
        currency VARCHAR(10) DEFAULT 'INR' NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
      )
    `);

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS enterprise_pnl_snapshots (
        id SERIAL PRIMARY KEY,
        organization_id VARCHAR(50) NOT NULL,
        portfolio_id VARCHAR(50) NOT NULL,
        period VARCHAR(20) NOT NULL,
        snapshot_date DATE NOT NULL,
        realized_pnl NUMERIC NOT NULL DEFAULT 0,
        unrealized_pnl NUMERIC NOT NULL DEFAULT 0,
        gross_pnl NUMERIC NOT NULL DEFAULT 0,
        net_pnl NUMERIC NOT NULL DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
      )
    `);

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS enterprise_trade_statistics (
        id VARCHAR(50) PRIMARY KEY,
        organization_id VARCHAR(50) NOT NULL,
        portfolio_id VARCHAR(50) NOT NULL,
        total_trades INTEGER NOT NULL DEFAULT 0,
        winning_trades INTEGER NOT NULL DEFAULT 0,
        losing_trades INTEGER NOT NULL DEFAULT 0,
        win_rate NUMERIC NOT NULL DEFAULT 0,
        loss_rate NUMERIC NOT NULL DEFAULT 0,
        average_holding_time_days NUMERIC NOT NULL DEFAULT 0,
        average_profit NUMERIC NOT NULL DEFAULT 0,
        average_loss NUMERIC NOT NULL DEFAULT 0,
        largest_win NUMERIC NOT NULL DEFAULT 0,
        largest_loss NUMERIC NOT NULL DEFAULT 0,
        profit_factor NUMERIC NOT NULL DEFAULT 0,
        expectancy NUMERIC NOT NULL DEFAULT 0,
        average_risk_reward NUMERIC NOT NULL DEFAULT 0,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
      )
    `);
  }
}

export const tradeRepository = new TradeRepository();
