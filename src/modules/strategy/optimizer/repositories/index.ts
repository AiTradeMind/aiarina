import { getDb } from "../../../../db/client.ts";
import { 
  strategyOptimizations, strategyOptimizationRuns, strategyOptimizationRules,
  strategyRecommendations, strategyParameterAnalysis, strategyOptimizationHistory
} from "../../../../db/schema.ts";
import { eq, desc } from "drizzle-orm";
import { 
  StrategyOptimization, StrategyOptimizationRun, StrategyOptimizationRule,
  StrategyRecommendation, StrategyParameterAnalysis, StrategyOptimizationHistory
} from "../types/index.ts";

export class OptimizerRepository {
  async getOptimizations(strategyId: string): Promise<StrategyOptimization[]> {
    const db = await getDb();
    return await db.select().from(strategyOptimizations).where(eq(strategyOptimizations.strategyId, strategyId)).orderBy(desc(strategyOptimizations.createdTime)) as StrategyOptimization[];
  }

  async getOptimizationById(id: string): Promise<StrategyOptimization | null> {
    const db = await getDb();
    const result = await db.select().from(strategyOptimizations).where(eq(strategyOptimizations.id, id));
    return result.length > 0 ? result[0] as StrategyOptimization : null;
  }

  async getRuns(optimizationId: string): Promise<StrategyOptimizationRun[]> {
    const db = await getDb();
    return await db.select().from(strategyOptimizationRuns).where(eq(strategyOptimizationRuns.optimizationId, optimizationId)).orderBy(desc(strategyOptimizationRuns.startTime)) as StrategyOptimizationRun[];
  }

  async getRules(): Promise<StrategyOptimizationRule[]> {
    const db = await getDb();
    return await db.select().from(strategyOptimizationRules) as StrategyOptimizationRule[];
  }

  async getRecommendations(optimizationId: string): Promise<StrategyRecommendation[]> {
    const db = await getDb();
    return await db.select().from(strategyRecommendations).where(eq(strategyRecommendations.optimizationId, optimizationId)) as StrategyRecommendation[];
  }

  async getParameterAnalysis(optimizationId: string): Promise<StrategyParameterAnalysis[]> {
    const db = await getDb();
    return await db.select().from(strategyParameterAnalysis).where(eq(strategyParameterAnalysis.optimizationId, optimizationId)) as StrategyParameterAnalysis[];
  }

  async getHistory(strategyId: string): Promise<StrategyOptimizationHistory[]> {
    const db = await getDb();
    return await db.select().from(strategyOptimizationHistory).where(eq(strategyOptimizationHistory.strategyId, strategyId)).orderBy(desc(strategyOptimizationHistory.timestamp)) as StrategyOptimizationHistory[];
  }

  async createOptimization(data: StrategyOptimization): Promise<void> {
    const db = await getDb();
    // @ts-ignore
    await db.insert(strategyOptimizations).values(data);
  }

  async createRun(data: StrategyOptimizationRun): Promise<void> {
    const db = await getDb();
    // @ts-ignore
    await db.insert(strategyOptimizationRuns).values(data);
  }

  async createRule(data: StrategyOptimizationRule): Promise<void> {
    const db = await getDb();
    // @ts-ignore
    await db.insert(strategyOptimizationRules).values(data);
  }

  async createRecommendation(data: StrategyRecommendation): Promise<void> {
    const db = await getDb();
    // @ts-ignore
    await db.insert(strategyRecommendations).values(data);
  }

  async createParameterAnalysis(data: StrategyParameterAnalysis): Promise<void> {
    const db = await getDb();
    // @ts-ignore
    await db.insert(strategyParameterAnalysis).values(data);
  }

  async createHistory(data: StrategyOptimizationHistory): Promise<void> {
    const db = await getDb();
    // @ts-ignore
    await db.insert(strategyOptimizationHistory).values(data);
  }
}
