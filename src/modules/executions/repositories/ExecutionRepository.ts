import { getDb } from "../../../db/client.ts";
import { enterpriseExecutions, enterpriseExecutionHistory, enterpriseExecutionMetrics } from "../../../db/schema.ts";
import { eq, and, sql } from "drizzle-orm";
import { IExecution, IExecutionHistory, IExecutionMetrics, ExecutionStatus } from "../types/index.ts";

export class ExecutionRepository {
  public async createExecution(data: Partial<IExecution>): Promise<IExecution> {
    const db = getDb();
    const result = await db.insert(enterpriseExecutions).values({
      id: data.id!,
      orderId: data.orderId!,
      organizationId: data.organizationId!,
      symbol: data.symbol!,
      side: data.side!,
      executionType: data.executionType!,
      quantity: data.quantity!,
      price: data.price!,
      status: data.status!,
      reason: data.reason || null
    }).returning();
    return result[0] as IExecution;
  }

  public async updateExecutionStatus(id: string, status: ExecutionStatus, reason?: string, price?: string, quantity?: string): Promise<IExecution> {
    const db = getDb();
    const updateData: any = { status, updatedAt: new Date() };
    if (reason) updateData.reason = reason;
    if (price) updateData.price = price;
    if (quantity) updateData.quantity = quantity;

    const result = await db.update(enterpriseExecutions)
      .set(updateData)
      .where(eq(enterpriseExecutions.id, id))
      .returning();
    return result[0] as IExecution;
  }

  public async getExecutionById(id: string, organizationId: string): Promise<IExecution | null> {
    const db = getDb();
    const result = await db.select()
      .from(enterpriseExecutions)
      .where(and(eq(enterpriseExecutions.id, id), eq(enterpriseExecutions.organizationId, organizationId)))
      .limit(1);
    return (result[0] as IExecution) || null;
  }

  public async getExecutions(organizationId: string): Promise<IExecution[]> {
    const db = getDb();
    const result = await db.select()
      .from(enterpriseExecutions)
      .where(eq(enterpriseExecutions.organizationId, organizationId))
      .orderBy(enterpriseExecutions.createdAt);
    return result as IExecution[];
  }

  public async addHistory(data: { executionId: string, status: ExecutionStatus, notes?: string }): Promise<void> {
    const db = getDb();
    await db.insert(enterpriseExecutionHistory).values({
      executionId: data.executionId,
      status: data.status,
      notes: data.notes || null
    });
  }

  public async getHistory(executionId: string): Promise<IExecutionHistory[]> {
    const db = getDb();
    const result = await db.select()
      .from(enterpriseExecutionHistory)
      .where(eq(enterpriseExecutionHistory.executionId, executionId))
      .orderBy(enterpriseExecutionHistory.timestamp);
    return result as IExecutionHistory[];
  }

  public async updateMetrics(organizationId: string, date: string, updates: Partial<IExecutionMetrics>): Promise<void> {
    const db = getDb();
    // In a real scenario we'd do an upsert or raw SQL to handle increments. 
    // Here we'll do a simple select, then insert/update.
    const existing = await db.select().from(enterpriseExecutionMetrics)
      .where(and(eq(enterpriseExecutionMetrics.organizationId, organizationId), eq(enterpriseExecutionMetrics.date, date)))
      .limit(1);

    if (existing.length === 0) {
      await db.insert(enterpriseExecutionMetrics).values({
        organizationId,
        date,
        totalExecutions: updates.totalExecutions || 1,
        totalVolume: updates.totalVolume || "0",
        fillRate: updates.fillRate || "0",
        rejectRate: updates.rejectRate || "0",
        avgLatencyMs: updates.avgLatencyMs || 0
      });
    } else {
      const prev = existing[0];
      await db.update(enterpriseExecutionMetrics)
        .set({
          totalExecutions: (prev.totalExecutions as number) + (updates.totalExecutions || 0),
          totalVolume: (parseFloat(prev.totalVolume as string) + parseFloat(updates.totalVolume || "0")).toString(),
          updatedAt: new Date()
        })
        .where(eq(enterpriseExecutionMetrics.id, prev.id));
    }
  }

  public async ensureExecutionTables(): Promise<void> {
    const db = getDb();
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS enterprise_executions (
        id VARCHAR(50) PRIMARY KEY,
        order_id VARCHAR(50) NOT NULL,
        organization_id VARCHAR(50) NOT NULL,
        symbol VARCHAR(50) NOT NULL,
        side VARCHAR(10) NOT NULL,
        execution_type VARCHAR(20) NOT NULL,
        quantity NUMERIC NOT NULL,
        price NUMERIC NOT NULL,
        status VARCHAR(20) NOT NULL,
        reason TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
      )
    `);

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS enterprise_execution_history (
        id SERIAL PRIMARY KEY,
        execution_id VARCHAR(50) NOT NULL,
        status VARCHAR(20) NOT NULL,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        notes TEXT
      )
    `);

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS enterprise_execution_metrics (
        id SERIAL PRIMARY KEY,
        organization_id VARCHAR(50) NOT NULL,
        date DATE NOT NULL,
        total_executions INTEGER DEFAULT 0 NOT NULL,
        total_volume NUMERIC DEFAULT 0 NOT NULL,
        fill_rate NUMERIC DEFAULT 0 NOT NULL,
        reject_rate NUMERIC DEFAULT 0 NOT NULL,
        avg_latency_ms INTEGER DEFAULT 0 NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        UNIQUE (organization_id, date)
      )
    `);
  }
}

export const executionRepository = new ExecutionRepository();
