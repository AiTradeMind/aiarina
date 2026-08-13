import { getDb } from "../../db/client";
import { orders, paperOrders, brainTasks, systemEvents } from "../../db/schema";
import { eq, and, lt, or } from "drizzle-orm";
import logger from "../../lib/logger";

/**
 * Service responsible for reconciling system state after a restart or crash.
 * Implements Stage 12.7 Disaster Recovery and Business Continuity.
 */
export class RecoveryService {
  /**
   * Main entry point for system reconciliation.
   */
  async reconcile() {
    logger.info({ type: "RECOVERY_START" }, "Initiating system state reconciliation...");
    const startTime = Date.now();

    try {
      await Promise.all([
        this.reconcileOrders(),
        this.reconcilePaperOrders(),
        this.reconcileBrainTasks()
      ]);

      const duration = Date.now() - startTime;
      logger.info({ type: "RECOVERY_COMPLETE", durationMs: duration }, `System state reconciled in ${duration}ms`);
    } catch (error: any) {
      logger.error({ type: "RECOVERY_FAILURE", error: error.message }, "Critical failure during system reconciliation");
    }
  }

  /**
   * Finds orders stuck in transient states (EXECUTING, QUEUED) and resets them.
   * Business Continuity: Prevents orders from being "lost" in the UI.
   */
  private async reconcileOrders() {
    const db = getDb();
    const staleThreshold = new Date(Date.now() - 15 * 60 * 1000); // 15 minutes

    // For real orders, we mark them as FAILED if they were stuck in EXECUTING/QUEUED
    // This allows the user to see the failure and retry manually.
    const result = await db.update(orders)
      .set({ 
        status: "FAILED", 
        updatedAt: new Date() 
      })
      .where(
        and(
          or(eq(orders.status, "EXECUTING"), eq(orders.status, "QUEUED")),
          lt(orders.updatedAt, staleThreshold)
        )
      );

    logger.info({ type: "ORDER_RECONCILIATION", updatedCount: (result as any).rowCount || 0 }, "Reconciled real orders");
  }

  /**
   * Reconciles paper trading orders.
   */
  private async reconcilePaperOrders() {
    const db = getDb();
    const staleThreshold = new Date(Date.now() - 10 * 60 * 1000); // 10 minutes

    const result = await db.update(paperOrders)
      .set({ 
        status: "CANCELLED", 
        updatedAt: new Date() 
      })
      .where(
        and(
          eq(paperOrders.status, "CREATED"), // Assuming CREATED is the transient state for paper orders
          lt(paperOrders.updatedAt, staleThreshold)
        )
      );

    logger.info({ type: "PAPER_ORDER_RECONCILIATION", updatedCount: (result as any).rowCount || 0 }, "Reconciled paper orders");
  }

  /**
   * Reconciles AI Brain tasks.
   */
  private async reconcileBrainTasks() {
    const db = getDb();
    // Use string timestamps as defined in schema for brain_tasks
    // This is a bit tricky with LT if they are just strings, but we'll assume standard ISO strings.
    
    const result = await db.update(brainTasks)
      .set({ 
        status: "FAILED",
        updatedAt: new Date().toISOString()
      })
      .where(
        or(eq(brainTasks.status, "PENDING"), eq(brainTasks.status, "ANALYZING"))
      );

    logger.info({ type: "BRAIN_TASK_RECONCILIATION", updatedCount: (result as any).rowCount || 0 }, "Reconciled brain tasks");
  }

  /**
   * Logs a graceful shutdown event.
   */
  async logShutdown() {
    try {
      const db = getDb();
      await db.insert(systemEvents).values({
        level: "INFO",
        component: "SYSTEM",
        message: "Application server is shutting down gracefully.",
        timestamp: new Date()
      });
      logger.info({ type: "SYSTEM_SHUTDOWN" }, "Graceful shutdown logged");
    } catch (e) {
      // Silent fail on shutdown logging if DB is already gone
    }
  }
}

export const recoveryService = new RecoveryService();
