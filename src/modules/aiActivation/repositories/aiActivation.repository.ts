import { getDb } from "../../../db/client.ts";
import { 
  aiActivationTable, 
  aiRuntimeTable, 
  aiRuntimeLicenseTable, 
  aiRuntimeResourceTable, 
  aiRuntimeQuotaTable, 
  aiRuntimeAuditTable, 
  aiRuntimeCertificateTable, 
  aiRuntimeCertificateRegistryTable, 
  aiRuntimeEventsTable 
} from "../../../db/schema.ts";
import { eq, desc } from "drizzle-orm";
import logger from "../../../lib/logger.ts";

export class AIActivationRepository {
  async getAllRuntimes() {
    const db = getDb();
    return await db.select().from(aiRuntimeTable);
  }

  async getRuntimeByModelId(aiModelId: string) {
    const db = getDb();
    const rows = await db.select().from(aiRuntimeTable).where(eq(aiRuntimeTable.aiModelId, aiModelId));
    return rows[0] || null;
  }

  async getRuntimeById(runtimeId: string) {
    const db = getDb();
    const rows = await db.select().from(aiRuntimeTable).where(eq(aiRuntimeTable.runtimeId, runtimeId));
    return rows[0] || null;
  }

  async upsertRuntime(data: any) {
    const db = getDb();
    const existing = await this.getRuntimeByModelId(data.aiModelId);
    if (existing) {
      await db.update(aiRuntimeTable)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(aiRuntimeTable.aiModelId, data.aiModelId));
      return await this.getRuntimeByModelId(data.aiModelId);
    } else {
      await db.insert(aiRuntimeTable).values(data);
      return await this.getRuntimeByModelId(data.aiModelId);
    }
  }

  async updateRuntimeStatus(aiModelId: string, status: string) {
    const db = getDb();
    await db.update(aiRuntimeTable)
      .set({ status, updatedAt: new Date() })
      .where(eq(aiRuntimeTable.aiModelId, aiModelId));
    return await this.getRuntimeByModelId(aiModelId);
  }

  async logActivation(data: any) {
    const db = getDb();
    await db.insert(aiActivationTable).values(data);
  }

  async getActivations() {
    const db = getDb();
    return await db.select().from(aiActivationTable).orderBy(desc(aiActivationTable.createdAt));
  }

  async getLicense(runtimeId: string) {
    const db = getDb();
    const rows = await db.select().from(aiRuntimeLicenseTable).where(eq(aiRuntimeLicenseTable.runtimeId, runtimeId));
    return rows[0] || null;
  }

  async upsertLicense(data: any) {
    const db = getDb();
    const existing = await this.getLicense(data.runtimeId);
    if (existing) {
      await db.update(aiRuntimeLicenseTable).set(data).where(eq(aiRuntimeLicenseTable.runtimeId, data.runtimeId));
    } else {
      await db.insert(aiRuntimeLicenseTable).values(data);
    }
  }

  async getResource(runtimeId: string) {
    const db = getDb();
    const rows = await db.select().from(aiRuntimeResourceTable).where(eq(aiRuntimeResourceTable.runtimeId, runtimeId));
    return rows[0] || null;
  }

  async upsertResource(data: any) {
    const db = getDb();
    const existing = await this.getResource(data.runtimeId);
    if (existing) {
      await db.update(aiRuntimeResourceTable).set({ ...data, updatedAt: new Date() }).where(eq(aiRuntimeResourceTable.runtimeId, data.runtimeId));
    } else {
      await db.insert(aiRuntimeResourceTable).values(data);
    }
  }

  async getQuota(runtimeId: string) {
    const db = getDb();
    const rows = await db.select().from(aiRuntimeQuotaTable).where(eq(aiRuntimeQuotaTable.runtimeId, runtimeId));
    return rows[0] || null;
  }

  async upsertQuota(data: any) {
    const db = getDb();
    const existing = await this.getQuota(data.runtimeId);
    if (existing) {
      await db.update(aiRuntimeQuotaTable).set({ ...data, updatedAt: new Date() }).where(eq(aiRuntimeQuotaTable.runtimeId, data.runtimeId));
    } else {
      await db.insert(aiRuntimeQuotaTable).values(data);
    }
  }

  async logAudit(data: any) {
    const db = getDb();
    await db.insert(aiRuntimeAuditTable).values(data);
  }

  async getAudits(runtimeId?: string) {
    const db = getDb();
    if (runtimeId) {
      return await db.select().from(aiRuntimeAuditTable).where(eq(aiRuntimeAuditTable.runtimeId, runtimeId)).orderBy(desc(aiRuntimeAuditTable.createdAt));
    }
    return await db.select().from(aiRuntimeAuditTable).orderBy(desc(aiRuntimeAuditTable.createdAt));
  }

  async saveCertificate(data: any) {
    const db = getDb();
    await db.insert(aiRuntimeCertificateTable).values(data);
    await db.insert(aiRuntimeCertificateRegistryTable).values({
      id: `REG-${data.certificateId}`,
      certificateId: data.certificateId,
      status: 'VALID',
      history: [{ action: 'ISSUED', timestamp: new Date().toISOString(), operator: data.operator }]
    });
  }

  async getCertificates() {
    const db = getDb();
    return await db.select().from(aiRuntimeCertificateTable).orderBy(desc(aiRuntimeCertificateTable.createdAt));
  }

  async logEvent(eventType: string, runtimeId: string | null, payload: any) {
    const db = getDb();
    await db.insert(aiRuntimeEventsTable).values({
      id: `EVT-AI-${Date.now()}-${Math.floor(Math.random()*1000)}`,
      eventType,
      runtimeId,
      payload
    });
  }

  async getEvents() {
    const db = getDb();
    return await db.select().from(aiRuntimeEventsTable).orderBy(desc(aiRuntimeEventsTable.createdAt));
  }
}

export const aiActivationRepository = new AIActivationRepository();
