import { getDb } from "../../../../db/client.ts";
import { 
  strategyRegistry, strategyCategories, strategyTags,
  strategyDependencies, strategyMetadata, strategyCapabilities,
  strategyTemplates
} from "../../../../db/schema.ts";
import { eq, desc } from "drizzle-orm";
import { 
  StrategyRegistry, StrategyCategory, StrategyTag,
  StrategyDependency, StrategyMetadata, StrategyCapabilities,
  StrategyTemplate
} from "../types/index.ts";

export class RegistryRepository {
  async getStrategies(): Promise<StrategyRegistry[]> {
    const db = await getDb();
    return await db.select().from(strategyRegistry).orderBy(desc(strategyRegistry.createdTime)) as StrategyRegistry[];
  }

  async getStrategyById(id: string): Promise<StrategyRegistry | null> {
    const db = await getDb();
    const result = await db.select().from(strategyRegistry).where(eq(strategyRegistry.id, id));
    return result.length > 0 ? result[0] as StrategyRegistry : null;
  }

  async getCategories(): Promise<StrategyCategory[]> {
    const db = await getDb();
    return await db.select().from(strategyCategories).orderBy(desc(strategyCategories.createdTime)) as StrategyCategory[];
  }

  async getTemplates(): Promise<StrategyTemplate[]> {
    const db = await getDb();
    return await db.select().from(strategyTemplates).orderBy(desc(strategyTemplates.createdTime)) as StrategyTemplate[];
  }

  async getTags(strategyId: string): Promise<StrategyTag[]> {
    const db = await getDb();
    return await db.select().from(strategyTags).where(eq(strategyTags.strategyId, strategyId)) as StrategyTag[];
  }

  async getDependencies(strategyId: string): Promise<StrategyDependency[]> {
    const db = await getDb();
    return await db.select().from(strategyDependencies).where(eq(strategyDependencies.strategyId, strategyId)) as StrategyDependency[];
  }

  async getMetadata(strategyId: string): Promise<StrategyMetadata[]> {
    const db = await getDb();
    return await db.select().from(strategyMetadata).where(eq(strategyMetadata.strategyId, strategyId)) as StrategyMetadata[];
  }

  async getCapabilities(strategyId: string): Promise<StrategyCapabilities | null> {
    const db = await getDb();
    const res = await db.select().from(strategyCapabilities).where(eq(strategyCapabilities.strategyId, strategyId));
    return res.length > 0 ? res[0] as StrategyCapabilities : null;
  }

  async createStrategy(data: StrategyRegistry): Promise<void> {
    const db = await getDb();
    // @ts-ignore
    await db.insert(strategyRegistry).values(data);
  }

  async updateStrategy(id: string, data: Partial<StrategyRegistry>): Promise<void> {
    const db = await getDb();
    // @ts-ignore
    await db.update(strategyRegistry).set(data).where(eq(strategyRegistry.id, id));
  }

  async deleteStrategy(id: string): Promise<void> {
    const db = await getDb();
    await db.delete(strategyRegistry).where(eq(strategyRegistry.id, id));
  }

  async createCategory(data: StrategyCategory): Promise<void> {
    const db = await getDb();
    // @ts-ignore
    await db.insert(strategyCategories).values(data);
  }

  async createTemplate(data: StrategyTemplate): Promise<void> {
    const db = await getDb();
    // @ts-ignore
    await db.insert(strategyTemplates).values(data);
  }

  async createCapabilities(data: StrategyCapabilities): Promise<void> {
    const db = await getDb();
    // @ts-ignore
    await db.insert(strategyCapabilities).values(data);
  }
}
