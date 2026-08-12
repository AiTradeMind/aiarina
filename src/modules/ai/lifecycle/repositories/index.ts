import { 
  aiModelLifecycles, aiModelStateHistory, aiModelActivationLogs, 
  aiModelRetirementLogs, aiModelTransitions 
} from "../../../../db/schema";
import { getDb } from "../../../../db/client";
import { eq } from "drizzle-orm";

export class LifecycleRepository {
  private db = getDb();

  async getLifecycles() {
    return await this.db.select().from(aiModelLifecycles);
  }

  async getLifecycleByModelId(modelId: number) {
    const result = await this.db.select().from(aiModelLifecycles).where(eq(aiModelLifecycles.modelId, modelId));
    return result[0];
  }

  async createLifecycle(data: any) {
    return await this.db.insert(aiModelLifecycles).values(data).returning();
  }

  async updateLifecycle(id: string, data: any) {
    return await this.db.update(aiModelLifecycles).set(data).where(eq(aiModelLifecycles.id, id));
  }

  async createStateHistory(data: any) {
    return await this.db.insert(aiModelStateHistory).values(data);
  }

  async getHistory(modelId: number) {
    return await this.db.select().from(aiModelStateHistory).where(eq(aiModelStateHistory.modelId, modelId));
  }

  async createActivationLog(data: any) {
    return await this.db.insert(aiModelActivationLogs).values(data);
  }

  async getActivationLogs(modelId: number) {
    return await this.db.select().from(aiModelActivationLogs).where(eq(aiModelActivationLogs.modelId, modelId));
  }

  async createRetirementLog(data: any) {
    return await this.db.insert(aiModelRetirementLogs).values(data);
  }

  async getRetirementLogs(modelId: number) {
    return await this.db.select().from(aiModelRetirementLogs).where(eq(aiModelRetirementLogs.modelId, modelId));
  }
}
