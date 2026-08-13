import { getDb } from "../../../db/client.ts";
import {
  portfolioAccounts,
  portfolioPositions,
  portfolioHoldings,
  portfolioSnapshots,
  portfolioPnl,
  portfolioEvents,
  portfolioMetadata,
} from "../../../db/schema.ts";
import { eq, desc, and } from "drizzle-orm";
import {
  PortfolioAccount,
  PortfolioPosition,
  PortfolioHolding,
  PortfolioSnapshot,
  PortfolioPnLRecord,
  PortfolioEventRecord,
  PortfolioMetadataRecord,
} from "../types/index.ts";

export class PortfolioRepository {
  /**
   * Get or create default Portfolio Account
   */
  async getOrCreateAccount(portfolioId: string = "PF-MAIN-001", name: string = "Main Enterprise Portfolio"): Promise<PortfolioAccount> {
    const db = getDb();
    const rows = await db
      .select()
      .from(portfolioAccounts)
      .where(eq(portfolioAccounts.portfolioId, portfolioId))
      .limit(1);

    if (rows && rows.length > 0) {
      return this.mapAccount(rows[0]);
    }

    const [inserted] = await db
      .insert(portfolioAccounts)
      .values({
        portfolioId,
        name,
        status: "ACTIVE",
        totalValue: 1000000.0,
        cashBalance: 1000000.0,
        unrealizedPnl: 0.0,
        realizedPnl: 0.0,
        grossExposure: 0.0,
        netExposure: 0.0,
      })
      .returning();

    return this.mapAccount(inserted);
  }

  async getAccount(portfolioId: string): Promise<PortfolioAccount | null> {
    const db = getDb();
    const rows = await db
      .select()
      .from(portfolioAccounts)
      .where(eq(portfolioAccounts.portfolioId, portfolioId))
      .limit(1);

    if (!rows || rows.length === 0) return null;
    return this.mapAccount(rows[0]);
  }

  async updateAccount(portfolioId: string, data: Partial<PortfolioAccount>): Promise<PortfolioAccount> {
    const db = getDb();
    const updatePayload: Record<string, any> = {};

    if (data.name !== undefined) updatePayload.name = data.name;
    if (data.status !== undefined) updatePayload.status = data.status;
    if (data.totalValue !== undefined) updatePayload.totalValue = data.totalValue;
    if (data.cashBalance !== undefined) updatePayload.cashBalance = data.cashBalance;
    if (data.unrealizedPnl !== undefined) updatePayload.unrealizedPnl = data.unrealizedPnl;
    if (data.realizedPnl !== undefined) updatePayload.realizedPnl = data.realizedPnl;
    if (data.grossExposure !== undefined) updatePayload.grossExposure = data.grossExposure;
    if (data.netExposure !== undefined) updatePayload.netExposure = data.netExposure;
    if (data.fundId !== undefined) updatePayload.fundId = data.fundId;

    updatePayload.updatedAt = new Date();

    const [updated] = await db
      .update(portfolioAccounts)
      .set(updatePayload)
      .where(eq(portfolioAccounts.portfolioId, portfolioId))
      .returning();

    return this.mapAccount(updated);
  }

  /**
   * Position Management
   */
  async getPositions(portfolioId: string, status?: string): Promise<PortfolioPosition[]> {
    const db = getDb();
    let query = db.select().from(portfolioPositions).where(eq(portfolioPositions.portfolioId, portfolioId));

    const rows = await query;
    let mapped = (rows || []).map(this.mapPosition);
    if (status) {
      mapped = mapped.filter((p) => p.status === status);
    }
    return mapped;
  }

  async getPositionById(positionId: string): Promise<PortfolioPosition | null> {
    const db = getDb();
    const rows = await db
      .select()
      .from(portfolioPositions)
      .where(eq(portfolioPositions.positionId, positionId))
      .limit(1);

    if (!rows || rows.length === 0) return null;
    return this.mapPosition(rows[0]);
  }

  async getPositionBySymbol(portfolioId: string, symbol: string): Promise<PortfolioPosition | null> {
    const db = getDb();
    const rows = await db
      .select()
      .from(portfolioPositions)
      .where(and(eq(portfolioPositions.portfolioId, portfolioId), eq(portfolioPositions.symbol, symbol)))
      .limit(1);

    if (!rows || rows.length === 0) return null;
    return this.mapPosition(rows[0]);
  }

