import { getDb } from "../../../db/client.ts";
import { enterprisePositions, enterprisePositionHistory } from "../../../db/schema.ts";
import { eq, and, sql } from "drizzle-orm";
import { IEnterprisePosition, IEnterprisePositionHistory } from "../types/index.ts";

export class PositionRepository {
  public async getPosition(portfolioId: string, symbol: string): Promise<IEnterprisePosition | null> {
    const db = getDb();
    const result = await db.select()
      .from(enterprisePositions)
      .where(and(eq(enterprisePositions.portfolioId, portfolioId), eq(enterprisePositions.symbol, symbol)))
      .limit(1);
    return (result[0] as IEnterprisePosition) || null;
  }

  public async getPositionById(id: string, organizationId: string): Promise<IEnterprisePosition | null> {
    const db = getDb();
    const result = await db.select()
      .from(enterprisePositions)
      .where(and(eq(enterprisePositions.id, id), eq(enterprisePositions.organizationId, organizationId)))
      .limit(1);
    return (result[0] as IEnterprisePosition) || null;
  }

  public async getPositions(portfolioId: string, status?: string): Promise<IEnterprisePosition[]> {
    const db = getDb();
    const conditions = [eq(enterprisePositions.portfolioId, portfolioId)];
    if (status) {
      conditions.push(eq(enterprisePositions.status, status));
    }
    const result = await db.select()
      .from(enterprisePositions)
      .where(and(...conditions));
    return result as IEnterprisePosition[];
  }

  public async createPosition(data: Partial<IEnterprisePosition>): Promise<IEnterprisePosition> {
    const db = getDb();
    const result = await db.insert(enterprisePositions).values({
      id: data.id!,
      portfolioId: data.portfolioId!,
      organizationId: data.organizationId!,
      symbol: data.symbol!,
      assetClass: data.assetClass as any,
      status: data.status || 'OPEN',
      openQuantity: data.openQuantity || "0",
      averagePrice: data.averagePrice || "0",
      currentMarketPrice: data.currentMarketPrice || "0",
      marketValue: data.marketValue || "0",
      unrealizedPnl: data.unrealizedPnl || "0",
      realizedPnl: data.realizedPnl || "0",
      holdingPeriodDays: data.holdingPeriodDays || 0
    }).returning();
    return result[0] as IEnterprisePosition;
  }

  public async updatePosition(id: string, updates: Partial<IEnterprisePosition>): Promise<IEnterprisePosition> {
    const db = getDb();
    const updateData = { ...updates, updatedAt: new Date() };
    const result = await db.update(enterprisePositions)
      .set(updateData)
      .where(eq(enterprisePositions.id, id))
      .returning();
    return result[0] as IEnterprisePosition;
  }

  public async addHistory(data: Partial<IEnterprisePositionHistory>): Promise<IEnterprisePositionHistory> {
    const db = getDb();
    const result = await db.insert(enterprisePositionHistory).values({
      positionId: data.positionId!,
      executionId: data.executionId,
      action: data.action as any,
      quantity: data.quantity!,
      price: data.price!
    }).returning();
    return result[0] as IEnterprisePositionHistory;
  }

  public async getHistory(positionId: string): Promise<IEnterprisePositionHistory[]> {
    const db = getDb();
    return (await db.select().from(enterprisePositionHistory).where(eq(enterprisePositionHistory.positionId, positionId)).orderBy(enterprisePositionHistory.timestamp)) as IEnterprisePositionHistory[];
  }

  public async ensurePositionTables(): Promise<void> {
    const db = getDb();
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS enterprise_positions (
        id VARCHAR(50) PRIMARY KEY,
        portfolio_id VARCHAR(50) NOT NULL,
        organization_id VARCHAR(50) NOT NULL,
        symbol VARCHAR(50) NOT NULL,
        asset_class VARCHAR(50) NOT NULL,
        status VARCHAR(20) NOT NULL,
        open_quantity NUMERIC NOT NULL DEFAULT 0,
        average_price NUMERIC NOT NULL DEFAULT 0,
        current_market_price NUMERIC NOT NULL DEFAULT 0,
        market_value NUMERIC NOT NULL DEFAULT 0,
        unrealized_pnl NUMERIC NOT NULL DEFAULT 0,
        realized_pnl NUMERIC NOT NULL DEFAULT 0,
        holding_period_days INTEGER NOT NULL DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        UNIQUE (organization_id, portfolio_id, symbol)
      )
    `);

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS enterprise_position_history (
        id SERIAL PRIMARY KEY,
        position_id VARCHAR(50) NOT NULL,
        execution_id VARCHAR(50),
        action VARCHAR(20) NOT NULL,
        quantity NUMERIC NOT NULL,
        price NUMERIC NOT NULL,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
      )
    `);
  }
}

export const positionRepository = new PositionRepository();
