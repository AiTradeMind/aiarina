import { getDb } from '../../../db/client.ts';
import { 
  ep14ExecutionRuntime,
  ep14ExecutionFill,
  ep14ExecutionLatency,
  ep14ExecutionSlippage,
  ep14ExecutionEvents,
  ep14ExecutionCertificate,
  ep14ExecutionAudit
} from '../../../db/schema.ts';
import { eq, desc } from 'drizzle-orm';
import crypto from 'crypto';
import { PaperExecutionRequest, PaperExecutionResult } from '../types/index.ts';

export class PaperExecutionService {
  async getExecutions() {
    const db = getDb();
    return await db.select().from(ep14ExecutionRuntime).orderBy(desc(ep14ExecutionRuntime.createdAt)).limit(100);
  }

  async getExecution(id: number) {
    const db = getDb();
    const record = await db.select().from(ep14ExecutionRuntime).where(eq(ep14ExecutionRuntime.id, id)).limit(1);
    return record[0] || null;
  }

  async getFills(executionId?: number) {
    const db = getDb();
    let query = db.select().from(ep14ExecutionFill);
    if (executionId) {
        query = query.where(eq(ep14ExecutionFill.executionId, executionId)) as any;
    }
    return await query.orderBy(desc(ep14ExecutionFill.filledAt)).limit(100);
  }

  async getRuntime() {
    const db = getDb();
    return {
      status: 'OPERATIONAL',
      exchangeSimulation: 'ACTIVE',
      latencyEngine: 'ENABLED',
      slippageEngine: 'ENABLED',
      queuedExecutions: 0
    };
  }

  async getAudit(executionId?: number) {
    const db = getDb();
    let query = db.select().from(ep14ExecutionAudit);
    if (executionId) {
        query = query.where(eq(ep14ExecutionAudit.executionId, executionId)) as any;
    }
    return await query.orderBy(desc(ep14ExecutionAudit.auditTime)).limit(100);
  }

  async simulateExecution(req: PaperExecutionRequest): Promise<PaperExecutionResult> {
    const db = getDb();
    const correlationId = req.correlationId || crypto.randomUUID();

    // 1. Create runtime entry
    const insertedRuntime = await db.insert(ep14ExecutionRuntime).values({
      orderId: req.orderId,
      correlationId: correlationId,
      status: 'FILLED',
      executedAt: new Date()
    }).returning({ id: ep14ExecutionRuntime.id });

    const execId = insertedRuntime[0].id;

    // 2. Simulate Fill
    const fillPrice = req.price || (Math.random() * 1000 + 100);
    await db.insert(ep14ExecutionFill).values({
      executionId: execId,
      fillType: 'FULL_FILL',
      filledQuantity: req.quantity.toString(),
      averageFillPrice: fillPrice.toString(),
      remainingQuantity: "0",
    });

    // 3. Simulate Latency
    await db.insert(ep14ExecutionLatency).values({
      executionId: execId,
      exchangeLatencyMs: Math.floor(Math.random() * 50),
      networkDelayMs: Math.floor(Math.random() * 20),
      executionDelayMs: Math.floor(Math.random() * 10),
      queueDelayMs: 0
    });

    // 4. Simulate Slippage
    await db.insert(ep14ExecutionSlippage).values({
      executionId: execId,
      expectedPrice: (req.price || fillPrice).toString(),
      actualPrice: fillPrice.toString(),
      slippageType: 'ZERO',
      slippageAmount: "0"
    });

    // 5. Generate Certificate
    const hashData = JSON.stringify({ req, execId, fillPrice });
    const hash = crypto.createHash('sha256').update(hashData).digest('hex');
    const signature = 'EXEC_' + crypto.randomUUID();

    await db.insert(ep14ExecutionCertificate).values({
      executionId: execId,
      sha256Certificate: hash,
      executionSignature: signature,
      executionProof: 'SIMULATED_EXCHANGE_PROOF',
      integrityHash: crypto.createHash('sha256').update(signature).digest('hex')
    });

    // 6. Audit
    await db.insert(ep14ExecutionAudit).values({
      executionId: execId,
      action: 'EXECUTE',
      details: 'Order simulated and filled completely'
    });

    return {
      success: true,
      executionId: execId,
      correlationId: correlationId,
      status: 'FILLED',
      filledQuantity: req.quantity,
      averageFillPrice: fillPrice,
      certificate: hash
    };
  }
}
