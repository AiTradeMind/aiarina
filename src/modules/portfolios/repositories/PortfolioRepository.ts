import { getDb } from "../../../db/client.ts";
import { enterprisePortfolios, enterprisePortfolioSnapshots } from "../../../db/schema.ts";
import { eq, and, sql } from "drizzle-orm";
import { IEnterprisePortfolio, IEnterprisePortfolioSnapshot } from "../types/index.ts";

export class PortfolioRepository {
  public async getPortfolio(id: string, organizationId: string): Promise<IEnterprisePortfolio | null> {
    const db = getDb();
    const result = await db.select()
      .from(enterprisePortfolios)
      .where(and(eq(enterprisePortfolios.id, id), eq(enterprisePortfolios.organizationId, organizationId)))
      .limit(1);
    return (result[0] as IEnterprisePortfolio) || null;
  }

  public async getPortfoliosByOrg(organizationId: string): Promise<IEnterprisePortfolio[]> {
    const db = getDb();
    const result = await db.select()
      .from(enterprisePortfolios)
      .where(eq(enterprisePortfolios.organizationId, organizationId));
    return result as IEnterprisePortfolio[];
  }

  public async createPortfolio(data: Partial<IEnterprisePortfolio>): Promise<IEnterprisePortfolio> {
    const db = getDb();
    const result = await db.insert(enterprisePortfolios).values({
      id: data.id!,
      organizationId: data.organizationId!,
      type: data.type || 'PAPER',
      status: data.status || 'ACTIVE',
      cashBalance: data.cashBalance || "0",
      blockedCash: data.blockedCash || "0",
      availableCash: data.availableCash || "0",
      equity: data.equity || "0",
      usedMargin: data.usedMargin || "0",
      availableMargin: data.availableMargin || "0",
      buyingPower: data.buyingPower || "0",
      portfolioValue: data.portfolioValue || "0"
    }).returning();
    return result[0] as IEnterprisePortfolio;
  }

  public async updatePortfolio(id: string, organizationId: string, updates: Partial<IEnterprisePortfolio>): Promise<IEnterprisePortfolio> {
    const db = getDb();
    const updateData = { ...updates, updatedAt: new Date() };
    const result = await db.update(enterprisePortfolios)
      .set(updateData)
      .where(and(eq(enterprisePortfolios.id, id), eq(enterprisePortfolios.organizationId, organizationId)))
      .returning();
    return result[0] as IEnterprisePortfolio;
  }

  public async createSnapshot(data: Partial<IEnterprisePortfolioSnapshot>): Promise<IEnterprisePortfolioSnapshot> {
    const db = getDb();
    const result = await db.insert(enterprisePortfolioSnapshots).values({
      portfolioId: data.portfolioId!,
      snapshotDate: data.snapshotDate!,
      cashBalance: data.cashBalance!,
      equity: data.equity!,
      portfolioValue: data.portfolioValue!
    }).returning();
    return result[0] as IEnterprisePortfolioSnapshot;
  }

  public async getSnapshots(portfolioId: string): Promise<IEnterprisePortfolioSnapshot[]> {
    const db = getDb();
    const result = await db.select()
      .from(enterprisePortfolioSnapshots)
      .where(eq(enterprisePortfolioSnapshots.portfolioId, portfolioId))
      .orderBy(enterprisePortfolioSnapshots.snapshotDate);
    return result as IEnterprisePortfolioSnapshot[];
  }

  public async ensurePortfolioTables(): Promise<void> {
    const db = getDb();
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS enterprise_portfolios (
        id VARCHAR(50) PRIMARY KEY,
        organization_id VARCHAR(50) NOT NULL,
        type VARCHAR(20) NOT NULL,
        status VARCHAR(20) NOT NULL,
        cash_balance NUMERIC NOT NULL DEFAULT 0,
        blocked_cash NUMERIC NOT NULL DEFAULT 0,
        available_cash NUMERIC NOT NULL DEFAULT 0,
        equity NUMERIC NOT NULL DEFAULT 0,
        used_margin NUMERIC NOT NULL DEFAULT 0,
        available_margin NUMERIC NOT NULL DEFAULT 0,
        buying_power NUMERIC NOT NULL DEFAULT 0,
        portfolio_value NUMERIC NOT NULL DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
      )
    `);

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS enterprise_portfolio_snapshots (
        id SERIAL PRIMARY KEY,
        portfolio_id VARCHAR(50) NOT NULL,
        snapshot_date DATE NOT NULL,
        cash_balance NUMERIC NOT NULL,
        equity NUMERIC NOT NULL,
        portfolio_value NUMERIC NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
      )
    `);
  }
}

export const portfolioRepository = new PortfolioRepository();
