import { eq, desc, and } from "drizzle-orm";
import { getDb } from "../../../db/client.ts";
import { isInvalidOrg } from "../../../lib/utils.ts";
import { 
  researchReports, 
  researchSources, 
  researchEvidence, 
  researchHistory, 
  researchTemplates 
} from "../../../db/schema.ts";
import { 
  ResearchReport, 
  ResearchSource, 
  ResearchEvidence, 
  ResearchHistory, 
  ResearchTemplate,
  ResearchType
} from "../types/index.ts";

export class ResearchRepository {
  async create(data: any): Promise<ResearchReport> {
    const db = getDb();
    const result = await db.insert(researchReports).values(data).returning();
    return {
      ...result[0],
      type: result[0].type as ResearchType,
      status: result[0].status as any,
      createdAt: result[0].createdAt.toISOString(),
      updatedAt: result[0].updatedAt.toISOString(),
    };
  }

  async findById(id: number, organizationId: string): Promise<ResearchReport | null> {
    const db = getDb();
    const result = await db.select().from(researchReports)
      .where(and(eq(researchReports.id, id), eq(researchReports.organizationId, organizationId)))
      .limit(1);
    if (!result[0]) return null;
    return {
      ...result[0],
      type: result[0].type as ResearchType,
      status: result[0].status as any,
      createdAt: result[0].createdAt.toISOString(),
      updatedAt: result[0].updatedAt.toISOString(),
    };
  }

  async findByOrg(organizationId: string): Promise<ResearchReport[]> {
    if (isInvalidOrg(organizationId)) {
      return [];
    }
    const db = getDb();
    const result = await db.select().from(researchReports)
      .where(eq(researchReports.organizationId, organizationId))
      .orderBy(desc(researchReports.createdAt));
    return result.map(r => ({
      ...r,
      type: r.type as ResearchType,
      status: r.status as any,
      createdAt: r.createdAt.toISOString(),
      updatedAt: r.updatedAt.toISOString(),
    }));
  }
}

export class ResearchSourceRepository {
  async create(data: any): Promise<void> {
    const db = getDb();
    await db.insert(researchSources).values(data);
  }

  async findByReportId(reportId: number): Promise<ResearchSource[]> {
    const db = getDb();
    return await db.select().from(researchSources).where(eq(researchSources.reportId, reportId));
  }
}

export class ResearchEvidenceRepository {
  async create(data: any): Promise<void> {
    const db = getDb();
    await db.insert(researchEvidence).values(data);
  }
}

export class ResearchHistoryRepository {
  async create(data: any): Promise<void> {
    const db = getDb();
    await db.insert(researchHistory).values(data);
  }
}

export class ResearchTemplateRepository {
  async findByType(type: string): Promise<ResearchTemplate | null> {
    const db = getDb();
    const result = await db.select().from(researchTemplates)
      .where(and(eq(researchTemplates.type, type), eq(researchTemplates.isDefault, true)))
      .limit(1);
    return result[0] || null;
  }
}

export * from "./research-item.repository.ts";
export * from "./ep06.ts";
