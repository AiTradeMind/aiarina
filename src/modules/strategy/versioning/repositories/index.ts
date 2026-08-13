import { getDb } from "../../../../db/client.ts";
import { 
  strategyVersions, strategyVersionHistory, strategyChangeLogs,
  strategyVersionTags, strategySnapshots, strategyRestorePoints
} from "../../../../db/schema.ts";
import { eq, desc, and } from "drizzle-orm";
import { 
  StrategyVersion, StrategyVersionHistory, StrategyChangeLog,
  StrategyVersionTag, StrategySnapshot, StrategyRestorePoint
} from "../types/index.ts";

export class VersioningRepository {
  async getVersions(strategyId: string): Promise<StrategyVersion[]> {
    const db = await getDb();
    return await db.select().from(strategyVersions).where(eq(strategyVersions.strategyId, strategyId)).orderBy(desc(strategyVersions.createdTime)) as StrategyVersion[];
  }

  async getVersionById(id: string): Promise<StrategyVersion | null> {
    const db = await getDb();
    const result = await db.select().from(strategyVersions).where(eq(strategyVersions.id, id));
    return result.length > 0 ? result[0] as StrategyVersion : null;
  }
  
  async getLatestVersion(strategyId: string): Promise<StrategyVersion | null> {
    const db = await getDb();
    const result = await db.select().from(strategyVersions).where(eq(strategyVersions.strategyId, strategyId)).orderBy(desc(strategyVersions.createdTime)).limit(1);
    return result.length > 0 ? result[0] as StrategyVersion : null;
  }

  async getHistory(strategyId: string): Promise<StrategyVersionHistory[]> {
    const db = await getDb();
    return await db.select().from(strategyVersionHistory).where(eq(strategyVersionHistory.strategyId, strategyId)).orderBy(desc(strategyVersionHistory.timestamp)) as StrategyVersionHistory[];
  }
  
  async getChangeLog(versionId: string): Promise<StrategyChangeLog | null> {
    const db = await getDb();
    const result = await db.select().from(strategyChangeLogs).where(eq(strategyChangeLogs.versionId, versionId));
    return result.length > 0 ? result[0] as StrategyChangeLog : null;
  }

  async getTags(versionId: string): Promise<StrategyVersionTag[]> {
    const db = await getDb();
    return await db.select().from(strategyVersionTags).where(eq(strategyVersionTags.versionId, versionId)) as StrategyVersionTag[];
  }

  async getSnapshot(versionId: string): Promise<StrategySnapshot | null> {
    const db = await getDb();
    const result = await db.select().from(strategySnapshots).where(eq(strategySnapshots.versionId, versionId));
    return result.length > 0 ? result[0] as StrategySnapshot : null;
  }
  
  async getRestorePoints(strategyId: string): Promise<StrategyRestorePoint[]> {
    const db = await getDb();
    return await db.select().from(strategyRestorePoints).where(eq(strategyRestorePoints.strategyId, strategyId)).orderBy(desc(strategyRestorePoints.restoredTime)) as StrategyRestorePoint[];
  }

  async createVersion(data: StrategyVersion): Promise<void> {
    const db = await getDb();
    // @ts-ignore
    await db.insert(strategyVersions).values(data);
  }

  async createHistory(data: StrategyVersionHistory): Promise<void> {
    const db = await getDb();
    // @ts-ignore
    await db.insert(strategyVersionHistory).values(data);
  }

  async createChangeLog(data: StrategyChangeLog): Promise<void> {
    const db = await getDb();
    // @ts-ignore
    await db.insert(strategyChangeLogs).values(data);
  }

  async createTag(data: StrategyVersionTag): Promise<void> {
    const db = await getDb();
    // @ts-ignore
    await db.insert(strategyVersionTags).values(data);
  }

  async createSnapshot(data: StrategySnapshot): Promise<void> {
    const db = await getDb();
    // @ts-ignore
    await db.insert(strategySnapshots).values(data);
  }

  async createRestorePoint(data: StrategyRestorePoint): Promise<void> {
    const db = await getDb();
    // @ts-ignore
    await db.insert(strategyRestorePoints).values(data);
  }
}
