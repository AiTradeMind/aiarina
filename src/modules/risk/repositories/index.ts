// @ts-nocheck
import { eq } from "drizzle-orm";
import { getDb } from "../../../db/client.ts";
import { isInvalidOrg } from "../../../lib/utils.ts";
import { riskProfiles, riskLimits, riskEvents } from "../../../db/schema.ts";
import { RiskProfile, RiskLimit, RiskEvent, RiskAction, RiskSeverity } from "../types/index.ts";

export class RiskProfileRepository {
  async findByOrganizationId(organizationId: string): Promise<RiskProfile | null> {
    if (isInvalidOrg(organizationId)) {
      return null;
    }
    const db = getDb();
    const result = await db.select().from(riskProfiles).where(eq(riskProfiles.organizationId, organizationId)).limit(1);
    if (!result[0]) return null;
    return {
      ...result[0],
      riskLevel: result[0].riskLevel as any,
      updatedAt: result[0].updatedAt.toISOString(),
    };
  }

  async create(data: Omit<RiskProfile, 'id' | 'updatedAt'>): Promise<RiskProfile> {
    if (isInvalidOrg(data.organizationId)) {
      throw new Error("Cannot create RiskProfile for invalid organization");
    }
    const db = getDb();
    const result = await db.insert(riskProfiles).values(data).returning();
    return {
      ...result[0],
      riskLevel: result[0].riskLevel as any,
      updatedAt: result[0].updatedAt.toISOString(),
    };
  }
}

export class RiskLimitRepository {
  async findByOrganizationId(organizationId: string): Promise<RiskLimit | null> {
    if (isInvalidOrg(organizationId)) {
      return null;
    }
    const db = getDb();
    const result = await db.select().from(riskLimits).where(eq(riskLimits.organizationId, organizationId)).limit(1);
    if (!result[0]) return null;
    return {
      ...result[0],
      updatedAt: result[0].updatedAt.toISOString(),
    };
  }

  async upsert(data: Omit<RiskLimit, 'id' | 'updatedAt'>): Promise<RiskLimit> {
    if (isInvalidOrg(data.organizationId)) {
      throw new Error("Cannot upsert RiskLimit for invalid organization");
    }
    const db = getDb();
    const existing = await this.findByOrganizationId(data.organizationId);
    
    if (existing) {
      const result = await db.update(riskLimits)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(riskLimits.organizationId, data.organizationId))
        .returning();
      return {
        ...result[0],
        updatedAt: result[0].updatedAt.toISOString(),
      };
    } else {
      const result = await db.insert(riskLimits).values(data).returning();
      return {
        ...result[0],
        updatedAt: result[0].updatedAt.toISOString(),
      };
    }
  }
}

export class RiskEventRepository {
  async findByOrganizationId(organizationId: string): Promise<RiskEvent[]> {
    if (isInvalidOrg(organizationId)) {
      return [];
    }
    const db = getDb();
    const result = await db.select().from(riskEvents).where(eq(riskEvents.organizationId, organizationId));
    return result.map(e => ({
      ...e,
      action: e.action as RiskAction,
      severity: e.severity as RiskSeverity,
      timestamp: e.timestamp.toISOString(),
    }));
  }

  async create(data: Omit<RiskEvent, 'id' | 'timestamp'>): Promise<RiskEvent> {
    const db = getDb();
    const result = await db.insert(riskEvents).values(data).returning();
    return {
      ...result[0],
      action: result[0].action as RiskAction,
      severity: result[0].severity as RiskSeverity,
      timestamp: result[0].timestamp.toISOString(),
    };
  }
}
