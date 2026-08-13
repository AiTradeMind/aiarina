import { getDb } from "../../../db/client.ts";
import { metadataRegistry, entityVersions, systemConfiguration } from "../../../db/schema.ts";
import { eq, desc, and } from "drizzle-orm";

export class MetadataRepository {
  async setMetadata(data: {
    metadataId?: string;
    entityType: string;
    entityId: string;
    key: string;
    value: any;
    version?: number;
    lifecycleState?: string;
  }) {
    const db = getDb();
    const metadataId = data.metadataId || `META_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

    const existing = await db.select().from(metadataRegistry)
      .where(and(
        eq(metadataRegistry.entityType, data.entityType),
        eq(metadataRegistry.entityId, data.entityId),
        eq(metadataRegistry.key, data.key)
      ))
      .limit(1);

    if (existing.length > 0) {
      const currentVer = existing[0].version + 1;
      const updated = await db.update(metadataRegistry)
        .set({
          value: data.value,
          version: currentVer,
          lifecycleState: data.lifecycleState || existing[0].lifecycleState,
          updatedAt: new Date(),
        })
        .where(eq(metadataRegistry.id, existing[0].id))
        .returning();
      return updated[0];
    } else {
      const inserted = await db.insert(metadataRegistry).values({
        metadataId,
        entityType: data.entityType,
        entityId: data.entityId,
        key: data.key,
        value: data.value,
        version: data.version || 1,
        lifecycleState: data.lifecycleState || "ACTIVE",
        isArchived: false,
      }).returning();
      return inserted[0];
    }
  }

  async getMetadata(entityType: string, entityId: string) {
    const db = getDb();
    return await db.select().from(metadataRegistry)
      .where(and(
        eq(metadataRegistry.entityType, entityType),
        eq(metadataRegistry.entityId, entityId),
        eq(metadataRegistry.isArchived, false)
      ));
  }

  async saveEntityVersion(data: {
    versionId?: string;
    entityType: string;
    entityId: string;
    versionNumber: number;
    snapshotData: any;
    createdVersion?: number;
    currentVersion?: number;
    previousVersion?: number;
    rollbackMetadata?: any;
  }) {
    const db = getDb();
    const versionId = data.versionId || `VER_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

    const inserted = await db.insert(entityVersions).values({
      versionId,
      entityType: data.entityType,
      entityId: data.entityId,
      versionNumber: data.versionNumber,
      snapshotData: data.snapshotData,
      createdVersion: data.createdVersion || 1,
      currentVersion: data.currentVersion || data.versionNumber,
      previousVersion: data.previousVersion || null,
      rollbackMetadata: data.rollbackMetadata || {},
    }).returning();

    return inserted[0];
  }

  async getEntityVersions(entityType: string, entityId: string) {
    const db = getDb();
    return await db.select().from(entityVersions)
      .where(and(eq(entityVersions.entityType, entityType), eq(entityVersions.entityId, entityId)))
      .orderBy(desc(entityVersions.versionNumber));
  }

  async getSystemConfig(key: string) {
    const db = getDb();
    const res = await db.select().from(systemConfiguration).where(eq(systemConfiguration.key, key)).limit(1);
    return res[0] || null;
  }

  async setSystemConfig(key: string, category: "FINANCIAL" | "ACCOUNTING" | "FEATURE_FLAGS" | "RUNTIME", value: any, isLocked = false) {
    const db = getDb();
    const existing = await this.getSystemConfig(key);

    if (existing) {
      if (existing.isLocked) {
        throw new Error(`System configuration '${key}' is locked and cannot be modified.`);
      }
      const updated = await db.update(systemConfiguration)
        .set({
          category,
          value,
          isLocked,
          updatedAt: new Date(),
        })
        .where(eq(systemConfiguration.key, key))
        .returning();
      return updated[0];
    } else {
      const inserted = await db.insert(systemConfiguration).values({
        key,
        category,
        value,
        isLocked,
      }).returning();
      return inserted[0];
    }
  }

  async getAllSystemConfig() {
    const db = getDb();
    return await db.select().from(systemConfiguration);
  }
}