  async savePosition(position: PortfolioPosition): Promise<PortfolioPosition> {
    const db = getDb();
    const existing = await this.getPositionById(position.positionId);

    if (existing) {
      const [updated] = await db
        .update(portfolioPositions)
        .set({
          status: position.status,
          netQuantity: position.netQuantity,
          averagePrice: position.averagePrice,
          currentPrice: position.currentPrice,
          marketValue: position.marketValue,
          costValue: position.costValue,
          unrealizedPnl: position.unrealizedPnl,
          realizedPnl: position.realizedPnl,
          todaysPnl: position.todaysPnl,
          totalPnl: position.totalPnl,
          roi: position.roi,
          capitalUsed: position.capitalUsed,
          exposure: position.exposure,
          holdingPeriodDays: position.holdingPeriodDays,
          lastUpdatedAt: new Date(),
        })
        .where(eq(portfolioPositions.positionId, position.positionId))
        .returning();

      return this.mapPosition(updated);
    } else {
      const [inserted] = await db
        .insert(portfolioPositions)
        .values({
          positionId: position.positionId,
          portfolioId: position.portfolioId,
          symbol: position.symbol,
          positionType: position.positionType,
          status: position.status,
          netQuantity: position.netQuantity,
          averagePrice: position.averagePrice,
          currentPrice: position.currentPrice,
          marketValue: position.marketValue,
          costValue: position.costValue,
          unrealizedPnl: position.unrealizedPnl,
          realizedPnl: position.realizedPnl,
          todaysPnl: position.todaysPnl,
          totalPnl: position.totalPnl,
          roi: position.roi,
          capitalUsed: position.capitalUsed,
          exposure: position.exposure,
          holdingPeriodDays: position.holdingPeriodDays,
          openedAt: new Date(),
          lastUpdatedAt: new Date(),
        })
        .returning();

      return this.mapPosition(inserted);
    }
  }

  /**
   * Holdings Management
   */
  async getHoldings(portfolioId: string): Promise<PortfolioHolding[]> {
    const db = getDb();
    const rows = await db
      .select()
      .from(portfolioHoldings)
      .where(eq(portfolioHoldings.portfolioId, portfolioId));

    return (rows || []).map(this.mapHolding);
  }

  async saveHolding(holding: PortfolioHolding): Promise<PortfolioHolding> {
    const db = getDb();
    const rows = await db
      .select()
      .from(portfolioHoldings)
      .where(and(eq(portfolioHoldings.portfolioId, holding.portfolioId), eq(portfolioHoldings.symbol, holding.symbol)))
      .limit(1);

    if (rows && rows.length > 0) {
      const [updated] = await db
        .update(portfolioHoldings)
        .set({
          quantity: holding.quantity,
          averageCost: holding.averageCost,
          currentPrice: holding.currentPrice,
          totalCost: holding.totalCost,
          currentValue: holding.currentValue,
          unrealizedPnl: holding.unrealizedPnl,
          weight: holding.weight,
          updatedAt: new Date(),
        })
        .where(eq(portfolioHoldings.holdingId, rows[0].holdingId))
        .returning();

      return this.mapHolding(updated);
    } else {
      const [inserted] = await db
        .insert(portfolioHoldings)
        .values({
          holdingId: holding.holdingId,
          portfolioId: holding.portfolioId,
          symbol: holding.symbol,
          assetClass: holding.assetClass,
          quantity: holding.quantity,
          averageCost: holding.averageCost,
          currentPrice: holding.currentPrice,
          totalCost: holding.totalCost,
          currentValue: holding.currentValue,
          unrealizedPnl: holding.unrealizedPnl,
          weight: holding.weight,
        })
        .returning();

      return this.mapHolding(inserted);
    }
  }

