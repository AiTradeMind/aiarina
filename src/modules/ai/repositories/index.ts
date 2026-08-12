import { eq, and, desc, sql } from "drizzle-orm";
import { getDb, isDatabaseConnected } from "../../../db/client.ts";
import { 
  aiProviders, 
  aiModels, 
  aiProviderHealth, 
  aiUsage, 
  aiCost, 
  aiRequestLogs 
} from "../../../db/schema.ts";
import { 
  AIProvider, 
  AIModel, 
  AIProviderHealth, 
  AIUsage, 
  AICost, 
  AIRequestLog,
  ProviderStatus
} from "../types/index.ts";

export class AIProviderRepository {
  async findAll(): Promise<AIProvider[]> {
    const db = getDb();
    const result = await db.select().from(aiProviders).orderBy(aiProviders.priority);
    return result.map(p => ({
      ...p,
      createdAt: p.createdAt.toISOString(),
      updatedAt: p.updatedAt.toISOString(),
    }));
  }

  async findByName(name: string): Promise<AIProvider | null> {
    const db = getDb();
    const result = await db.select().from(aiProviders).where(eq(aiProviders.name, name)).limit(1);
    if (!result[0]) return null;
    return {
      ...result[0],
      createdAt: result[0].createdAt.toISOString(),
      updatedAt: result[0].updatedAt.toISOString(),
    };
  }

  async create(data: any): Promise<AIProvider> {
    const db = getDb();
    const result = await db.insert(aiProviders).values(data).returning();
    return {
      ...result[0],
      createdAt: result[0].createdAt.toISOString(),
      updatedAt: result[0].updatedAt.toISOString(),
    };
  }
}

export class AIModelsException extends Error {
  errorCode: string;
  constructor(errorCode: string, message: string) {
    super(message);
    this.name = "AIModelsException";
    this.errorCode = errorCode;
  }
}

export class AIModelRepository {
  async findAll(): Promise<AIModel[]> {
    try {
      const db = getDb();
      const result = await db.select().from(aiModels);
      return result.map(m => ({
        ...m,
        createdAt: m.createdAt.toISOString(),
        updatedAt: m.updatedAt.toISOString(),
        capabilities: m.capabilities as string[],
        inputTypes: m.inputTypes as string[],
        outputTypes: m.outputTypes as string[],
        supportedMarkets: m.supportedMarkets as string[],
        supportedStrategies: m.supportedStrategies as string[],
      }));
    } catch (err: any) {
      const errMsg = err?.message || String(err);
      if (!isDatabaseConnected() || errMsg.includes("ECONNREFUSED") || errMsg.includes("connection") || errMsg.includes("timeout") || errMsg.includes("pool")) {
        throw new AIModelsException("DATABASE_UNAVAILABLE", "Database is currently unavailable.");
      }
      if (errMsg.includes("relation") && errMsg.includes("does not exist")) {
        throw new AIModelsException("AI_MODELS_NOT_INITIALIZED", "AI models table is missing or not initialized.");
      }
      console.error(err); throw new AIModelsException("DATABASE_UNAVAILABLE", "Database query failed cleanly: " + errMsg);
    }
  }

  async findByProvider(providerId: number): Promise<AIModel[]> {
    try {
      const db = getDb();
      const result = await db.select().from(aiModels).where(eq(aiModels.providerId, providerId));
      return result.map(m => ({
        ...m,
        createdAt: m.createdAt.toISOString(),
        updatedAt: m.updatedAt.toISOString(),
        capabilities: m.capabilities as string[],
        inputTypes: m.inputTypes as string[],
        outputTypes: m.outputTypes as string[],
        supportedMarkets: m.supportedMarkets as string[],
        supportedStrategies: m.supportedStrategies as string[],
      }));
    } catch (err: any) {
      const errMsg = err?.message || String(err);
      if (!isDatabaseConnected() || errMsg.includes("ECONNREFUSED") || errMsg.includes("connection") || errMsg.includes("timeout") || errMsg.includes("pool")) {
        throw new AIModelsException("DATABASE_UNAVAILABLE", "Database is currently unavailable.");
      }
      if (errMsg.includes("relation") && errMsg.includes("does not exist")) {
        throw new AIModelsException("AI_MODELS_NOT_INITIALIZED", "AI models table is missing or not initialized.");
      }
      console.error(err); throw new AIModelsException("DATABASE_UNAVAILABLE", "Database query failed cleanly: " + errMsg);
    }
  }

  async findById(id: number): Promise<AIModel | null> {
    try {
      const db = getDb();
      const result = await db.select().from(aiModels).where(eq(aiModels.id, id)).limit(1);
      if (!result[0]) return null;
      return {
        ...result[0],
        createdAt: result[0].createdAt.toISOString(),
        updatedAt: result[0].updatedAt.toISOString(),
        capabilities: result[0].capabilities as string[],
        inputTypes: result[0].inputTypes as string[],
        outputTypes: result[0].outputTypes as string[],
        supportedMarkets: result[0].supportedMarkets as string[],
        supportedStrategies: result[0].supportedStrategies as string[],
      };
    } catch (err: any) {
      const errMsg = err?.message || String(err);
      if (!isDatabaseConnected() || errMsg.includes("ECONNREFUSED") || errMsg.includes("connection") || errMsg.includes("timeout") || errMsg.includes("pool")) {
        throw new AIModelsException("DATABASE_UNAVAILABLE", "Database is currently unavailable.");
      }
      if (errMsg.includes("relation") && errMsg.includes("does not exist")) {
        throw new AIModelsException("AI_MODELS_NOT_INITIALIZED", "AI models table is missing or not initialized.");
      }
      console.error(err); throw new AIModelsException("DATABASE_UNAVAILABLE", "Database query failed cleanly: " + errMsg);
    }
  }

