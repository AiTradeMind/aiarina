import { getDb } from "../../../../db/client.ts";
import { 
  strategyBacktests, strategyBacktestRuns, strategyBacktestOrders,
  strategyBacktestPositions, strategyBacktestTrades, strategyBacktestMetrics,
  strategyBacktestReports, strategyBacktestEquityCurve, strategyBacktestHistory
} from "../../../../db/schema.ts";
import { eq, desc } from "drizzle-orm";
import { 
  StrategyBacktest, StrategyBacktestRun, StrategyBacktestOrder,
  StrategyBacktestPosition, StrategyBacktestTrade, StrategyBacktestMetrics,
  StrategyBacktestReport, StrategyBacktestEquityCurve, StrategyBacktestHistory
} from "../types/index.ts";

export class BacktestingRepository {
  async getBacktests(strategyId: string): Promise<StrategyBacktest[]> {
    const db = await getDb();
    return await db.select().from(strategyBacktests).where(eq(strategyBacktests.strategyId, strategyId)).orderBy(desc(strategyBacktests.createdTime)) as StrategyBacktest[];
  }

  async getBacktestById(id: string): Promise<StrategyBacktest | null> {
    const db = await getDb();
    const result = await db.select().from(strategyBacktests).where(eq(strategyBacktests.id, id));
    return result.length > 0 ? result[0] as StrategyBacktest : null;
  }

  async getRuns(backtestId: string): Promise<StrategyBacktestRun[]> {
    const db = await getDb();
    return await db.select().from(strategyBacktestRuns).where(eq(strategyBacktestRuns.backtestId, backtestId)).orderBy(desc(strategyBacktestRuns.startTime)) as StrategyBacktestRun[];
  }

  async getRunById(runId: string): Promise<StrategyBacktestRun | null> {
    const db = await getDb();
    const result = await db.select().from(strategyBacktestRuns).where(eq(strategyBacktestRuns.id, runId));
    return result.length > 0 ? result[0] as StrategyBacktestRun : null;
  }

  async getMetrics(runId: string): Promise<StrategyBacktestMetrics | null> {
    const db = await getDb();
    const result = await db.select().from(strategyBacktestMetrics).where(eq(strategyBacktestMetrics.runId, runId));
    return result.length > 0 ? result[0] as StrategyBacktestMetrics : null;
  }

  async getReports(runId: string): Promise<StrategyBacktestReport[]> {
    const db = await getDb();
    return await db.select().from(strategyBacktestReports).where(eq(strategyBacktestReports.runId, runId)) as StrategyBacktestReport[];
  }

  async getHistory(strategyId: string): Promise<StrategyBacktestHistory[]> {
    const db = await getDb();
    return await db.select().from(strategyBacktestHistory).where(eq(strategyBacktestHistory.strategyId, strategyId)).orderBy(desc(strategyBacktestHistory.timestamp)) as StrategyBacktestHistory[];
  }

  async createBacktest(data: StrategyBacktest): Promise<void> {
    const db = await getDb();
    // @ts-ignore
    await db.insert(strategyBacktests).values(data);
  }

  async createRun(data: StrategyBacktestRun): Promise<void> {
    const db = await getDb();
    // @ts-ignore
    await db.insert(strategyBacktestRuns).values(data);
  }
  
  async updateRunProgress(id: string, progress: number, status: string): Promise<void> {
    const db = await getDb();
    // @ts-ignore
    await db.update(strategyBacktestRuns).set({ progress, status }).where(eq(strategyBacktestRuns.id, id));
  }

  async createMetrics(data: StrategyBacktestMetrics): Promise<void> {
    const db = await getDb();
    // @ts-ignore
    await db.insert(strategyBacktestMetrics).values(data);
  }

  async createReport(data: StrategyBacktestReport): Promise<void> {
    const db = await getDb();
    // @ts-ignore
    await db.insert(strategyBacktestReports).values(data);
  }

  async createHistory(data: StrategyBacktestHistory): Promise<void> {
    const db = await getDb();
    // @ts-ignore
    await db.insert(strategyBacktestHistory).values(data);
  }
}
