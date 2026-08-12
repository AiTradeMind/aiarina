import { eq, and, sql, desc, inArray } from "drizzle-orm";
import { getDb } from "../../../db/client.ts";
import { 
  rbacRoles, 
  rbacPermissions, 
  rbacRolePermissions, 
  rbacUserRoles, 
  rbacPolicies, 
  rbacPermissionLogs, 
  rbacCache,
  users
} from "../../../db/schema.ts";
import { 
  RBACRole, 
  RBACPermission, 
  RBACRolePermission, 
  RBACUserRole, 
  RBACPolicy, 
  RBACPermissionLog, 
  RBACCacheEntry 
} from "../types/index.ts";

export class PermissionRepository {
  private static rbacTablesChecked = false;

  public async ensureRbacTables(): Promise<void> {
    if (PermissionRepository.rbacTablesChecked) return;
    const db = getDb();
    try {
      // 1. Create Roles Table
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS rbac_roles (
          id VARCHAR(50) PRIMARY KEY,
          name VARCHAR(100) NOT NULL,
          description TEXT,
          is_custom BOOLEAN DEFAULT FALSE NOT NULL,
          parent_role_id VARCHAR(50),
          created_at TIMESTAMP DEFAULT now() NOT NULL,
          updated_at TIMESTAMP DEFAULT now() NOT NULL
        );
      `);

      // 2. Create Permissions Table
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS rbac_permissions (
          id VARCHAR(100) PRIMARY KEY,
          name VARCHAR(100) NOT NULL,
          description TEXT,
          created_at TIMESTAMP DEFAULT now() NOT NULL
        );
      `);

      // 3. Create Role-Permissions mapping
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS rbac_role_permissions (
          id SERIAL PRIMARY KEY,
          role_id VARCHAR(50) REFERENCES rbac_roles(id) ON DELETE CASCADE NOT NULL,
          permission_id VARCHAR(100) REFERENCES rbac_permissions(id) ON DELETE CASCADE NOT NULL,
          created_at TIMESTAMP DEFAULT now() NOT NULL
        );
      `);

      // 4. Create User Roles mapping
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS rbac_user_roles (
          id SERIAL PRIMARY KEY,
          user_id INTEGER REFERENCES users(id) ON DELETE CASCADE NOT NULL,
          role_id VARCHAR(50) REFERENCES rbac_roles(id) ON DELETE CASCADE NOT NULL,
          organization_id VARCHAR(50),
          workspace_id VARCHAR(50),
          created_at TIMESTAMP DEFAULT now() NOT NULL
        );
      `);

