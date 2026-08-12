import { eq, desc, ne, and } from "drizzle-orm";
import { getDb } from "../../../db/client.ts";
import { 
  constitutionVersions,
  constitutionRegistry,
  constitutionModules,
  constitutionMetadata,
  constitutionRules,
  constitutionSnapshots,
  constitutionAuditTrail,
  constitutionPolicies
} from "../../../db/schema.ts";
import { 
  ConstitutionVersion,
  ConstitutionRegistryEntry,
  ConstitutionModuleRegistration,
  ConstitutionMetadataEntry,
  ConstitutionRule,
  ConstitutionPolicy,
  ConstitutionSnapshot,
  ConstitutionAuditLog,
  RegisterModuleDTO,
  RegisterPolicyDTO,
  ConstitutionVersionStatus,
  ConstitutionModuleStatus
} from "../types/index.ts";
import { CONSTITUTION_ERRORS, AUDIT_EVENT_TYPES } from "../constants/index.ts";
import logger from "../../../lib/logger.ts";

export class ConstitutionRepository {
  /**
   * Get the single active Constitution version
   */
  async getActiveVersion(): Promise<ConstitutionVersion | null> {
    try {
      const db = getDb();
      const rows = await db
        .select()
        .from(constitutionVersions)
        .where(eq(constitutionVersions.status, "ACTIVE"))
        .orderBy(desc(constitutionVersions.createdAt))
        .limit(1);

      if (rows && rows.length > 0) {
        const row = rows[0];
        return {
          id: row.id,
          versionId: row.versionId,
          parentVersionId: row.parentVersionId,
          title: row.title,
          description: row.description,
          status: row.status as ConstitutionVersionStatus,
          hash: row.hash,
          isLocked: row.isLocked,
          metadata: (row.metadata as Record<string, any>) || {},
          createdBy: row.createdBy,
          createdAt: row.createdAt,
          updatedAt: row.updatedAt,
        };
      }
      return null;
    } catch (error: any) {
      logger.warn({ type: "CONSTITUTION_REPO_ERROR", error: error.message }, "Error fetching active constitution version from DB");
      return null;
    }
  }

  /**
   * Get version by versionId
   */
  async getVersionById(versionId: string): Promise<ConstitutionVersion | null> {
    try {
      const db = getDb();
      const rows = await db
        .select()
        .from(constitutionVersions)
        .where(eq(constitutionVersions.versionId, versionId))
        .limit(1);

      if (rows && rows.length > 0) {
        const row = rows[0];
        return {
          id: row.id,
          versionId: row.versionId,
          parentVersionId: row.parentVersionId,
          title: row.title,
          description: row.description,
          status: row.status as ConstitutionVersionStatus,
          hash: row.hash,
          isLocked: row.isLocked,
          metadata: (row.metadata as Record<string, any>) || {},
          createdBy: row.createdBy,
          createdAt: row.createdAt,
          updatedAt: row.updatedAt,
        };
      }
      return null;
    } catch (error: any) {
      logger.warn({ type: "CONSTITUTION_REPO_ERROR", error: error.message }, "Error fetching version by ID");
      return null;
    }
  }

  /**
   * Get all versions sorted by creation date
   */
  async getAllVersions(): Promise<ConstitutionVersion[]> {
    try {
      const db = getDb();
      const rows = await db
        .select()
        .from(constitutionVersions)
        .orderBy(desc(constitutionVersions.createdAt));

      return rows.map((row) => ({
        id: row.id,
        versionId: row.versionId,
        parentVersionId: row.parentVersionId,
        title: row.title,
        description: row.description,
        status: row.status as ConstitutionVersionStatus,
        hash: row.hash,
        isLocked: row.isLocked,
        metadata: (row.metadata as Record<string, any>) || {},
        createdBy: row.createdBy,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
      }));
    } catch (error: any) {
      logger.warn({ type: "CONSTITUTION_REPO_ERROR", error: error.message }, "Error fetching all versions");
      return [];
    }
  }

