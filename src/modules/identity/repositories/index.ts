import { eq, and, inArray } from "drizzle-orm";
import { getDb } from "../../../db/client.ts";
import { users, organizations, roles, rolePermissions, memberships, permissions } from "../../../db/schema.ts";
import { RoleType, Organization, Membership, Role, Permission } from "../types/index.ts";

export class UserRepository {
  async findById(id: number) {
    const db = getDb();
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0] || null;
  }

  async findByEmail(email: string) {
    const db = getDb();
    const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
    return result[0] || null;
  }

  async findAll() {
    const db = getDb();
    return await db.select().from(users);
  }

  async create(email: string, role: RoleType, settings: Record<string, any> = {}) {
    const db = getDb();
    const result = await db
      .insert(users)
      .values({
        email,
        role,
        settings,
      })
      .returning();
    return result[0];
  }

  async update(id: number, email?: string, role?: RoleType, settings?: Record<string, any>) {
    const db = getDb();
    const updateData: Partial<typeof users.$inferInsert> = {};
    if (email !== undefined) updateData.email = email;
    if (role !== undefined) updateData.role = role;
    if (settings !== undefined) updateData.settings = settings;

    const result = await db
      .update(users)
      .set(updateData)
      .where(eq(users.id, id))
      .returning();
    return result[0] || null;
  }

  async delete(id: number) {
    const db = getDb();
    const result = await db.delete(users).where(eq(users.id, id)).returning();
    return result[0] || null;
  }
}

export class OrganizationRepository {
  async findById(id: string): Promise<Organization | null> {
    const db = getDb();
    const result = await db.select().from(organizations).where(eq(organizations.id, id)).limit(1);
    if (!result[0]) return null;
    return {
      ...result[0],
      createdAt: result[0].createdAt.toISOString(),
    };
  }

  async findAll(): Promise<Organization[]> {
    const db = getDb();
    const result = await db.select().from(organizations);
    return result.map(org => ({
      ...org,
      createdAt: org.createdAt.toISOString(),
    }));
  }

  async create(name: string, description: string): Promise<Organization> {
    const db = getDb();
    const id = `org-${Date.now()}`;
    const result = await db.insert(organizations).values({
      id,
      name,
      description,
    }).returning();
    return {
      ...result[0],
      createdAt: result[0].createdAt.toISOString(),
    };
  }
}

export class RoleRepository {
  async findByName(name: RoleType): Promise<Role | null> {
    const db = getDb();
    const result = await db.select().from(roles).where(eq(roles.name, name)).limit(1);
    if (!result[0]) return null;
    
    const perms = await db.select({
      permissionName: rolePermissions.permissionName
    })
    .from(rolePermissions)
    .where(eq(rolePermissions.roleName, name));

    return {
      name: result[0].name as RoleType,
      description: result[0].description || "",
      permissions: perms.map(p => p.permissionName as Permission),
    };
  }

  async findAll(): Promise<Role[]> {
    const db = getDb();
    const result = await db
      .select({
        roleName: roles.name,
        roleDescription: roles.description,
        permissionName: rolePermissions.permissionName,
      })
      .from(roles)
      .leftJoin(rolePermissions, eq(roles.name, rolePermissions.roleName));

    const rolesMap = new Map<RoleType, Role>();
    for (const row of result) {
      if (!rolesMap.has(row.roleName as RoleType)) {
        rolesMap.set(row.roleName as RoleType, {
          name: row.roleName as RoleType,
          description: row.roleDescription || "",
          permissions: [],
        });
      }
      if (row.permissionName) {
        rolesMap.get(row.roleName as RoleType)!.permissions.push(row.permissionName as Permission);
      }
    }
    return Array.from(rolesMap.values());
  }
}

export class MembershipRepository {
  async getMembershipsForUser(userId: number): Promise<Membership[]> {
    if (!userId || userId <= 0 || isNaN(userId)) {
      return [];
    }
    try {
      const db = getDb();
      const results = await db
        .select({
          userId: memberships.userId,
          organizationId: memberships.organizationId,
          role: memberships.role,
          joinedAt: memberships.joinedAt,
          permissionName: rolePermissions.permissionName,
        })
        .from(memberships)
        .leftJoin(rolePermissions, eq(memberships.role, rolePermissions.roleName))
        .where(eq(memberships.userId, userId));

      const membershipsMap = new Map<string, Membership>();
      for (const m of results) {
        const key = `${m.userId}-${m.organizationId}`;
        if (!membershipsMap.has(key)) {
          membershipsMap.set(key, {
            userId: m.userId as number,
            organizationId: m.organizationId as string,
            role: m.role as RoleType,
            permissions: [],
            joinedAt: m.joinedAt.toISOString(),
          });
        }
        if (m.permissionName) {
          membershipsMap.get(key)!.permissions.push(m.permissionName as Permission);
        }
      }
      return Array.from(membershipsMap.values());
    } catch (err) {
      return [];
    }
  }

  async addMembership(userId: number, organizationId: string, role: RoleType) {
    if (!userId || userId <= 0 || isNaN(userId) || !organizationId) {
      return null;
    }
    try {
      const db = getDb();
      const result = await db.insert(memberships).values({
        userId,
        organizationId,
        role,
      }).returning();
      return result[0];
    } catch (err) {
      return null;
    }
  }
}

