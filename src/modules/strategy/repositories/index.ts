import { eq, desc, and } from "drizzle-orm";
import { getDb } from "../../../db/client.ts";
import { isInvalidOrg } from "../../../lib/utils.ts";
import { 
  strategies, 
  strategyVersions, 
  strategyRules, 
  strategyExecutions, 
  strategyResults 
} from "../../../db/schema.ts";
import { 
  Strategy, 
  StrategyVersion, 
  StrategyRule, 
  StrategyExecution, 
  StrategyResult,
  StrategyType
} from "../types/index.ts";

export class StrategyRepository {
  async findAll(organizationId: string): Promise<Strategy[]> {
    if (isInvalidOrg(organizationId)) {
      return [];
    }
    const db = getDb();
    const result = await db.select().from(strategies).where(eq(strategies.organizationId, organizationId)).orderBy(desc(strategies.priority));
    return result.map(r => ({
      ...r,
      type: r.type as StrategyType,
      createdAt: r.createdAt.toISOString(),
      updatedAt: r.updatedAt.toISOString(),
    }));
  }

  async findById(id: number, organizationId: string): Promise<Strategy | null> {
    const db = getDb();
    const result = await db.select().from(strategies)
      .where(and(eq(strategies.id, id), eq(strategies.organizationId, organizationId)))
      .limit(1);
    if (!result[0]) return null;
    return {
      ...result[0],
      type: result[0].type as StrategyType,
      createdAt: result[0].createdAt.toISOString(),
      updatedAt: result[0].updatedAt.toISOString(),
    };
  }

  async create(data: any): Promise<Strategy> {
    if (isInvalidOrg(data.organizationId)) {
      throw new Error("Cannot create Strategy for invalid organization");
    }
    const db = getDb();
    const result = await db.insert(strategies).values(data).returning();
    return {
      ...result[0],
      type: result[0].type as StrategyType,
      createdAt: result[0].createdAt.toISOString(),
      updatedAt: result[0].updatedAt.toISOString(),
    };
  }

  async update(id: number, organizationId: string, data: any): Promise<void> {
    const db = getDb();
    await db.update(strategies)
      .set({ ...data, updatedAt: new Date() })
      .where(and(eq(strategies.id, id), eq(strategies.organizationId, organizationId)));
  }
}

export class StrategyRuleRepository {
  async findByStrategyId(strategyId: number): Promise<StrategyRule[]> {
    const db = getDb();
    const result = await db.select().from(strategyRules).where(eq(strategyRules.strategyId, strategyId)).orderBy(desc(strategyRules.priority));
    return result.map(r => ({
      ...r,
      action: r.action as any,
    }));
  }
}

export class StrategyExecutionRepository {
  async create(data: any): Promise<StrategyExecution> {
    const db = getDb();
    const result = await db.insert(strategyExecutions).values(data).returning();
    return {
      ...result[0],
      outputAction: result[0].outputAction as any,
      createdAt: result[0].createdAt.toISOString(),
    };
  }

  async findAll(organizationId: string): Promise<StrategyExecution[]> {
    if (isInvalidOrg(organizationId)) {
      return [];
    }
    const db = getDb();
    const result = await db.select().from(strategyExecutions)
      .where(eq(strategyExecutions.organizationId, organizationId))
      .orderBy(desc(strategyExecutions.createdAt));
    return result.map(r => ({
      ...r,
      outputAction: r.outputAction as any,
      createdAt: r.createdAt.toISOString(),
    }));
  }
}

export class StrategyResultRepository {
  async findAll(organizationId: string): Promise<StrategyResult[]> {
    if (isInvalidOrg(organizationId)) {
      return [];
    }
    const db = getDb();
    const result = await db.select().from(strategyResults)
      .innerJoin(strategyExecutions, eq(strategyResults.executionId, strategyExecutions.id))
      .where(eq(strategyExecutions.organizationId, organizationId))
      .orderBy(desc(strategyResults.timestamp));
    
    return result.map(r => ({
      ...r.strategy_results,
      timestamp: r.strategy_results.timestamp.toISOString(),
    }));
  }
}
