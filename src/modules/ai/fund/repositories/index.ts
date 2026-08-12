import { getDb } from "../../../../db/client.ts";
import { 
  aiFunds, aiAllocations, allocationHistory, allocationRules, allocationSnapshots, allocationRecommendations 
} from "../../../../db/schema.ts";
import { eq, desc } from "drizzle-orm";
import { 
  AiFund, AiAllocation, AllocationHistory, AllocationRule, AllocationSnapshot, AllocationRecommendation 
} from "../types/index.ts";

export class FundRepository {
  async getFunds(): Promise<AiFund[]> {
    const db = await getDb();
    return await db.select().from(aiFunds) as AiFund[];
  }

  async getFundByModel(modelId: string): Promise<AiFund | null> {
    const db = await getDb();
    const result = await db.select().from(aiFunds).where(eq(aiFunds.modelId, modelId));
    return result.length > 0 ? (result[0] as AiFund) : null;
  }

  async getAllocations(): Promise<AiAllocation[]> {
    const db = await getDb();
    return await db.select().from(aiAllocations).orderBy(desc(aiAllocations.createdAt)) as AiAllocation[];
  }

  async getHistory(): Promise<AllocationHistory[]> {
    const db = await getDb();
    return await db.select().from(allocationHistory).orderBy(desc(allocationHistory.timestamp)) as AllocationHistory[];
  }

  async getRules(): Promise<AllocationRule[]> {
    const db = await getDb();
    return await db.select().from(allocationRules) as AllocationRule[];
  }

  async getRecommendations(): Promise<AllocationRecommendation[]> {
    const db = await getDb();
    return await db.select().from(allocationRecommendations).orderBy(desc(allocationRecommendations.createdAt)) as AllocationRecommendation[];
  }

  async updateRule(id: string, updates: Partial<AllocationRule>): Promise<void> {
    const db = await getDb();
    // @ts-ignore
    await db.update(allocationRules).set({ ...updates, updatedAt: new Date() }).where(eq(allocationRules.id, id));
  }
  
  async updateFund(id: string, updates: Partial<AiFund>): Promise<void> {
    const db = await getDb();
    // @ts-ignore
    await db.update(aiFunds).set({ ...updates, updatedAt: new Date() }).where(eq(aiFunds.id, id));
  }
  
  async createFund(fund: AiFund): Promise<void> {
    const db = await getDb();
    // @ts-ignore
    await db.insert(aiFunds).values(fund);
  }
  
  async createRule(rule: AllocationRule): Promise<void> {
    const db = await getDb();
    // @ts-ignore
    await db.insert(allocationRules).values(rule);
  }
  
  async createRecommendation(rec: AllocationRecommendation): Promise<void> {
    const db = await getDb();
    // @ts-ignore
    await db.insert(allocationRecommendations).values(rec);
  }
}
