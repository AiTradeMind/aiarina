import { eq, and, desc } from "drizzle-orm";
import { getDb } from "../../../db/client.ts";
import { isInvalidOrg } from "../../../lib/utils.ts";
import { 
  paperAccounts, 
  paperOrders, 
  paperPositions, 
  paperTrades, 
  paperJournal 
} from "../../../db/schema.ts";
import { 
  PaperAccount, 
  PaperOrder, 
  PaperPosition, 
  PaperTrade, 
  PaperJournalEntry 
} from "../types/index.ts";
import { OrderStatus, OrderType, TransactionSide } from "../../trading/types/index.ts";

export class PaperAccountRepository {
  async findByOrganizationId(organizationId: string): Promise<PaperAccount | null> {
    if (isInvalidOrg(organizationId)) {
      return null;
    }
    const db = getDb();
    const result = await db.select().from(paperAccounts).where(eq(paperAccounts.organizationId, organizationId)).limit(1);
    if (!result[0]) return null;
    return {
      ...result[0],
      createdAt: result[0].createdAt.toISOString(),
      updatedAt: result[0].updatedAt.toISOString(),
    };
  }

  async create(organizationId: string, initialBalance = "100000.00"): Promise<PaperAccount> {
    if (isInvalidOrg(organizationId)) {
      throw new Error("Cannot create account for invalid organization");
    }
    const db = getDb();
    const result = await db.insert(paperAccounts).values({
      organizationId,
      balance: initialBalance,
      initialBalance,
    }).returning();
    return {
      ...result[0],
      createdAt: result[0].createdAt.toISOString(),
      updatedAt: result[0].updatedAt.toISOString(),
    };
  }

  async updateBalance(organizationId: string, balance: string): Promise<void> {
    if (isInvalidOrg(organizationId)) {
      return;
    }
    const db = getDb();
    await db.update(paperAccounts)
      .set({ balance, updatedAt: new Date() })
      .where(eq(paperAccounts.organizationId, organizationId));
  }
}

export class PaperOrderRepository {
  async findByOrganizationId(organizationId: string, labId?: string): Promise<PaperOrder[]> {
    if (isInvalidOrg(organizationId)) {
      return [];
    }
    const db = getDb();
    const condition = labId 
      ? and(eq(paperOrders.organizationId, organizationId), eq(paperOrders.labId, labId))
      : eq(paperOrders.organizationId, organizationId);
    const result = await db.select().from(paperOrders)
      .where(condition)
      .orderBy(desc(paperOrders.createdAt));
    return result.map(o => ({
      ...o,
      userId: o.userId as number,
      type: o.type as OrderType,
      side: o.side as TransactionSide,
      status: o.status as OrderStatus,
      createdAt: o.createdAt.toISOString(),
      updatedAt: o.updatedAt.toISOString(),
    }));
  }

  async create(data: any): Promise<PaperOrder> {
    const db = getDb();
    const result = await db.insert(paperOrders).values(data).returning();
    return {
      ...result[0],
      userId: result[0].userId as number,
      type: result[0].type as OrderType,
      side: result[0].side as TransactionSide,
      status: result[0].status as OrderStatus,
      createdAt: result[0].createdAt.toISOString(),
      updatedAt: result[0].updatedAt.toISOString(),
    };
  }

  async updateStatus(id: number, status: OrderStatus): Promise<void> {
    const db = getDb();
    await db.update(paperOrders).set({ status, updatedAt: new Date() }).where(eq(paperOrders.id, id));
  }

  async findById(id: number, organizationId: string): Promise<PaperOrder | null> {
    const db = getDb();
    const result = await db.select().from(paperOrders)
      .where(and(eq(paperOrders.id, id), eq(paperOrders.organizationId, organizationId)))
      .limit(1);
    if (!result[0]) return null;
    return {
      ...result[0],
      userId: result[0].userId as number,
      type: result[0].type as OrderType,
      side: result[0].side as TransactionSide,
      status: result[0].status as OrderStatus,
      createdAt: result[0].createdAt.toISOString(),
      updatedAt: result[0].updatedAt.toISOString(),
    };
  }
}

