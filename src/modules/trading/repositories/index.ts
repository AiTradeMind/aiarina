import { eq, and } from "drizzle-orm";
import { getDb } from "../../../db/client.ts";
import { isInvalidOrg } from "../../../lib/utils.ts";
import { portfolios, positions, orders, trades, executions } from "../../../db/schema.ts";
import { 
  Portfolio, 
  Position, 
  Order, 
  Trade, 
  OrderStatus, 
  OrderType, 
  TransactionSide,
  Execution
} from "../types/index.ts";

export class PortfolioRepository {
  async findByOrganizationId(organizationId: string): Promise<Portfolio | null> {
    if (isInvalidOrg(organizationId)) {
      return null;
    }
    const db = getDb();
    const result = await db.select().from(portfolios).where(eq(portfolios.organizationId, organizationId)).limit(1);
    if (!result[0]) return null;
    return {
      ...result[0],
      createdAt: result[0].createdAt.toISOString(),
    };
  }

  async create(organizationId: string, name: string): Promise<Portfolio> {
    if (isInvalidOrg(organizationId)) {
      throw new Error("Cannot create Portfolio for invalid organization");
    }
    const db = getDb();
    const result = await db.insert(portfolios).values({
      organizationId,
      name,
    }).returning();
    return {
      ...result[0],
      createdAt: result[0].createdAt.toISOString(),
    };
  }

  async updateBalance(id: number, organizationId: string, cashBalance: string, buyingPower: string, realizedPnl: string): Promise<void> {
    const db = getDb();
    await db.update(portfolios).set({ 
      cashBalance, 
      buyingPower,
      realizedPnl,
      unrealizedPnl: "0.00" // Simplified for now
    }).where(and(eq(portfolios.id, id), eq(portfolios.organizationId, organizationId)));
  }
}

export class PositionRepository {
  async findByPortfolioId(portfolioId: number, organizationId: string): Promise<Position[]> {
    const db = getDb();
    const result = await db.select({
      position: positions
    }).from(positions)
      .leftJoin(portfolios, eq(positions.portfolioId, portfolios.id))
      .where(and(
        eq(positions.portfolioId, portfolioId),
        eq(portfolios.organizationId, organizationId)
      ));
    return result.map(p => ({
      ...p.position,
      updatedAt: p.position.updatedAt.toISOString(),
    }));
  }

  async findByTicker(portfolioId: number, ticker: string, organizationId: string): Promise<Position | null> {
    const db = getDb();
    const result = await db.select({
      position: positions
    }).from(positions)
      .leftJoin(portfolios, eq(positions.portfolioId, portfolios.id))
      .where(and(
        eq(positions.portfolioId, portfolioId),
        eq(positions.ticker, ticker),
        eq(portfolios.organizationId, organizationId)
      )).limit(1);
    if (!result[0]) return null;
    return {
      ...result[0].position,
      updatedAt: result[0].position.updatedAt.toISOString(),
    };
  }

  async upsert(portfolioId: number, ticker: string, quantity: string, averagePrice: string, marketPrice: string, pnl: string, organizationId: string): Promise<Position> {
    const db = getDb();
    const existing = await this.findByTicker(portfolioId, ticker, organizationId);
    
    if (existing) {
      const result = await db.update(positions).set({
        quantity,
        averagePrice,
        marketPrice,
        pnl,
        updatedAt: new Date(),
      }).where(eq(positions.id, existing.id)).returning();
      return {
        ...result[0],
        updatedAt: result[0].updatedAt.toISOString(),
      };
    } else {
      // Must verify portfolio belongs to orgId
      const portfolio = await db.select().from(portfolios).where(and(eq(portfolios.id, portfolioId), eq(portfolios.organizationId, organizationId))).limit(1);
      if (!portfolio[0]) throw new Error("Portfolio not found or unauthorized");

      const result = await db.insert(positions).values({
        portfolioId,
        ticker,
        quantity,
        averagePrice,
        marketPrice,
        pnl,
      }).returning();
      return {
        ...result[0],
        updatedAt: result[0].updatedAt.toISOString(),
      };
    }
  }

  async delete(id: number, organizationId: string): Promise<void> {
    const db = getDb();
    // Delete only if position belongs to an org-owned portfolio
    const result = await db.delete(positions).where(
      and(
        eq(positions.id, id),
        eq(
          positions.portfolioId,
          db.select({ id: portfolios.id }).from(portfolios).where(eq(portfolios.organizationId, organizationId)).as('p').id
        )
      )
    );
  }
}

export class OrderRepository {
  async findById(id: number, organizationId: string): Promise<Order | null> {
    const db = getDb();
    // JOIN to verify ownership
    const result = await db.select({
      order: orders,
    }).from(orders)
      .leftJoin(portfolios, eq(orders.portfolioId, portfolios.id))
      .where(and(
        eq(orders.id, id),
        eq(portfolios.organizationId, organizationId)
      ))
      .limit(1);

    if (!result[0]) return null;
    const o = result[0].order;
    return {
      ...o,
      type: o.type as OrderType,
      side: o.side as TransactionSide,
      status: o.status as OrderStatus,
      createdAt: o.createdAt.toISOString(),
      updatedAt: o.updatedAt.toISOString(),
    };
  }