  /**
   * PnL Management
   */
  async savePnLRecord(pnl: PortfolioPnLRecord): Promise<PortfolioPnLRecord> {
    const db = getDb();
    const [inserted] = await db
      .insert(portfolioPnl)
      .values({
        pnlRecordId: pnl.pnlRecordId,
        portfolioId: pnl.portfolioId,
        positionId: pnl.positionId,
        symbol: pnl.symbol,
        dailyMtm: pnl.dailyMtm,
        runningMtm: pnl.runningMtm,
        realizedPnl: pnl.realizedPnl,
        unrealizedPnl: pnl.unrealizedPnl,
        totalPnl: pnl.totalPnl,
        date: pnl.date,
      })
      .returning();

    return this.mapPnL(inserted);
  }

  async getPnLRecords(portfolioId: string, limit: number = 100): Promise<PortfolioPnLRecord[]> {
    const db = getDb();
    const rows = await db
      .select()
      .from(portfolioPnl)
      .where(eq(portfolioPnl.portfolioId, portfolioId))
      .orderBy(desc(portfolioPnl.createdAt))
      .limit(limit);

    return (rows || []).map(this.mapPnL);
  }

  /**
   * Snapshots Management
   */
  async saveSnapshot(snapshot: PortfolioSnapshot): Promise<PortfolioSnapshot> {
    const db = getDb();
    const [inserted] = await db
      .insert(portfolioSnapshots)
      .values({
        snapshotId: snapshot.snapshotId,
        portfolioId: snapshot.portfolioId,
        snapshotType: snapshot.snapshotType,
        totalValue: snapshot.totalValue,
        unrealizedPnl: snapshot.unrealizedPnl,
        realizedPnl: snapshot.realizedPnl,
        grossExposure: snapshot.grossExposure,
        netExposure: snapshot.netExposure,
        positionCount: snapshot.positionCount,
        data: snapshot.data,
      })
      .returning();

    return this.mapSnapshot(inserted);
  }

  async getSnapshots(portfolioId: string, limit: number = 100): Promise<PortfolioSnapshot[]> {
    const db = getDb();
    const rows = await db
      .select()
      .from(portfolioSnapshots)
      .where(eq(portfolioSnapshots.portfolioId, portfolioId))
      .orderBy(desc(portfolioSnapshots.timestamp))
      .limit(limit);

    return (rows || []).map(this.mapSnapshot);
  }

  /**
   * Events & History Management
   */
  async recordEvent(event: PortfolioEventRecord): Promise<PortfolioEventRecord> {
    const db = getDb();
    const [inserted] = await db
      .insert(portfolioEvents)
      .values({
        eventId: event.eventId,
        portfolioId: event.portfolioId,
        eventType: event.eventType,
        payload: event.payload,
      })
      .returning();

    return this.mapEvent(inserted);
  }

  async getEvents(portfolioId: string, limit: number = 100): Promise<PortfolioEventRecord[]> {
    const db = getDb();
    const rows = await db
      .select()
      .from(portfolioEvents)
      .where(eq(portfolioEvents.portfolioId, portfolioId))
      .orderBy(desc(portfolioEvents.timestamp))
      .limit(limit);

    return (rows || []).map(this.mapEvent);
  }

  /**
   * Metadata Management
   */
  async saveMetadata(meta: PortfolioMetadataRecord): Promise<PortfolioMetadataRecord> {
    const db = getDb();
    const rows = await db
      .select()
      .from(portfolioMetadata)
      .where(eq(portfolioMetadata.portfolioId, meta.portfolioId))
      .limit(1);

    if (rows && rows.length > 0) {
      const [updated] = await db
        .update(portfolioMetadata)
        .set({
          manager: meta.manager,
          benchmark: meta.benchmark,
          riskLimits: meta.riskLimits,
          customTags: meta.customTags,
          updatedAt: new Date(),
        })
        .where(eq(portfolioMetadata.portfolioId, meta.portfolioId))
        .returning();

      return this.mapMetadata(updated);
    } else {
      const [inserted] = await db
        .insert(portfolioMetadata)
        .values({
          portfolioId: meta.portfolioId,
          manager: meta.manager,
          benchmark: meta.benchmark,
          riskLimits: meta.riskLimits,
          customTags: meta.customTags,
        })
        .returning();

      return this.mapMetadata(inserted);
    }
  }

  async getMetadata(portfolioId: string): Promise<PortfolioMetadataRecord | null> {
    const db = getDb();
    const rows = await db
      .select()
      .from(portfolioMetadata)
      .where(eq(portfolioMetadata.portfolioId, portfolioId))
      .limit(1);

    if (!rows || rows.length === 0) return null;
    return this.mapMetadata(rows[0]);
  }

