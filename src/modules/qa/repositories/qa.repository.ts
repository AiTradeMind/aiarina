import { eq, desc } from "drizzle-orm";
import { getDb } from "../../../db/client.ts";
import { qaTestSuite, qaDomainResult, qaCertificationReport, qaAuditLog, qaBenchmarkRecord } from "../../../db/schema.ts";

export class QARepository {
  async createCertificationReport(data: any) {
    const db = getDb();
    const result = await db.insert(qaCertificationReport).values(data).returning();
    return result[0];
  }

  async getLatestCertificationReport() {
    const db = getDb();
    const result = await db.select().from(qaCertificationReport).orderBy(desc(qaCertificationReport.createdAt)).limit(1);
    return result[0] || null;
  }

  async saveDomainResult(data: any) {
    const db = getDb();
    const result = await db.insert(qaDomainResult).values(data).returning();
    return result[0];
  }

  async getDomainResults() {
    const db = getDb();
    return await db.select().from(qaDomainResult).orderBy(qaDomainResult.domainNumber);
  }

  async createAuditLog(data: any) {
    const db = getDb();
    const result = await db.insert(qaAuditLog).values(data).returning();
    return result[0];
  }

  async getAuditLogs(limitCount = 50) {
    const db = getDb();
    return await db.select().from(qaAuditLog).orderBy(desc(qaAuditLog.createdAt)).limit(limitCount);
  }

  async createBenchmarkRecord(data: any) {
    const db = getDb();
    const result = await db.insert(qaBenchmarkRecord).values(data).returning();
    return result[0];
  }

  async getBenchmarkRecords() {
    const db = getDb();
    return await db.select().from(qaBenchmarkRecord);
  }
}

export const qaRepository = new QARepository();