  async findByPortfolioId(portfolioId: number, organizationId: string): Promise<Order[]> {
    const db = getDb();
    const result = await db.select({
      order: orders
    }).from(orders)
      .leftJoin(portfolios, eq(orders.portfolioId, portfolios.id))
      .where(and(
        eq(orders.portfolioId, portfolioId),
        eq(portfolios.organizationId, organizationId)
      ));
    return result.map(o => ({
      ...o.order,
      type: o.order.type as OrderType,
      side: o.order.side as TransactionSide,
      status: o.order.status as OrderStatus,
      createdAt: o.order.createdAt.toISOString(),
      updatedAt: o.order.updatedAt.toISOString(),
    }));
  }

  async create(data: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>, organizationId: string): Promise<Order> {
    const db = getDb();
    const portfolio = await db.select().from(portfolios).where(and(eq(portfolios.id, data.portfolioId), eq(portfolios.organizationId, organizationId))).limit(1);
    if (!portfolio[0]) throw new Error("Portfolio not found or unauthorized");

    const result = await db.insert(orders).values({
      ...data,
      updatedAt: new Date(),
    }).returning();
    return {
      ...result[0],
      type: result[0].type as OrderType,
      side: result[0].side as TransactionSide,
      status: result[0].status as OrderStatus,
      createdAt: result[0].createdAt.toISOString(),
      updatedAt: result[0].updatedAt.toISOString(),
    };
  }

  async update(id: number, organizationId: string, data: Partial<Omit<Order, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Order> {
    const db = getDb();
    const result = await db.update(orders).set({
      ...data,
      updatedAt: new Date(),
    }).where(and(
      eq(orders.id, id),
      eq(orders.portfolioId, db.select({id: portfolios.id}).from(portfolios).where(eq(portfolios.organizationId, organizationId)).as('p').id)
    )).returning();
    if (!result[0]) throw new Error("Order not found or unauthorized");

    return {
      ...result[0],
      type: result[0].type as OrderType,
      side: result[0].side as TransactionSide,
      status: result[0].status as OrderStatus,
      createdAt: result[0].createdAt.toISOString(),
      updatedAt: result[0].updatedAt.toISOString(),
    };
  }
}

export class ExecutionRepository {
  async findByPortfolioId(portfolioId: number, organizationId: string): Promise<Execution[]> {
    const db = getDb();
    const result = await db.select({
      execution: executions
    }).from(executions)
      .leftJoin(portfolios, eq(executions.portfolioId, portfolios.id))
      .where(and(
        eq(executions.portfolioId, portfolioId),
        eq(portfolios.organizationId, organizationId)
      ));
    return result.map(e => ({
      ...e.execution,
      side: e.execution.side as TransactionSide,
      commission: e.execution.commission || "0.00",
      timestamp: e.execution.timestamp.toISOString(),
    }));
  }

  async create(data: Omit<Execution, 'id' | 'timestamp'>, organizationId: string): Promise<Execution> {
    const db = getDb();
    const portfolio = await db.select().from(portfolios).where(and(eq(portfolios.id, data.portfolioId), eq(portfolios.organizationId, organizationId))).limit(1);
    if (!portfolio[0]) throw new Error("Portfolio not found or unauthorized");

    const result = await db.insert(executions).values({
      ...data,
    }).returning();
    return {
      ...result[0],
      side: result[0].side as TransactionSide,
      commission: result[0].commission || "0.00",
      timestamp: result[0].timestamp.toISOString(),
    };
  }
}

export class TradeRepository {
  async findByPortfolioId(portfolioId: number, organizationId: string): Promise<Trade[]> {
    const db = getDb();
    const result = await db.select({
      trade: trades
    }).from(trades)
      .leftJoin(portfolios, eq(trades.portfolioId, portfolios.id))
      .where(and(
        eq(trades.portfolioId, portfolioId),
        eq(portfolios.organizationId, organizationId)
      ));
    return result.map(t => ({
      ...t.trade,
      side: t.trade.side as TransactionSide,
      timestamp: t.trade.timestamp.toISOString(),
    }));
  }

  async create(data: Omit<Trade, 'id' | 'timestamp'>, organizationId: string): Promise<Trade> {
    const db = getDb();
    const portfolio = await db.select().from(portfolios).where(and(eq(portfolios.id, data.portfolioId), eq(portfolios.organizationId, organizationId))).limit(1);
    if (!portfolio[0]) throw new Error("Portfolio not found or unauthorized");

    const result = await db.insert(trades).values({
      ...data,
    }).returning();
    return {
      ...result[0],
      side: result[0].side as TransactionSide,
      timestamp: result[0].timestamp.toISOString(),
    };
  }
}
