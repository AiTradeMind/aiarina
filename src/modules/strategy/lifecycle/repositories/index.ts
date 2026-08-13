import { getDb } from "../../../../db/client.ts";
import { 
  strategyLifecycles, strategyStates, strategyStateHistory,
  strategyTransitions, strategyActivationLogs, strategyRetirementLogs
} from "../../../../db/schema.ts";
import { eq, desc } from "drizzle-orm";
import { 
  StrategyLifecycle, StrategyState, StrategyStateHistory,
  StrategyTransition, StrategyActivationLog, StrategyRetirementLog
} from "../types/index.ts";

export class LifecycleRepository {
  async getLifecycles(): Promise<StrategyLifecycle[]> {
    const db = await getDb();
    return await db.select().from(strategyLifecycles).orderBy(desc(strategyLifecycles.updatedTime)) as StrategyLifecycle[];
  }

  async getLifecycleByStrategyId(strategyId: string): Promise<StrategyLifecycle | null> {
    const db = await getDb();
    const result = await db.select().from(strategyLifecycles).where(eq(strategyLifecycles.strategyId, strategyId));
    return result.length > 0 ? result[0] as StrategyLifecycle : null;
  }

  async getStates(): Promise<StrategyState[]> {
    const db = await getDb();
    return await db.select().from(strategyStates) as StrategyState[];
  }

  async getHistory(strategyId: string): Promise<StrategyStateHistory[]> {
    const db = await getDb();
    return await db.select().from(strategyStateHistory).where(eq(strategyStateHistory.strategyId, strategyId)).orderBy(desc(strategyStateHistory.timestamp)) as StrategyStateHistory[];
  }

  async getTransitions(): Promise<StrategyTransition[]> {
    const db = await getDb();
    return await db.select().from(strategyTransitions) as StrategyTransition[];
  }

  async getActivationLogs(strategyId: string): Promise<StrategyActivationLog[]> {
    const db = await getDb();
    return await db.select().from(strategyActivationLogs).where(eq(strategyActivationLogs.strategyId, strategyId)).orderBy(desc(strategyActivationLogs.timestamp)) as StrategyActivationLog[];
  }

  async getRetirementLogs(strategyId: string): Promise<StrategyRetirementLog[]> {
    const db = await getDb();
    return await db.select().from(strategyRetirementLogs).where(eq(strategyRetirementLogs.strategyId, strategyId)).orderBy(desc(strategyRetirementLogs.timestamp)) as StrategyRetirementLog[];
  }

  async createLifecycle(data: StrategyLifecycle): Promise<void> {
    const db = await getDb();
    // @ts-ignore
    await db.insert(strategyLifecycles).values(data);
  }

  async updateLifecycle(id: string, data: Partial<StrategyLifecycle>): Promise<void> {
    const db = await getDb();
    // @ts-ignore
    await db.update(strategyLifecycles).set(data).where(eq(strategyLifecycles.id, id));
  }

  async createStateHistory(data: StrategyStateHistory): Promise<void> {
    const db = await getDb();
    // @ts-ignore
    await db.insert(strategyStateHistory).values(data);
  }

  async createActivationLog(data: StrategyActivationLog): Promise<void> {
    const db = await getDb();
    // @ts-ignore
    await db.insert(strategyActivationLogs).values(data);
  }

  async createRetirementLog(data: StrategyRetirementLog): Promise<void> {
    const db = await getDb();
    // @ts-ignore
    await db.insert(strategyRetirementLogs).values(data);
  }
  
  async createTransition(data: StrategyTransition): Promise<void> {
    const db = await getDb();
    // @ts-ignore
    await db.insert(strategyTransitions).values(data);
  }
}
