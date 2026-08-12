import { eq, and, sql } from "drizzle-orm";
import { getDb } from "../../../db/client.ts";
import { orgWorkspaces, orgOrganizations } from "../../../db/schema.ts";
import { Workspace } from "../types/index.ts";

export class WorkspaceRepository {
  async findById(id: string): Promise<Workspace | null> {
    const db = getDb();
    const result = await db.select().from(orgWorkspaces).where(eq(orgWorkspaces.id, id)).limit(1);
    return result[0] as Workspace || null;
  }

  async findByOrg(orgId: string): Promise<Workspace[]> {
    const db = getDb();
    const result = await db.select().from(orgWorkspaces).where(eq(orgWorkspaces.organizationId, orgId));
    return result as Workspace[];
  }

  async create(wks: Partial<Workspace>): Promise<Workspace> {
    const db = getDb();
    const payload = {
      id: wks.id || `wks-${Date.now()}`,
      organizationId: wks.organizationId!,
      name: wks.name || "Default Workspace",
      ownerId: wks.ownerId!,
      visibility: wks.visibility || "PRIVATE",
      status: wks.status || "ACTIVE",
      preferences: wks.preferences || {},
      metadata: wks.metadata || {},
    };

    const result = await db.insert(orgWorkspaces).values(payload).returning();
    return result[0] as Workspace;
  }

  async update(id: string, wks: Partial<Workspace>): Promise<Workspace | null> {
    const db = getDb();
    const result = await db
      .update(orgWorkspaces)
      .set({
        ...wks,
        updatedAt: new Date(),
      })
      .where(eq(orgWorkspaces.id, id))
      .returning();
    return result[0] as Workspace || null;
  }

  async delete(id: string): Promise<boolean> {
    const db = getDb();
    const result = await db.delete(orgWorkspaces).where(eq(orgWorkspaces.id, id)).returning();
    return result.length > 0;
  }

  async checkOwnership(id: string, userId: number): Promise<boolean> {
    const db = getDb();
    const result = await db
      .select({ ownerId: orgWorkspaces.ownerId })
      .from(orgWorkspaces)
      .where(eq(orgWorkspaces.id, id))
      .limit(1);
    return result[0]?.ownerId === userId;
  }

  async transferOwnership(id: string, newOwnerId: number): Promise<Workspace | null> {
    const db = getDb();
    const result = await db
      .update(orgWorkspaces)
      .set({
        ownerId: newOwnerId,
        updatedAt: new Date(),
      })
      .where(eq(orgWorkspaces.id, id))
      .returning();
    return result[0] as Workspace || null;
  }
}
