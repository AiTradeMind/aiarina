import { getDb } from "../../../db/client.ts";
import { enterpriseTradingPipeline, enterprisePipelineEvents, enterpriseOrchestratorJobs } from "../../../db/schema.ts";
import { eq, sql } from "drizzle-orm";
import { ITradingPipeline, IPipelineEvent, IOrchestratorJob } from "../types/index.ts";

export class OrchestratorRepository {
  public async createPipeline(data: Partial<ITradingPipeline>): Promise<ITradingPipeline> {
    const db = getDb();
    const result = await db.insert(enterpriseTradingPipeline).values({
      id: data.id!,
      organizationId: data.organizationId!,
      orderId: data.orderId!,
      status: data.status || 'RUNNING',
      currentStage: data.currentStage!
    }).returning();
    return result[0] as ITradingPipeline;
  }

  public async updatePipeline(id: string, updates: Partial<ITradingPipeline>): Promise<void> {
    const db = getDb();
    await db.update(enterpriseTradingPipeline).set({ ...updates, updatedAt: sql`CURRENT_TIMESTAMP` }).where(eq(enterpriseTradingPipeline.id, id));
  }

  public async logEvent(event: Omit<IPipelineEvent, 'id' | 'timestamp'>): Promise<void> {
    const db = getDb();
    await db.insert(enterprisePipelineEvents).values(event as any);
  }

  public async getJob(id: string): Promise<IOrchestratorJob | null> {
     const db = getDb();
     const result = await db.select().from(enterpriseOrchestratorJobs).where(eq(enterpriseOrchestratorJobs.id, id)).limit(1);
     return (result[0] as IOrchestratorJob) || null;
  }

  public async ensureTables(): Promise<void> {
    const db = getDb();
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS enterprise_trading_pipeline (
        id VARCHAR(50) PRIMARY KEY,
        organization_id VARCHAR(50) NOT NULL,
        order_id VARCHAR(50) NOT NULL,
        status VARCHAR(20) NOT NULL,
        current_stage VARCHAR(50) NOT NULL,
        error TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
      )
    `);
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS enterprise_pipeline_events (
        id SERIAL PRIMARY KEY,
        pipeline_id VARCHAR(50) NOT NULL REFERENCES enterprise_trading_pipeline(id) ON DELETE CASCADE,
        stage VARCHAR(50) NOT NULL,
        status VARCHAR(20) NOT NULL,
        latency_ms INTEGER DEFAULT 0,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
      )
    `);
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS enterprise_orchestrator_jobs (
        id VARCHAR(50) PRIMARY KEY,
        organization_id VARCHAR(50) NOT NULL,
        type VARCHAR(20) NOT NULL,
        status VARCHAR(20) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        completed_at TIMESTAMP
      )
    `);
  }
}

export const orchestratorRepository = new OrchestratorRepository();