  // Mapper helpers
  private mapAccount(row: any): PortfolioAccount {
    return {
      id: row.id,
      portfolioId: row.portfolioId,
      fundId: row.fundId,
      name: row.name,
      status: row.status,
      totalValue: Number(row.totalValue || 0),
      cashBalance: Number(row.cashBalance || 0),
      unrealizedPnl: Number(row.unrealizedPnl || 0),
      realizedPnl: Number(row.realizedPnl || 0),
      grossExposure: Number(row.grossExposure || 0),
      netExposure: Number(row.netExposure || 0),
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }

  private mapPosition(row: any): PortfolioPosition {
    return {
      id: row.id,
      positionId: row.positionId,
      portfolioId: row.portfolioId,
      symbol: row.symbol,
      positionType: row.positionType,
      status: row.status,
      netQuantity: Number(row.netQuantity || 0),
      averagePrice: Number(row.averagePrice || 0),
      currentPrice: Number(row.currentPrice || 0),
      marketValue: Number(row.marketValue || 0),
      costValue: Number(row.costValue || 0),
      unrealizedPnl: Number(row.unrealizedPnl || 0),
      realizedPnl: Number(row.realizedPnl || 0),
      todaysPnl: Number(row.todaysPnl || 0),
      totalPnl: Number(row.totalPnl || 0),
      roi: Number(row.roi || 0),
      capitalUsed: Number(row.capitalUsed || 0),
      exposure: Number(row.exposure || 0),
      holdingPeriodDays: Number(row.holdingPeriodDays || 0),
      openedAt: row.openedAt,
      lastUpdatedAt: row.lastUpdatedAt,
    };
  }

  private mapHolding(row: any): PortfolioHolding {
    return {
      id: row.id,
      holdingId: row.holdingId,
      portfolioId: row.portfolioId,
      symbol: row.symbol,
      assetClass: row.assetClass,
      quantity: Number(row.quantity || 0),
      averageCost: Number(row.averageCost || 0),
      currentPrice: Number(row.currentPrice || 0),
      totalCost: Number(row.totalCost || 0),
      currentValue: Number(row.currentValue || 0),
      unrealizedPnl: Number(row.unrealizedPnl || 0),
      weight: Number(row.weight || 0),
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }

  private mapSnapshot(row: any): PortfolioSnapshot {
    return {
      id: row.id,
      snapshotId: row.snapshotId,
      portfolioId: row.portfolioId,
      snapshotType: row.snapshotType,
      totalValue: Number(row.totalValue || 0),
      unrealizedPnl: Number(row.unrealizedPnl || 0),
      realizedPnl: Number(row.realizedPnl || 0),
      grossExposure: Number(row.grossExposure || 0),
      netExposure: Number(row.netExposure || 0),
      positionCount: Number(row.positionCount || 0),
      data: row.data || {},
      timestamp: row.timestamp,
    };
  }

  private mapPnL(row: any): PortfolioPnLRecord {
    return {
      id: row.id,
      pnlRecordId: row.pnlRecordId,
      portfolioId: row.portfolioId,
      positionId: row.positionId,
      symbol: row.symbol,
      dailyMtm: Number(row.dailyMtm || 0),
      runningMtm: Number(row.runningMtm || 0),
      realizedPnl: Number(row.realizedPnl || 0),
      unrealizedPnl: Number(row.unrealizedPnl || 0),
      totalPnl: Number(row.totalPnl || 0),
      date: row.date,
      createdAt: row.createdAt,
    };
  }

  private mapEvent(row: any): PortfolioEventRecord {
    return {
      id: row.id,
      eventId: row.eventId,
      portfolioId: row.portfolioId,
      eventType: row.eventType,
      payload: row.payload || {},
      timestamp: row.timestamp,
    };
  }

  private mapMetadata(row: any): PortfolioMetadataRecord {
    return {
      id: row.id,
      portfolioId: row.portfolioId,
      manager: row.manager,
      benchmark: row.benchmark,
      riskLimits: row.riskLimits || {},
      customTags: row.customTags || [],
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }
}