export class PaperPositionRepository {
  async findByOrganizationId(organizationId: string, labId?: string): Promise<PaperPosition[]> {
    if (isInvalidOrg(organizationId)) {
      return [];
    }
    const db = getDb();
    const condition = labId 
      ? and(eq(paperPositions.organizationId, organizationId), eq(paperPositions.labId, labId))
      : eq(paperPositions.organizationId, organizationId);
    const result = await db.select().from(paperPositions).where(condition);
    return result.map(p => ({
      ...p,
      updatedAt: p.updatedAt.toISOString(),
    }));
  }

  async findByTicker(organizationId: string, ticker: string, labId = "LAB_01_STOCK"): Promise<PaperPosition | null> {
    if (isInvalidOrg(organizationId)) {
      return null;
    }
    const db = getDb();
    const result = await db.select().from(paperPositions)
      .where(and(eq(paperPositions.organizationId, organizationId), eq(paperPositions.labId, labId), eq(paperPositions.ticker, ticker)))
      .limit(1);
    if (!result[0]) return null;
    return {
      ...result[0],
      updatedAt: result[0].updatedAt.toISOString(),
    };
  }

  async upsert(data: any): Promise<void> {
    if (isInvalidOrg(data.organizationId)) {
      return;
    }
    const db = getDb();
    const existing = await this.findByTicker(data.organizationId, data.ticker);
    if (existing) {
      await db.update(paperPositions)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(paperPositions.id, existing.id));
    } else {
      await db.insert(paperPositions).values(data);
    }
  }

  async delete(id: number): Promise<void> {
    const db = getDb();
    await db.delete(paperPositions).where(eq(paperPositions.id, id));
  }
}

export class PaperTradeRepository {
  async findByOrganizationId(organizationId: string, labId?: string): Promise<PaperTrade[]> {
    if (isInvalidOrg(organizationId)) {
      return [];
    }
    const db = getDb();
    const condition = labId 
      ? and(eq(paperTrades.organizationId, organizationId), eq(paperTrades.labId, labId))
      : eq(paperTrades.organizationId, organizationId);
    const result = await db.select().from(paperTrades)
      .where(condition)
      .orderBy(desc(paperTrades.timestamp));
    return result.map(t => ({
      ...t,
      side: t.side as TransactionSide,
      timestamp: t.timestamp.toISOString(),
    }));
  }

  async create(data: any): Promise<PaperTrade> {
    if (isInvalidOrg(data.organizationId)) {
      throw new Error("Cannot create trade for invalid organization");
    }
    const db = getDb();
    const result = await db.insert(paperTrades).values(data).returning();
    return {
      ...result[0],
      side: result[0].side as TransactionSide,
      timestamp: result[0].timestamp.toISOString(),
    };
  }
}

export class PaperJournalRepository {
  async findByOrganizationId(organizationId: string, labId?: string): Promise<PaperJournalEntry[]> {
    if (isInvalidOrg(organizationId)) {
      return [];
    }
    const db = getDb();
    const condition = labId 
      ? and(eq(paperJournal.organizationId, organizationId), eq(paperJournal.labId, labId))
      : eq(paperJournal.organizationId, organizationId);
    const result = await db.select().from(paperJournal)
      .where(condition)
      .orderBy(desc(paperJournal.timestamp));
    return result.map(j => ({
      ...j,
      entryType: j.entryType as 'TRADE' | 'DEPOSIT' | 'WITHDRAWAL',
      timestamp: j.timestamp.toISOString(),
    }));
  }

  async create(data: any): Promise<PaperJournalEntry> {
    const db = getDb();
    const result = await db.insert(paperJournal).values(data).returning();
    return {
      ...result[0],
      entryType: result[0].entryType as 'TRADE' | 'DEPOSIT' | 'WITHDRAWAL',
      timestamp: result[0].timestamp.toISOString(),
    };
  }
}
