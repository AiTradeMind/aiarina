import { eq, and, sql, desc, count } from "drizzle-orm";
import { getDb } from "../../../db/client.ts";
import { 
  orgOrganizations, 
  orgWorkspaces, 
  orgMembers, 
  orgSettings, 
  orgActivity, 
  orgMetadata,
  users 
} from "../../../db/schema.ts";
import { Organization, OrgMember, OrgSettings, OrgActivity, OrganizationStats } from "../types/index.ts";

export class OrganizationRepository {
  private static tableCheckDone = false;

  public async ensureOrgTables(): Promise<void> {
    if (OrganizationRepository.tableCheckDone) return;
    const db = getDb();
    try {
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS org_organizations (
          id VARCHAR(50) PRIMARY KEY,
          name VARCHAR(100) NOT NULL,
          logo TEXT,
          timezone VARCHAR(50) DEFAULT 'UTC' NOT NULL,
          locale VARCHAR(10) DEFAULT 'en-US' NOT NULL,
          currency VARCHAR(10) DEFAULT 'USD' NOT NULL,
          trading_region VARCHAR(50) DEFAULT 'US' NOT NULL,
          status VARCHAR(20) DEFAULT 'ACTIVE' NOT NULL,
          branding JSONB DEFAULT '{}'::jsonb NOT NULL,
          created_at TIMESTAMP DEFAULT now() NOT NULL,
          updated_at TIMESTAMP DEFAULT now() NOT NULL
        );
      `);

      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS org_workspaces (
          id VARCHAR(50) PRIMARY KEY,
          organization_id VARCHAR(50) REFERENCES org_organizations(id) ON DELETE CASCADE NOT NULL,
          name VARCHAR(100) NOT NULL,
          owner_id INTEGER REFERENCES users(id) NOT NULL,
          visibility VARCHAR(20) DEFAULT 'PRIVATE' NOT NULL,
          status VARCHAR(20) DEFAULT 'ACTIVE' NOT NULL,
          preferences JSONB DEFAULT '{}'::jsonb NOT NULL,
          metadata JSONB DEFAULT '{}'::jsonb NOT NULL,
          created_at TIMESTAMP DEFAULT now() NOT NULL,
          updated_at TIMESTAMP DEFAULT now() NOT NULL
        );
      `);

      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS org_members (
          id SERIAL PRIMARY KEY,
          organization_id VARCHAR(50) REFERENCES org_organizations(id) ON DELETE CASCADE NOT NULL,
          user_id INTEGER REFERENCES users(id) NOT NULL,
          role VARCHAR(50) DEFAULT 'MEMBER' NOT NULL,
          status VARCHAR(20) DEFAULT 'ACTIVE' NOT NULL,
          joined_at TIMESTAMP DEFAULT now() NOT NULL,
          last_activity TIMESTAMP DEFAULT now() NOT NULL
        );
      `);

      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS org_settings (
          organization_id VARCHAR(50) PRIMARY KEY REFERENCES org_organizations(id) ON DELETE CASCADE,
          ai_preferences JSONB DEFAULT '{}'::jsonb NOT NULL,
          security_settings JSONB DEFAULT '{}'::jsonb NOT NULL,
          workspace_defaults JSONB DEFAULT '{}'::jsonb NOT NULL,
          updated_at TIMESTAMP DEFAULT now() NOT NULL
        );
      `);

      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS org_activity (
          id SERIAL PRIMARY KEY,
          organization_id VARCHAR(50) NOT NULL,
          workspace_id VARCHAR(50),
          user_id INTEGER NOT NULL,
          action VARCHAR(100) NOT NULL,
          details TEXT,
          created_at TIMESTAMP DEFAULT now() NOT NULL
        );
      `);

      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS org_metadata (
          id SERIAL PRIMARY KEY,
          entity_type VARCHAR(50) NOT NULL,
          entity_id VARCHAR(50) NOT NULL,
          meta_key VARCHAR(100) NOT NULL,
          meta_value TEXT
        );
      `);

      OrganizationRepository.tableCheckDone = true;
    } catch (err) {
      console.error("Error creating missing organization tables dynamically:", err);
    }
  }

  constructor() {
    this.ensureOrgTables().catch(() => {});
  }

  async findById(id: string): Promise<Organization | null> {
    await this.ensureOrgTables();
    const db = getDb();
    const result = await db.select().from(orgOrganizations).where(eq(orgOrganizations.id, id)).limit(1);
    return result[0] as Organization || null;
  }

  async findAll(): Promise<Organization[]> {
    await this.ensureOrgTables();
    const db = getDb();
    const result = await db.select().from(orgOrganizations);
    return result as Organization[];
  }

  async create(org: Partial<Organization>): Promise<Organization> {
    await this.ensureOrgTables();
    const db = getDb();
    const payload = {
      id: org.id || `org-${Date.now()}`,
      name: org.name || "Default Organization",
      logo: org.logo || null,
      timezone: org.timezone || "UTC",
      locale: org.locale || "en-US",
      currency: org.currency || "USD",
      tradingRegion: org.tradingRegion || "US",
      status: org.status || "ACTIVE",
      branding: org.branding || {},
    };

    const result = await db.insert(orgOrganizations).values(payload).returning();
    
    // Auto-create blank settings for this organization
    await db.insert(orgSettings).values({
      organizationId: payload.id,
      aiPreferences: {},
      securitySettings: {},
      workspaceDefaults: {}
    }).onConflictDoNothing();

    return result[0] as Organization;
  }

  async update(id: string, org: Partial<Organization>): Promise<Organization | null> {
    await this.ensureOrgTables();
    const db = getDb();
    const result = await db
      .update(orgOrganizations)
      .set({
        ...org,
        updatedAt: new Date(),
      })
      .where(eq(orgOrganizations.id, id))
      .returning();
    return result[0] as Organization || null;
  }

  async delete(id: string): Promise<boolean> {
    await this.ensureOrgTables();
    const db = getDb();
    const result = await db.delete(orgOrganizations).where(eq(orgOrganizations.id, id)).returning();
    return result.length > 0;
  }

  // --- Member Management ---
  async getMembers(orgId: string): Promise<OrgMember[]> {
    await this.ensureOrgTables();
    const db = getDb();
    const result = await db
      .select({
        id: orgMembers.id,
        organizationId: orgMembers.organizationId,
        userId: orgMembers.userId,
        role: orgMembers.role,
        status: orgMembers.status,
        joinedAt: orgMembers.joinedAt,
        lastActivity: orgMembers.lastActivity,
        userEmail: users.email,
      })
      .from(orgMembers)
      .leftJoin(users, eq(orgMembers.userId, users.id))
      .where(eq(orgMembers.organizationId, orgId));
    return result as OrgMember[];
  }

  async addMember(orgId: string, userId: number, role: 'OWNER' | 'ADMIN' | 'MEMBER'): Promise<OrgMember> {
    await this.ensureOrgTables();
    const db = getDb();
    const payload = {
      organizationId: orgId,
      userId,
      role,
      status: 'ACTIVE' as const,
    };
    const result = await db.insert(orgMembers).values(payload).returning();
    return result[0] as OrgMember;
  }

  async updateMemberRoleAndStatus(orgId: string, userId: number, role?: 'OWNER' | 'ADMIN' | 'MEMBER', status?: 'ACTIVE' | 'SUSPENDED' | 'PENDING'): Promise<OrgMember | null> {
    await this.ensureOrgTables();
    const db = getDb();
    const updates: Record<string, any> = { lastActivity: new Date() };
    if (role) updates.role = role;
    if (status) updates.status = status;

    const result = await db
      .update(orgMembers)
      .set(updates)
      .where(and(eq(orgMembers.organizationId, orgId), eq(orgMembers.userId, userId)))
      .returning();
    return result[0] as OrgMember || null;
  }

  async removeMember(orgId: string, userId: number): Promise<boolean> {
    await this.ensureOrgTables();
    const db = getDb();
    const result = await db
      .delete(orgMembers)
      .where(and(eq(orgMembers.organizationId, orgId), eq(orgMembers.userId, userId)))
      .returning();
    return result.length > 0;
  }

  async checkMembership(orgId: string, userId: number): Promise<OrgMember | null> {
    await this.ensureOrgTables();
    const db = getDb();
    const result = await db
      .select()
      .from(orgMembers)
      .where(and(eq(orgMembers.organizationId, orgId), eq(orgMembers.userId, userId)))
      .limit(1);
    return result[0] as OrgMember || null;
  }

  // --- Settings ---
  async getSettings(orgId: string): Promise<OrgSettings | null> {
    await this.ensureOrgTables();
    const db = getDb();
    const result = await db.select().from(orgSettings).where(eq(orgSettings.organizationId, orgId)).limit(1);
    return result[0] as OrgSettings || null;
  }

  async updateSettings(orgId: string, settings: Partial<OrgSettings>): Promise<OrgSettings> {
    await this.ensureOrgTables();
    const db = getDb();
    const updates = {
      ...settings,
      updatedAt: new Date(),
    };
    const result = await db
      .insert(orgSettings)
      .values({ organizationId: orgId, ...updates })
      .onConflictDoUpdate({
        target: orgSettings.organizationId,
        set: updates,
      })
      .returning();
    return result[0] as OrgSettings;
  }

  // --- Activity Logging ---
  async logActivity(orgId: string, workspaceId: string | null, userId: number, action: string, details: string | null): Promise<OrgActivity> {
    await this.ensureOrgTables();
    const db = getDb();
    const result = await db
      .insert(orgActivity)
      .values({
        organizationId: orgId,
        workspaceId,
        userId,
        action,
        details,
      })
      .returning();
    return result[0] as OrgActivity;
  }

  async getActivities(orgId: string, limit = 20): Promise<OrgActivity[]> {
    await this.ensureOrgTables();
    const db = getDb();
    const result = await db
      .select()
      .from(orgActivity)
      .where(eq(orgActivity.organizationId, orgId))
      .orderBy(desc(orgActivity.createdAt))
      .limit(limit);
    return result as OrgActivity[];
  }

  // --- Observability & Stats ---
  async getStats(orgId?: string): Promise<OrganizationStats> {
    await this.ensureOrgTables();
    const db = getDb();

    // 1. Organization count
    const orgCountRes = await db.select({ val: count() }).from(orgOrganizations);
    const orgCount = orgCountRes[0]?.val || 0;

    // 2. Workspace count
    const wksConditions = [];
    if (orgId) {
      wksConditions.push(eq(orgWorkspaces.organizationId, orgId));
    }
    const wksCountRes = await db
      .select({ val: count() })
      .from(orgWorkspaces)
      .where(wksConditions.length > 0 ? and(...wksConditions) : undefined);
    const workspaceCount = wksCountRes[0]?.val || 0;

    // 3. Member count
    const memConditions = [];
    if (orgId) {
      memConditions.push(eq(orgMembers.organizationId, orgId));
    }
    const memCountRes = await db
      .select({ val: count() })
      .from(orgMembers)
      .where(memConditions.length > 0 ? and(...memConditions) : undefined);
    const memberCount = memCountRes[0]?.val || 0;

    // 4. Storage count (simulated mock value but dynamic based on member activity multiplier)
    const storageUsageBytes = (memberCount * 1420 + workspaceCount * 5120) * 1024;

    // 5. Active workspace count
    const activeWksConditions = [eq(orgWorkspaces.status, 'ACTIVE')];
    if (orgId) {
      activeWksConditions.push(eq(orgWorkspaces.organizationId, orgId));
    }
    const activeWksRes = await db
      .select({ val: count() })
      .from(orgWorkspaces)
      .where(and(...activeWksConditions));
    const activeWorkspacesCount = activeWksRes[0]?.val || 0;

    // 6. Recent activity
    let recentActivity: any[] = [];
    if (orgId) {
      recentActivity = await db
        .select()
        .from(orgActivity)
        .where(eq(orgActivity.organizationId, orgId))
        .orderBy(desc(orgActivity.createdAt))
        .limit(10);
    } else {
      recentActivity = await db
        .select()
        .from(orgActivity)
        .orderBy(desc(orgActivity.createdAt))
        .limit(10);
    }

    // Calculate a dynamic health score based on system stats (mock logic for enterprise robustness)
    const healthScore = Math.min(100, 85 + (activeWorkspacesCount > 0 ? 10 : 0) + (memberCount > 1 ? 5 : 0));

    return {
      organizationCount: orgCount,
      workspaceCount,
      memberCount,
      storageUsageBytes,
      activeWorkspacesCount,
      healthScore,
      recentActivity: recentActivity as OrgActivity[],
    };
  }
}