      // 5. Create Policies Table
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS rbac_policies (
          id VARCHAR(50) PRIMARY KEY,
          name VARCHAR(100) NOT NULL,
          effect VARCHAR(10) NOT NULL,
          actions JSONB DEFAULT '[]'::jsonb NOT NULL,
          resources JSONB DEFAULT '[]'::jsonb NOT NULL,
          conditions JSONB DEFAULT '{}'::jsonb NOT NULL,
          organization_id VARCHAR(50),
          workspace_id VARCHAR(50),
          created_at TIMESTAMP DEFAULT now() NOT NULL,
          updated_at TIMESTAMP DEFAULT now() NOT NULL
        );
      `);

      // 6. Create Permission Logs Table
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS rbac_permission_logs (
          id SERIAL PRIMARY KEY,
          user_id INTEGER NOT NULL,
          action VARCHAR(100) NOT NULL,
          resource VARCHAR(255) NOT NULL,
          organization_id VARCHAR(50),
          workspace_id VARCHAR(50),
          decision VARCHAR(20) NOT NULL,
          reason TEXT,
          latency_ms INTEGER DEFAULT 0 NOT NULL,
          created_at TIMESTAMP DEFAULT now() NOT NULL
        );
      `);

      // 7. Create Cache Table
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS rbac_cache (
          user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
          permissions JSONB DEFAULT '[]'::jsonb NOT NULL,
          expires_at TIMESTAMP NOT NULL
        );
      `);

      // Seed built-in data
      await this.seedBuiltInRolesAndPermissions();

      PermissionRepository.rbacTablesChecked = true;
    } catch (err) {
      console.error("Error creating missing RBAC tables dynamically:", err);
    }
  }

  private async seedBuiltInRolesAndPermissions(): Promise<void> {
    const db = getDb();

    // 1. Core Built-In Roles
    const rolesToSeed = [
      { id: "SYSTEM_OWNER", name: "System Owner", description: "Root level owner of the entire instance", isCustom: false },
      { id: "PLATFORM_ADMIN", name: "Platform Administrator", description: "Admin with platform wide control", isCustom: false },
      { id: "ORG_OWNER", name: "Organization Owner", description: "Owner of the organization and associated assets", isCustom: false },
      { id: "ORG_ADMIN", name: "Organization Administrator", description: "Administrator of organizational scopes", isCustom: false, parentRoleId: "ORG_OWNER" },
      { id: "WORKSPACE_ADMIN", name: "Workspace Administrator", description: "Full privileges over specific workspaces", isCustom: false },
      { id: "AI_MANAGER", name: "AI Gateway Manager", description: "Privileged operations over AI Models & Gateways", isCustom: false },
      { id: "RESEARCH_MANAGER", name: "Research Operations Manager", description: "Run and manage research & deep analysis", isCustom: false },
      { id: "ANALYST", name: "Financial & Tech Analyst", description: "Create strategies & analyze data indices", isCustom: false },
      { id: "AUDITOR", name: "Compliance & Security Auditor", description: "Read-only access to all audit logs & policies", isCustom: false },
      { id: "MEMBER", name: "Standard Workspace Member", description: "General system member within workspaces", isCustom: false },
      { id: "READ_ONLY", name: "Read-Only Viewer", description: "Strictly view-only permission spectrum", isCustom: false }
    ];

    for (const r of rolesToSeed) {
      await db.insert(rbacRoles).values({
        id: r.id,
        name: r.name,
        description: r.description,
        isCustom: r.isCustom,
        parentRoleId: (r as any).parentRoleId || null
      }).onConflictDoNothing();
    }

    // 2. Core Built-In Permissions
    const permissionsToSeed = [
      { id: "organization.create", name: "Create Organization", description: "Allows creating new organizations" },
      { id: "organization.update", name: "Update Organization", description: "Allows updating organization parameters" },
      { id: "workspace.read", name: "Read Workspace", description: "Allows reading workspaces" },
      { id: "workspace.update", name: "Update Workspace", description: "Allows updating workspaces" },
      { id: "research.run", name: "Run Research", description: "Allows executing research agents" },
      { id: "research.read", name: "Read Research", description: "Allows reading research records" },
      { id: "research.export", name: "Export Research", description: "Allows exporting research data" },
      { id: "ai.manage", name: "Manage AI", description: "Allows managing AI endpoints" },
      { id: "strategy.manage", name: "Manage Strategy", description: "Allows creating/updating strategies" },
      { id: "report.export", name: "Export Reports", description: "Allows exporting financial reports" },
      { id: "governance.review", name: "Review Governance", description: "Allows reviewing compliance and governance rules" },
      { id: "audit.read", name: "Read Audit Logs", description: "Allows viewing security audit logs" },
      { id: "user.invite", name: "Invite User", description: "Allows inviting users to workspace/org" },
      { id: "member.remove", name: "Remove Member", description: "Allows removing workspace/org members" },
      { id: "role.assign", name: "Assign Roles", description: "Allows assigning RBAC roles to users" },
      { id: "permission.manage", name: "Manage Permissions", description: "Allows managing role permissions" }
    ];

    for (const p of permissionsToSeed) {
      await db.insert(rbacPermissions).values(p).onConflictDoNothing();
    }

    // 3. Mapping Core Roles to Permissions
    const mapping: Record<string, string[]> = {
      SYSTEM_OWNER: permissionsToSeed.map(p => p.id),
      PLATFORM_ADMIN: permissionsToSeed.map(p => p.id),
      ORG_OWNER: [
        "organization.update", "workspace.read", "workspace.update", "research.run", "research.read",
        "research.export", "ai.manage", "strategy.manage", "report.export", "governance.review",
        "audit.read", "user.invite", "member.remove", "role.assign"
      ],
      ORG_ADMIN: [
        "workspace.read", "workspace.update", "research.run", "research.read", "research.export",
        "ai.manage", "strategy.manage", "report.export", "audit.read", "user.invite"
      ],
      WORKSPACE_ADMIN: [
        "workspace.read", "workspace.update", "research.read"
      ],
      AI_MANAGER: [
        "ai.manage", "workspace.read"
      ],
      RESEARCH_MANAGER: [
        "research.run", "research.read", "research.export", "workspace.read"
      ],
      ANALYST: [
        "research.read", "workspace.read"
      ],
      AUDITOR: [
        "audit.read", "workspace.read"
      ],
      MEMBER: [
        "workspace.read"
      ],
      READ_ONLY: [
        "workspace.read"
      ]
    };

    for (const [roleId, permIds] of Object.entries(mapping)) {
      for (const pId of permIds) {
        await db.insert(rbacRolePermissions).values({
          roleId,
          permissionId: pId
        }).onConflictDoNothing();
      }
    }
  }

  constructor() {
    this.ensureRbacTables().catch(() => {});
  }

  // --- Roles ---
  async createRole(role: Partial<RBACRole>): Promise<RBACRole> {
    await this.ensureRbacTables();
    const db = getDb();
    const payload = {
      id: role.id!,
      name: role.name!,
      description: role.description || null,
      isCustom: role.isCustom !== undefined ? role.isCustom : true,
      parentRoleId: role.parentRoleId || null,
    };
    const res = await db.insert(rbacRoles).values(payload).returning();
    return res[0] as RBACRole;
  }

  async getRole(id: string): Promise<RBACRole | null> {
    await this.ensureRbacTables();
    const db = getDb();
    const res = await db.select().from(rbacRoles).where(eq(rbacRoles.id, id)).limit(1);
    return res[0] as RBACRole || null;
  }

  async listRoles(): Promise<RBACRole[]> {
    await this.ensureRbacTables();
    const db = getDb();
    const res = await db.select().from(rbacRoles);
    return res as RBACRole[];
  }

  async updateRole(id: string, updates: Partial<RBACRole>): Promise<RBACRole | null> {
    await this.ensureRbacTables();
    const db = getDb();
    const res = await db.update(rbacRoles).set({
      ...updates,
      updatedAt: new Date()
    }).where(eq(rbacRoles.id, id)).returning();
    return res[0] as RBACRole || null;
  }

  async deleteRole(id: string): Promise<boolean> {
    await this.ensureRbacTables();
    const db = getDb();
    const res = await db.delete(rbacRoles).where(eq(rbacRoles.id, id)).returning();
    return res.length > 0;
  }

  // --- Permissions ---
  async createPermission(perm: Partial<RBACPermission>): Promise<RBACPermission> {
    await this.ensureRbacTables();
    const db = getDb();
    const payload = {
      id: perm.id!,
      name: perm.name!,
      description: perm.description || null,
    };
    const res = await db.insert(rbacPermissions).values(payload).returning();
    return res[0] as RBACPermission;
  }

  async listPermissions(): Promise<RBACPermission[]> {
    await this.ensureRbacTables();
    const db = getDb();
    const res = await db.select().from(rbacPermissions);
    return res as RBACPermission[];
  }

  // --- Role Permission Bindings ---
  async assignPermissionToRole(roleId: string, permissionId: string): Promise<void> {
    await this.ensureRbacTables();
    const db = getDb();
    await db.insert(rbacRolePermissions).values({ roleId, permissionId }).onConflictDoNothing();
  }

  async revokePermissionFromRole(roleId: string, permissionId: string): Promise<boolean> {
    await this.ensureRbacTables();
    const db = getDb();
    const res = await db
      .delete(rbacRolePermissions)
      .where(and(eq(rbacRolePermissions.roleId, roleId), eq(rbacRolePermissions.permissionId, permissionId)))
      .returning();
    return res.length > 0;
  }

  async getRolePermissions(roleId: string): Promise<string[]> {
    await this.ensureRbacTables();
    const db = getDb();
    const res = await db
      .select({ permissionId: rbacRolePermissions.permissionId })
      .from(rbacRolePermissions)
      .where(eq(rbacRolePermissions.roleId, roleId));
    return res.map(r => r.permissionId);
  }

  // --- User Role Assignments ---
  async assignRoleToUser(userId: number, roleId: string, organizationId: string | null = null, workspaceId: string | null = null): Promise<RBACUserRole> {
    await this.ensureRbacTables();
    const db = getDb();
    const payload = {
      userId,
      roleId,
      organizationId,
      workspaceId
    };
    try {
      const res = await db.insert(rbacUserRoles).values(payload).onConflictDoNothing().returning();
      if (res.length > 0) {
        return res[0] as RBACUserRole;
      }
      const existing = await db.select().from(rbacUserRoles).where(
        and(
          eq(rbacUserRoles.userId, userId),
          eq(rbacUserRoles.roleId, roleId)
        )
      ).limit(1);
      return existing[0] as RBACUserRole || payload as any;
    } catch (err) {
      const existing = await db.select().from(rbacUserRoles).where(
        and(
          eq(rbacUserRoles.userId, userId),
          eq(rbacUserRoles.roleId, roleId)
        )
      ).limit(1);
      return existing[0] as RBACUserRole || {
        id: Math.floor(Math.random() * 100000),
        userId,
        roleId,
        organizationId,
        workspaceId,
        createdAt: new Date().toISOString()
      } as any;
    }
  }

  async removeRoleFromUser(userId: number, roleId: string, organizationId: string | null = null, workspaceId: string | null = null): Promise<boolean> {
    await this.ensureRbacTables();
    const db = getDb();
    const conditions = [
      eq(rbacUserRoles.userId, userId),
      eq(rbacUserRoles.roleId, roleId)
    ];
    if (organizationId !== undefined) conditions.push(eq(rbacUserRoles.organizationId, organizationId));
    if (workspaceId !== undefined) conditions.push(eq(rbacUserRoles.workspaceId, workspaceId));

    const res = await db.delete(rbacUserRoles).where(and(...conditions)).returning();
    return res.length > 0;
  }

  async getUserRoles(userId: number): Promise<RBACUserRole[]> {
    await this.ensureRbacTables();
    const db = getDb();
    const res = await db.select().from(rbacUserRoles).where(eq(rbacUserRoles.userId, userId));
    return res as RBACUserRole[];
  }

  // --- Policies ---
  async createPolicy(policy: Partial<RBACPolicy>): Promise<RBACPolicy> {
    await this.ensureRbacTables();
    const db = getDb();
    const payload = {
      id: policy.id || `pol-${Date.now()}`,
      name: policy.name || "Default Access Policy",
      effect: policy.effect || "ALLOW",
      actions: policy.actions || [],
      resources: policy.resources || [],
      conditions: policy.conditions || {},
      organizationId: policy.organizationId || null,
      workspaceId: policy.workspaceId || null,
    };
    const res = await db.insert(rbacPolicies).values(payload).returning();
    return res[0] as RBACPolicy;
  }

  async listPolicies(): Promise<RBACPolicy[]> {
    await this.ensureRbacTables();
    const db = getDb();
    const res = await db.select().from(rbacPolicies);
    return res as RBACPolicy[];
  }

  async getPoliciesForScope(orgId?: string | null, wksId?: string | null): Promise<RBACPolicy[]> {
    await this.ensureRbacTables();
    const db = getDb();
    const conditions = [];
    if (orgId) {
      conditions.push(eq(rbacPolicies.organizationId, orgId));
    }
    if (wksId) {
      conditions.push(eq(rbacPolicies.workspaceId, wksId));
    }

    let query = db.select().from(rbacPolicies);
    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as any;
    }
    const res = await query;
    return res as RBACPolicy[];
  }

  async deletePolicy(id: string): Promise<boolean> {
    await this.ensureRbacTables();
    const db = getDb();
    const res = await db.delete(rbacPolicies).where(eq(rbacPolicies.id, id)).returning();
    return res.length > 0;
  }

  // --- Permission Logging ---
  async logPermissionCheck(log: Partial<RBACPermissionLog>): Promise<RBACPermissionLog> {
    await this.ensureRbacTables();
    const db = getDb();
    const payload = {
      userId: log.userId!,
      action: log.action!,
      resource: log.resource!,
      organizationId: log.organizationId || null,
      workspaceId: log.workspaceId || null,
      decision: log.decision!,
      reason: log.reason || null,
      latencyMs: log.latencyMs || 0,
    };
    const res = await db.insert(rbacPermissionLogs).values(payload).returning();
    return res[0] as RBACPermissionLog;
  }

  async getLogs(limit = 100): Promise<RBACPermissionLog[]> {
    await this.ensureRbacTables();
    const db = getDb();
    const res = await db.select().from(rbacPermissionLogs).orderBy(desc(rbacPermissionLogs.createdAt)).limit(limit);
    return res as RBACPermissionLog[];
  }

  // --- Permission Caching ---
  async getCachedPermissions(userId: number): Promise<string[] | null> {
    await this.ensureRbacTables();
    const db = getDb();
    const res = await db.select().from(rbacCache).where(eq(rbacCache.userId, userId)).limit(1);
    if (res.length === 0) return null;
    if (new Date() > res[0].expiresAt) {
      // Expired cache
      await db.delete(rbacCache).where(eq(rbacCache.userId, userId));
      return null;
    }
    return res[0].permissions as string[];
  }

  async setCachedPermissions(userId: number, permissions: string[], ttlSeconds = 60): Promise<void> {
    await this.ensureRbacTables();
    const db = getDb();
    const expiresAt = new Date(Date.now() + ttlSeconds * 1000);
    const payload = {
      userId,
      permissions,
      expiresAt
    };
    await db.insert(rbacCache).values(payload).onConflictDoUpdate({
      target: rbacCache.userId,
      set: {
        permissions,
        expiresAt
      }
    });
  }

  async invalidateCache(userId: number): Promise<void> {
    await this.ensureRbacTables();
    const db = getDb();
    await db.delete(rbacCache).where(eq(rbacCache.userId, userId));
  }
}
