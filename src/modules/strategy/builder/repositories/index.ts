import { getDb } from "../../../../db/client.ts";
import { 
  strategyBuilders, strategyBlocks, strategyConnections,
  strategyLayouts, strategyParameters, strategyValidation,
  strategyBuilderHistory
} from "../../../../db/schema.ts";
import { eq, desc, sql } from "drizzle-orm";
import { 
  StrategyBuilder, StrategyBlock, StrategyConnection,
  StrategyLayout, StrategyParameter, StrategyValidation,
  StrategyBuilderHistory
} from "../types/index.ts";

export class BuilderRepository {
  private tablesEnsured = false;

  private async ensureTablesExist(): Promise<void> {
    if (this.tablesEnsured) return;
    try {
      const db = getDb();
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS strategy_builders (
          id VARCHAR(100) PRIMARY KEY,
          strategy_id VARCHAR(100) NOT NULL,
          name VARCHAR(255) NOT NULL,
          category VARCHAR(100),
          tags JSONB DEFAULT '[]'::jsonb,
          description TEXT,
          risk_level VARCHAR(50) DEFAULT 'MEDIUM',
          market_type VARCHAR(50) DEFAULT 'EQUITY',
          instrument_type VARCHAR(50) DEFAULT 'SPOT',
          timeframe VARCHAR(50) DEFAULT '15M',
          status VARCHAR(50) DEFAULT 'DRAFT' NOT NULL,
          version VARCHAR(50) DEFAULT '1.0.0' NOT NULL,
          approval_status VARCHAR(50) DEFAULT 'PENDING' NOT NULL,
          sha256_reference VARCHAR(64),
          rules JSONB DEFAULT '[]'::jsonb,
          created_by VARCHAR(100) DEFAULT 'SYSTEM' NOT NULL,
          updated_by VARCHAR(100) DEFAULT 'SYSTEM' NOT NULL,
          created_time TIMESTAMP DEFAULT NOW() NOT NULL,
          updated_time TIMESTAMP DEFAULT NOW() NOT NULL
        );

        ALTER TABLE strategy_builders ADD COLUMN IF NOT EXISTS strategy_id VARCHAR(100);
        ALTER TABLE strategy_builders ADD COLUMN IF NOT EXISTS category VARCHAR(100);
        ALTER TABLE strategy_builders ADD COLUMN IF NOT EXISTS tags JSONB DEFAULT '[]'::jsonb;
        ALTER TABLE strategy_builders ADD COLUMN IF NOT EXISTS description TEXT;
        ALTER TABLE strategy_builders ADD COLUMN IF NOT EXISTS risk_level VARCHAR(50) DEFAULT 'MEDIUM';
        ALTER TABLE strategy_builders ADD COLUMN IF NOT EXISTS market_type VARCHAR(50) DEFAULT 'EQUITY';
        ALTER TABLE strategy_builders ADD COLUMN IF NOT EXISTS instrument_type VARCHAR(50) DEFAULT 'SPOT';
        ALTER TABLE strategy_builders ADD COLUMN IF NOT EXISTS timeframe VARCHAR(50) DEFAULT '15M';
        ALTER TABLE strategy_builders ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'DRAFT';
        ALTER TABLE strategy_builders ADD COLUMN IF NOT EXISTS version VARCHAR(50) DEFAULT '1.0.0';
        ALTER TABLE strategy_builders ADD COLUMN IF NOT EXISTS approval_status VARCHAR(50) DEFAULT 'PENDING';
        ALTER TABLE strategy_builders ADD COLUMN IF NOT EXISTS sha256_reference VARCHAR(64);
        ALTER TABLE strategy_builders ADD COLUMN IF NOT EXISTS rules JSONB DEFAULT '[]'::jsonb;
        ALTER TABLE strategy_builders ADD COLUMN IF NOT EXISTS created_by VARCHAR(100) DEFAULT 'SYSTEM';
        ALTER TABLE strategy_builders ADD COLUMN IF NOT EXISTS updated_by VARCHAR(100) DEFAULT 'SYSTEM';
        ALTER TABLE strategy_builders ADD COLUMN IF NOT EXISTS created_time TIMESTAMP DEFAULT NOW();
        ALTER TABLE strategy_builders ADD COLUMN IF NOT EXISTS updated_time TIMESTAMP DEFAULT NOW();

        CREATE TABLE IF NOT EXISTS strategy_builder_history (
          id VARCHAR(100) PRIMARY KEY,
          builder_id VARCHAR(100) NOT NULL,
          snapshot JSONB NOT NULL DEFAULT '{}'::jsonb,
          user_id VARCHAR(100) NOT NULL,
          reason VARCHAR(255) NOT NULL,
          created_time TIMESTAMP DEFAULT NOW() NOT NULL
        );
      `);
      this.tablesEnsured = true;
    } catch (e) {
      // ignore table creation errors if already present
    }
  }

  // --- Standardized Strategy Builder Repository Methods (STEP 3) ---

  async createStrategy(data: StrategyBuilder): Promise<StrategyBuilder> {
    await this.ensureTablesExist();
    const db = getDb();
    // @ts-ignore
    await db.insert(strategyBuilders).values(data);
    const result = await this.findStrategyById(data.id);
    return result || data;
  }

  async updateStrategy(id: string, data: Partial<StrategyBuilder>): Promise<StrategyBuilder | null> {
    await this.ensureTablesExist();
    const db = getDb();
    // @ts-ignore
    await db.update(strategyBuilders).set({ ...data, updatedTime: new Date() }).where(eq(strategyBuilders.id, id));
    return await this.findStrategyById(id);
  }

  async deleteStrategy(id: string): Promise<boolean> {
    await this.ensureTablesExist();
    const db = getDb();
    await this.clearBuilderData(id);
    await db.delete(strategyBuilders).where(eq(strategyBuilders.id, id));
    return true;
  }

  async findStrategyById(id: string): Promise<StrategyBuilder | null> {
    await this.ensureTablesExist();
    const db = getDb();
    const result = await db.select().from(strategyBuilders).where(eq(strategyBuilders.id, id));
    return result.length > 0 ? (result[0] as unknown as StrategyBuilder) : null;
  }

  async findStrategyByName(name: string): Promise<StrategyBuilder | null> {
    await this.ensureTablesExist();
    const db = getDb();
    const result = await db.select().from(strategyBuilders).where(sql`LOWER(${strategyBuilders.name}) = LOWER(${name})`);
    return result.length > 0 ? (result[0] as unknown as StrategyBuilder) : null;
  }

  async listStrategies(): Promise<StrategyBuilder[]> {
    await this.ensureTablesExist();
    const db = getDb();
    return await db.select().from(strategyBuilders).orderBy(desc(strategyBuilders.updatedTime)) as unknown as StrategyBuilder[];
  }

  async checkDuplicate(name: string, excludeId?: string): Promise<boolean> {
    await this.ensureTablesExist();
    const db = getDb();
    const result = await db.select().from(strategyBuilders).where(sql`LOWER(${strategyBuilders.name}) = LOWER(${name})`);
    if (result.length === 0) return false;
    if (excludeId && result.length === 1 && result[0].id === excludeId) return false;
    return true;
  }

  async saveRules(id: string, rules: string[]): Promise<boolean> {
    await this.ensureTablesExist();
    const db = getDb();
    // @ts-ignore
    await db.update(strategyBuilders).set({ rules, updatedTime: new Date() }).where(eq(strategyBuilders.id, id));
    return true;
  }

  async loadRules(id: string): Promise<string[]> {
    await this.ensureTablesExist();
    const strategy = await this.findStrategyById(id);
    return (strategy?.rules as string[]) || [];
  }

  // --- Aliases & Helpers ---

  async getBuilders(): Promise<StrategyBuilder[]> {
    return this.listStrategies();
  }

  async getBuilderById(id: string): Promise<StrategyBuilder | null> {
    return this.findStrategyById(id);
  }

  async getBuilderByStrategyId(strategyId: string): Promise<StrategyBuilder | null> {
    await this.ensureTablesExist();
    const db = getDb();
    const result = await db.select().from(strategyBuilders).where(eq(strategyBuilders.strategyId, strategyId));
    return result.length > 0 ? (result[0] as unknown as StrategyBuilder) : null;
  }

  async getBlocks(builderId: string): Promise<StrategyBlock[]> {
    const db = await getDb();
    return await db.select().from(strategyBlocks).where(eq(strategyBlocks.builderId, builderId)) as unknown as StrategyBlock[];
  }

  async getConnections(builderId: string): Promise<StrategyConnection[]> {
    const db = await getDb();
    return await db.select().from(strategyConnections).where(eq(strategyConnections.builderId, builderId)) as unknown as StrategyConnection[];
  }

  async getLayouts(builderId: string): Promise<StrategyLayout[]> {
    const db = await getDb();
    return await db.select().from(strategyLayouts).where(eq(strategyLayouts.builderId, builderId)) as unknown as StrategyLayout[];
  }

  async getParametersByBlockId(blockId: string): Promise<StrategyParameter[]> {
    const db = await getDb();
    return await db.select().from(strategyParameters).where(eq(strategyParameters.blockId, blockId)) as unknown as StrategyParameter[];
  }

  async getValidation(builderId: string): Promise<StrategyValidation | null> {
    const db = await getDb();
    const result = await db.select().from(strategyValidation).where(eq(strategyValidation.builderId, builderId)).orderBy(desc(strategyValidation.validatedTime)).limit(1);
    return result.length > 0 ? (result[0] as unknown as StrategyValidation) : null;
  }

  async getHistory(builderId: string): Promise<StrategyBuilderHistory[]> {
    const db = await getDb();
    return await db.select().from(strategyBuilderHistory).where(eq(strategyBuilderHistory.builderId, builderId)).orderBy(desc(strategyBuilderHistory.createdTime)) as unknown as StrategyBuilderHistory[];
  }

  async createBuilder(data: StrategyBuilder): Promise<void> {
    await this.createStrategy(data);
  }

  async updateBuilder(id: string, data: Partial<StrategyBuilder>): Promise<void> {
    await this.updateStrategy(id, data);
  }

  async deleteBuilder(id: string): Promise<void> {
    await this.deleteStrategy(id);
  }

  async clearBuilderData(builderId: string): Promise<void> {
    const db = await getDb();
    await db.delete(strategyConnections).where(eq(strategyConnections.builderId, builderId));
    await db.delete(strategyLayouts).where(eq(strategyLayouts.builderId, builderId));
    
    const blocks = await this.getBlocks(builderId);
    for (const b of blocks) {
      await db.delete(strategyParameters).where(eq(strategyParameters.blockId, b.id));
    }
    
    await db.delete(strategyBlocks).where(eq(strategyBlocks.builderId, builderId));
  }

  async createBlock(data: StrategyBlock): Promise<void> {
    const db = await getDb();
    // @ts-ignore
    await db.insert(strategyBlocks).values(data);
  }

  async createConnection(data: StrategyConnection): Promise<void> {
    const db = await getDb();
    // @ts-ignore
    await db.insert(strategyConnections).values(data);
  }

  async createLayout(data: StrategyLayout): Promise<void> {
    const db = await getDb();
    // @ts-ignore
    await db.insert(strategyLayouts).values(data);
  }

  async createParameter(data: StrategyParameter): Promise<void> {
    const db = await getDb();
    // @ts-ignore
    await db.insert(strategyParameters).values(data);
  }

  async createValidation(data: StrategyValidation): Promise<void> {
    const db = await getDb();
    // @ts-ignore
    await db.insert(strategyValidation).values(data);
  }

  async createHistory(data: StrategyBuilderHistory): Promise<void> {
    const db = await getDb();
    // @ts-ignore
    await db.insert(strategyBuilderHistory).values(data);
  }
}