  async findByName(internalName: string): Promise<AIModel | null> {
    try {
      const db = getDb();
      const result = await db.select().from(aiModels).where(eq(aiModels.internalName, internalName)).limit(1);
      if (!result[0]) return null;
      return {
        ...result[0],
        createdAt: result[0].createdAt.toISOString(),
        updatedAt: result[0].updatedAt.toISOString(),
        capabilities: result[0].capabilities as string[],
        inputTypes: result[0].inputTypes as string[],
        outputTypes: result[0].outputTypes as string[],
        supportedMarkets: result[0].supportedMarkets as string[],
        supportedStrategies: result[0].supportedStrategies as string[],
      };
    } catch (err: any) {
      const errMsg = err?.message || String(err);
      if (!isDatabaseConnected() || errMsg.includes("ECONNREFUSED") || errMsg.includes("connection") || errMsg.includes("timeout") || errMsg.includes("pool")) {
        throw new AIModelsException("DATABASE_UNAVAILABLE", "Database is currently unavailable.");
      }
      if (errMsg.includes("relation") && errMsg.includes("does not exist")) {
        throw new AIModelsException("AI_MODELS_NOT_INITIALIZED", "AI models table is missing or not initialized.");
      }
      console.error(err); throw new AIModelsException("DATABASE_UNAVAILABLE", "Database query failed cleanly: " + errMsg);
    }
  }

  async create(data: any): Promise<AIModel> {
    try {
      const db = getDb();
      const result = await db.insert(aiModels).values(data).returning();
      return {
        ...result[0],
        createdAt: result[0].createdAt.toISOString(),
        updatedAt: result[0].updatedAt.toISOString(),
        capabilities: result[0].capabilities as string[],
        inputTypes: result[0].inputTypes as string[],
        outputTypes: result[0].outputTypes as string[],
        supportedMarkets: result[0].supportedMarkets as string[],
        supportedStrategies: result[0].supportedStrategies as string[],
      };
    } catch (err: any) {
      const errMsg = err?.message || String(err);
      if (!isDatabaseConnected() || errMsg.includes("ECONNREFUSED") || errMsg.includes("connection") || errMsg.includes("timeout") || errMsg.includes("pool")) {
        throw new AIModelsException("DATABASE_UNAVAILABLE", "Database is currently unavailable.");
      }
      if (errMsg.includes("relation") && errMsg.includes("does not exist")) {
        throw new AIModelsException("AI_MODELS_NOT_INITIALIZED", "AI models table is missing or not initialized.");
      }
      console.error(err); throw new AIModelsException("DATABASE_UNAVAILABLE", "Database query failed cleanly: " + errMsg);
    }
  }
}

export class AIUsageRepository {
  async create(data: any): Promise<AIUsage> {
    const db = getDb();
    const result = await db.insert(aiUsage).values(data).returning();
    return {
      ...result[0],
      timestamp: result[0].timestamp.toISOString(),
    };
  }

  async getOrgUsage(organizationId: string): Promise<any> {
    const db = getDb();
    return await db.select({
      totalPromptTokens: sql<number>`sum(${aiUsage.promptTokens})`,
      totalCompletionTokens: sql<number>`sum(${aiUsage.completionTokens})`,
      totalTokens: sql<number>`sum(${aiUsage.totalTokens})`,
    })
    .from(aiUsage)
    .where(eq(aiUsage.organizationId, organizationId));
  }
}

export class AICostRepository {
  async findAll(organizationId: string): Promise<AICost[]> {
    const db = getDb();
    const result = await db.select().from(aiCost).where(eq(aiCost.organizationId, organizationId));
    return result.map(c => ({
      ...c,
      periodStart: c.periodStart.toISOString(),
      periodEnd: c.periodEnd.toISOString(),
    }));
  }
}

export class AIHealthRepository {
  async updateStatus(providerId: number, status: ProviderStatus, latencyMs?: number): Promise<void> {
    const db = getDb();
    const existing = await db.select().from(aiProviderHealth).where(eq(aiProviderHealth.providerId, providerId)).limit(1);
    if (existing.length > 0) {
      await db.update(aiProviderHealth)
        .set({ status, latencyMs, lastCheck: new Date() })
        .where(eq(aiProviderHealth.providerId, providerId));
    } else {
      await db.insert(aiProviderHealth)
        .values({ providerId, status, latencyMs, lastCheck: new Date() });
    }
  }

  async findAll(): Promise<AIProviderHealth[]> {
    const db = getDb();
    const result = await db.select().from(aiProviderHealth);
    return result.map(h => ({
      ...h,
      status: h.status as ProviderStatus,
      lastCheck: h.lastCheck.toISOString(),
    }));
  }
}

export class AIRequestLogRepository {
  async create(data: any): Promise<AIRequestLog> {
    const db = getDb();
    const result = await db.insert(aiRequestLogs).values(data).returning();
    return {
      ...result[0],
      status: result[0].status as any,
      createdAt: result[0].createdAt.toISOString(),
    };
  }
}