  /**
   * Upsert Constitution Version enforcing lock checks and single active constraint
   */
  async saveVersion(versionData: {
    versionId: string;
    parentVersionId?: string;
    title: string;
    description?: string;
    status?: ConstitutionVersionStatus;
    hash: string;
    isLocked?: boolean;
    metadata?: Record<string, any>;
    createdBy?: string;
  }): Promise<ConstitutionVersion> {
    const db = getDb();
    const existing = await this.getVersionById(versionData.versionId);

    if (existing && existing.isLocked) {
      logger.error({ type: "CONSTITUTION_REPO_ERROR", versionId: versionData.versionId }, CONSTITUTION_ERRORS.CONSTITUTION_LOCKED);
      throw new Error(CONSTITUTION_ERRORS.CONSTITUTION_LOCKED);
    }

    const targetStatus = versionData.status || "ACTIVE";

    // Enforce single ACTIVE constitution rule
    if (targetStatus === "ACTIVE") {
      await db
        .update(constitutionVersions)
        .set({ status: "ARCHIVED", updatedAt: new Date() })
        .where(and(eq(constitutionVersions.status, "ACTIVE"), ne(constitutionVersions.versionId, versionData.versionId)));
    }

    if (existing) {
      await db
        .update(constitutionVersions)
        .set({
          parentVersionId: versionData.parentVersionId || existing.parentVersionId,
          title: versionData.title,
          description: versionData.description || existing.description,
          status: targetStatus,
          hash: versionData.hash,
          isLocked: versionData.isLocked !== undefined ? versionData.isLocked : existing.isLocked,
          metadata: versionData.metadata || existing.metadata,
          updatedAt: new Date(),
        })
        .where(eq(constitutionVersions.versionId, versionData.versionId));
    } else {
      await db.insert(constitutionVersions).values({
        versionId: versionData.versionId,
        parentVersionId: versionData.parentVersionId || null,
        title: versionData.title,
        description: versionData.description || null,
        status: targetStatus,
        hash: versionData.hash,
        isLocked: versionData.isLocked || false,
        metadata: versionData.metadata || {},
        createdBy: versionData.createdBy || "SYSTEM",
      });
    }

    // Record Audit Log
    await this.recordAuditLog(
      existing ? AUDIT_EVENT_TYPES.ACTIVATION : AUDIT_EVENT_TYPES.CREATION,
      "VERSION",
      versionData.versionId,
      versionData.createdBy || "SYSTEM",
      { title: versionData.title, status: targetStatus, hash: versionData.hash }
    );

    const updated = await this.getVersionById(versionData.versionId);
    if (!updated) {
      throw new Error(`Failed to save constitution version ${versionData.versionId}`);
    }
    return updated;
  }

  /**
   * Immutable locking of a constitution version
   */
  async lockVersion(versionId: string, operator: string = "ADMIN"): Promise<ConstitutionVersion> {
    const db = getDb();
    const version = await this.getVersionById(versionId);
    if (!version) {
      throw new Error(CONSTITUTION_ERRORS.VERSION_NOT_FOUND);
    }

    await db
      .update(constitutionVersions)
      .set({
        isLocked: true,
        status: "LOCKED",
        updatedAt: new Date(),
      })
      .where(eq(constitutionVersions.versionId, versionId));

    await this.recordAuditLog(AUDIT_EVENT_TYPES.LOCK, "VERSION", versionId, operator, {
      previousStatus: version.status,
      lockedAt: new Date().toISOString(),
    });

    const updated = await this.getVersionById(versionId);
    return updated!;
  }

  /**
   * Get all registry entries
   */
  async getRegistryEntries(): Promise<ConstitutionRegistryEntry[]> {
    try {
      const db = getDb();
      const rows = await db.select().from(constitutionRegistry).orderBy(constitutionRegistry.id);

      return rows.map((row) => ({
        id: row.id,
        registryId: row.registryId,
        versionId: row.versionId,
        name: row.name,
        category: row.category,
        status: row.status as ConstitutionVersionStatus,
        config: (row.config as Record<string, any>) || {},
        isLocked: row.isLocked,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
      }));
    } catch (error: any) {
      logger.warn({ type: "CONSTITUTION_REPO_ERROR", error: error.message }, "Error fetching registry entries");
      return [];
    }
  }

  /**
   * Save registry entry
   */
  async saveRegistryEntry(entry: {
    registryId: string;
    versionId: string;
    name: string;
    category?: string;
    status?: ConstitutionVersionStatus;
    config?: Record<string, any>;
    isLocked?: boolean;
  }): Promise<ConstitutionRegistryEntry> {
    const db = getDb();
    const rows = await db
      .select()
      .from(constitutionRegistry)
      .where(eq(constitutionRegistry.registryId, entry.registryId))
      .limit(1);

    if (rows && rows.length > 0) {
      await db
        .update(constitutionRegistry)
        .set({
          versionId: entry.versionId,
          name: entry.name,
          category: entry.category || rows[0].category,
          status: entry.status || (rows[0].status as ConstitutionVersionStatus),
          config: entry.config || (rows[0].config as Record<string, any>),
          isLocked: entry.isLocked !== undefined ? entry.isLocked : rows[0].isLocked,
          updatedAt: new Date(),
        })
        .where(eq(constitutionRegistry.registryId, entry.registryId));
    } else {
      await db.insert(constitutionRegistry).values({
        registryId: entry.registryId,
        versionId: entry.versionId,
        name: entry.name,
        category: entry.category || "GOVERNANCE",
        status: entry.status || "ACTIVE",
        config: entry.config || {},
        isLocked: entry.isLocked !== undefined ? entry.isLocked : true,
      });
    }

    const updatedRows = await db
      .select()
      .from(constitutionRegistry)
      .where(eq(constitutionRegistry.registryId, entry.registryId))
      .limit(1);

    const row = updatedRows[0];
    return {
      id: row.id,
      registryId: row.registryId,
      versionId: row.versionId,
      name: row.name,
      category: row.category,
      status: row.status as ConstitutionVersionStatus,
      config: (row.config as Record<string, any>) || {},
      isLocked: row.isLocked,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }

  /**
   * Get registered modules
   */
  async getRegisteredModules(): Promise<ConstitutionModuleRegistration[]> {
    try {
      const db = getDb();
      const rows = await db.select().from(constitutionModules).orderBy(constitutionModules.id);

      return rows.map((row) => ({
        id: row.id,
        moduleId: row.moduleId,
        moduleName: row.moduleName,
        version: row.version,
        status: row.status as ConstitutionModuleStatus,
        capabilities: (row.capabilities as string[]) || [],
        dependencies: (row.dependencies as string[]) || [],
        signature: row.signature,
        registeredBy: row.registeredBy,
        registeredAt: row.registeredAt,
        lastHeartbeat: row.lastHeartbeat,
      }));
    } catch (error: any) {
      logger.warn({ type: "CONSTITUTION_REPO_ERROR", error: error.message }, "Error fetching registered modules");
      return [];
    }
  }

  /**
   * Get registered module by ID
   */
  async getModuleById(moduleId: string): Promise<ConstitutionModuleRegistration | null> {
    try {
      const db = getDb();
      const rows = await db
        .select()
        .from(constitutionModules)
        .where(eq(constitutionModules.moduleId, moduleId))
        .limit(1);

      if (rows && rows.length > 0) {
        const row = rows[0];
        return {
          id: row.id,
          moduleId: row.moduleId,
          moduleName: row.moduleName,
          version: row.version,
          status: row.status as ConstitutionModuleStatus,
          capabilities: (row.capabilities as string[]) || [],
          dependencies: (row.dependencies as string[]) || [],
          signature: row.signature,
          registeredBy: row.registeredBy,
          registeredAt: row.registeredAt,
          lastHeartbeat: row.lastHeartbeat,
        };
      }
      return null;
    } catch (error: any) {
      logger.warn({ type: "CONSTITUTION_REPO_ERROR", error: error.message }, "Error fetching module by ID");
      return null;
    }
  }

  /**
   * Register or update a module with signature & dependencies
   */
  async registerModule(dto: RegisterModuleDTO): Promise<ConstitutionModuleRegistration> {
    const db = getDb();
    const existing = await this.getModuleById(dto.moduleId);

    if (existing) {
      await db
        .update(constitutionModules)
        .set({
          moduleName: dto.moduleName,
          version: dto.version,
          status: "ACTIVE",
          capabilities: dto.capabilities || existing.capabilities,
          dependencies: dto.dependencies || existing.dependencies,
          signature: dto.signature || existing.signature,
          registeredBy: dto.registeredBy || existing.registeredBy,
          lastHeartbeat: new Date(),
        })
        .where(eq(constitutionModules.moduleId, dto.moduleId));
    } else {
      await db.insert(constitutionModules).values({
        moduleId: dto.moduleId,
        moduleName: dto.moduleName,
        version: dto.version,
        status: "REGISTERED",
        capabilities: dto.capabilities || [],
        dependencies: dto.dependencies || [],
        signature: dto.signature || null,
        registeredBy: dto.registeredBy || "ADMIN",
        lastHeartbeat: new Date(),
      });
    }

    await this.recordAuditLog(
      AUDIT_EVENT_TYPES.REGISTRATION,
      "MODULE",
      dto.moduleId,
      dto.registeredBy || "ADMIN",
      { moduleName: dto.moduleName, version: dto.version, signature: dto.signature }
    );

    const registered = await this.getModuleById(dto.moduleId);
    if (!registered) {
      throw new Error(`Failed to register module ${dto.moduleId}`);
    }
    return registered;
  }

  /**
   * Get all rules
   */
  async getRules(): Promise<ConstitutionRule[]> {
    try {
      const db = getDb();
      const rows = await db.select().from(constitutionRules).orderBy(constitutionRules.priority);

      return rows.map((row) => ({
        id: row.id,
        ruleId: row.ruleId,
        versionId: row.versionId,
        name: row.name,
        category: row.category,
        priority: row.priority,
        status: row.status,
        config: (row.config as Record<string, any>) || {},
        metadata: (row.metadata as Record<string, any>) || {},
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
      }));
    } catch (error: any) {
      logger.warn({ type: "CONSTITUTION_REPO_ERROR", error: error.message }, "Error fetching rules");
      return [];
    }
  }

  /**
   * Save a rule in rule registry foundation
   */
  async saveRule(ruleData: {
    ruleId: string;
    versionId: string;
    name: string;
    category: string;
    priority?: number;
    status?: string;
    config?: Record<string, any>;
    metadata?: Record<string, any>;
  }): Promise<ConstitutionRule> {
    const db = getDb();
    const rows = await db
      .select()
      .from(constitutionRules)
      .where(eq(constitutionRules.ruleId, ruleData.ruleId))
      .limit(1);

    if (rows && rows.length > 0) {
      await db
        .update(constitutionRules)
        .set({
          versionId: ruleData.versionId,
          name: ruleData.name,
          category: ruleData.category,
          priority: ruleData.priority !== undefined ? ruleData.priority : rows[0].priority,
          status: ruleData.status || rows[0].status,
          config: ruleData.config || (rows[0].config as Record<string, any>),
          metadata: ruleData.metadata || (rows[0].metadata as Record<string, any>),
          updatedAt: new Date(),
        })
        .where(eq(constitutionRules.ruleId, ruleData.ruleId));
    } else {
      await db.insert(constitutionRules).values({
        ruleId: ruleData.ruleId,
        versionId: ruleData.versionId,
        name: ruleData.name,
        category: ruleData.category,
        priority: ruleData.priority !== undefined ? ruleData.priority : 1,
        status: ruleData.status || "ACTIVE",
        config: ruleData.config || {},
        metadata: ruleData.metadata || {},
      });
    }

    const updatedRows = await db
      .select()
      .from(constitutionRules)
      .where(eq(constitutionRules.ruleId, ruleData.ruleId))
      .limit(1);

    const row = updatedRows[0];
    return {
      id: row.id,
      ruleId: row.ruleId,
      versionId: row.versionId,
      name: row.name,
      category: row.category,
      priority: row.priority,
      status: row.status,
      config: (row.config as Record<string, any>) || {},
      metadata: (row.metadata as Record<string, any>) || {},
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }

  /**
   * Get all governance policies
   */
  async getPolicies(): Promise<ConstitutionPolicy[]> {
    try {
      const db = getDb();
      const rows = await db.select().from(constitutionPolicies).orderBy(constitutionPolicies.priority);

      return rows.map((row) => ({
        id: row.id,
        policyId: row.policyId,
        policyName: row.policyName,
        versionId: row.versionId,
        category: row.category,
        priority: row.priority,
        version: row.version,
        status: row.status,
        config: (row.config as Record<string, any>) || {},
        metadata: (row.metadata as Record<string, any>) || {},
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
      }));
    } catch (error: any) {
      logger.warn({ type: "CONSTITUTION_REPO_ERROR", error: error.message }, "Error fetching policies");
      return [];
    }
  }

  /**
   * Save or update a policy in Policy Registry
   */
  async savePolicy(dto: RegisterPolicyDTO): Promise<ConstitutionPolicy> {
    const db = getDb();
    const rows = await db
      .select()
      .from(constitutionPolicies)
      .where(eq(constitutionPolicies.policyId, dto.policyId))
      .limit(1);

    if (rows && rows.length > 0) {
      await db
        .update(constitutionPolicies)
        .set({
          policyName: dto.policyName,
          versionId: dto.versionId,
          category: dto.category,
          priority: dto.priority !== undefined ? dto.priority : rows[0].priority,
          version: dto.version || rows[0].version,
          status: dto.status || rows[0].status,
          config: dto.config || (rows[0].config as Record<string, any>),
          metadata: dto.metadata || (rows[0].metadata as Record<string, any>),
          updatedAt: new Date(),
        })
        .where(eq(constitutionPolicies.policyId, dto.policyId));
    } else {
      await db.insert(constitutionPolicies).values({
        policyId: dto.policyId,
        policyName: dto.policyName,
        versionId: dto.versionId,
        category: dto.category,
        priority: dto.priority !== undefined ? dto.priority : 1,
        version: dto.version || "1.0.0",
        status: dto.status || "ACTIVE",
        config: dto.config || {},
        metadata: dto.metadata || {},
      });
    }

    await this.recordAuditLog(
      AUDIT_EVENT_TYPES.POLICY_REGISTRATION,
      "POLICY",
      dto.policyId,
      "SYSTEM",
      { policyName: dto.policyName, category: dto.category }
    );

    const updatedRows = await db
      .select()
      .from(constitutionPolicies)
      .where(eq(constitutionPolicies.policyId, dto.policyId))
      .limit(1);

    const row = updatedRows[0];
    return {
      id: row.id,
      policyId: row.policyId,
      policyName: row.policyName,
      versionId: row.versionId,
      category: row.category,
      priority: row.priority,
      version: row.version,
      status: row.status,
      config: (row.config as Record<string, any>) || {},
      metadata: (row.metadata as Record<string, any>) || {},
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }

  /**
   * Get all metadata
   */
  async getMetadata(): Promise<ConstitutionMetadataEntry[]> {
    try {
      const db = getDb();
      const rows = await db.select().from(constitutionMetadata).orderBy(constitutionMetadata.key);

      return rows.map((row) => ({
        id: row.id,
        key: row.key,
        value: row.value,
        description: row.description,
        isReadOnly: row.isReadOnly,
        updatedBy: row.updatedBy,
        updatedAt: row.updatedAt,
      }));
    } catch (error: any) {
      logger.warn({ type: "CONSTITUTION_REPO_ERROR", error: error.message }, "Error fetching metadata");
      return [];
    }
  }

  /**
   * Upsert metadata
   */
  async saveMetadata(
    key: string,
    value: any,
    description?: string,
    isReadOnly: boolean = true,
    updatedBy: string = "SYSTEM"
  ): Promise<ConstitutionMetadataEntry> {
    const db = getDb();
    const rows = await db
      .select()
      .from(constitutionMetadata)
      .where(eq(constitutionMetadata.key, key))
      .limit(1);

    if (rows && rows.length > 0) {
      await db
        .update(constitutionMetadata)
        .set({
          value,
          description: description || rows[0].description,
          isReadOnly,
          updatedBy,
          updatedAt: new Date(),
        })
        .where(eq(constitutionMetadata.key, key));
    } else {
      await db.insert(constitutionMetadata).values({
        key,
        value,
        description: description || null,
        isReadOnly,
        updatedBy,
      });
    }

    const updatedRows = await db
      .select()
      .from(constitutionMetadata)
      .where(eq(constitutionMetadata.key, key))
      .limit(1);

    const row = updatedRows[0];
    return {
      id: row.id,
      key: row.key,
      value: row.value,
      description: row.description,
      isReadOnly: row.isReadOnly,
      updatedBy: row.updatedBy,
      updatedAt: row.updatedAt,
    };
  }

  /**
   * Save Immutable Snapshot
   */
  async createSnapshot(snapshot: {
    snapshotId: string;
    versionId: string;
    hash: string;
    snapshotData: Record<string, any>;
    createdBy?: string;
  }): Promise<ConstitutionSnapshot> {
    const db = getDb();
    await db.insert(constitutionSnapshots).values({
      snapshotId: snapshot.snapshotId,
      versionId: snapshot.versionId,
      hash: snapshot.hash,
      snapshotData: snapshot.snapshotData,
      isReadOnly: true,
      createdBy: snapshot.createdBy || "SYSTEM",
    });

    await this.recordAuditLog(
      AUDIT_EVENT_TYPES.SNAPSHOT_CREATED,
      "SNAPSHOT",
      snapshot.snapshotId,
      snapshot.createdBy || "SYSTEM",
      { versionId: snapshot.versionId, hash: snapshot.hash }
    );

    const rows = await db
      .select()
      .from(constitutionSnapshots)
      .where(eq(constitutionSnapshots.snapshotId, snapshot.snapshotId))
      .limit(1);

    const row = rows[0];
    return {
      id: row.id,
      snapshotId: row.snapshotId,
      versionId: row.versionId,
      hash: row.hash,
      snapshotData: (row.snapshotData as Record<string, any>) || {},
      isReadOnly: row.isReadOnly,
      createdBy: row.createdBy,
      createdAt: row.createdAt,
    };
  }

  /**
   * Get latest snapshot
   */
  async getLatestSnapshot(): Promise<ConstitutionSnapshot | null> {
    try {
      const db = getDb();
      const rows = await db
        .select()
        .from(constitutionSnapshots)
        .orderBy(desc(constitutionSnapshots.createdAt))
        .limit(1);

      if (rows && rows.length > 0) {
        const row = rows[0];
        return {
          id: row.id,
          snapshotId: row.snapshotId,
          versionId: row.versionId,
          hash: row.hash,
          snapshotData: (row.snapshotData as Record<string, any>) || {},
          isReadOnly: row.isReadOnly,
          createdBy: row.createdBy,
          createdAt: row.createdAt,
        };
      }
      return null;
    } catch (error: any) {
      logger.warn({ type: "CONSTITUTION_REPO_ERROR", error: error.message }, "Error fetching latest snapshot");
      return null;
    }
  }

  /**
   * Record Audit Log
   */
  async recordAuditLog(
    eventType: string,
    targetType: string,
    targetId: string,
    operator: string = "SYSTEM",
    details: Record<string, any> = {}
  ): Promise<ConstitutionAuditLog> {
    const db = getDb();
    const auditId = `AUDIT-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

    await db.insert(constitutionAuditTrail).values({
      auditId,
      eventType,
      targetType,
      targetId,
      operator,
      details,
    });

    const rows = await db
      .select()
      .from(constitutionAuditTrail)
      .where(eq(constitutionAuditTrail.auditId, auditId))
      .limit(1);

    const row = rows[0];
    return {
      id: row.id,
      auditId: row.auditId,
      eventType: row.eventType,
      targetType: row.targetType,
      targetId: row.targetId,
      operator: row.operator,
      details: (row.details as Record<string, any>) || {},
      timestamp: row.timestamp,
    };
  }

  /**
   * Get recent Audit Trail logs
   */
  async getAuditLogs(limit: number = 20): Promise<ConstitutionAuditLog[]> {
    try {
      const db = getDb();
      const rows = await db
        .select()
        .from(constitutionAuditTrail)
        .orderBy(desc(constitutionAuditTrail.timestamp))
        .limit(limit);

      return rows.map((row) => ({
        id: row.id,
        auditId: row.auditId,
        eventType: row.eventType,
        targetType: row.targetType,
        targetId: row.targetId,
        operator: row.operator,
        details: (row.details as Record<string, any>) || {},
        timestamp: row.timestamp,
      }));
    } catch (error: any) {
      logger.warn({ type: "CONSTITUTION_REPO_ERROR", error: error.message }, "Error fetching audit logs");
      return [];
    }
  }
}
