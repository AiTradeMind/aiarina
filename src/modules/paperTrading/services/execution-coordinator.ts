import { ExecutionQueueItem, ExecutionAuditLog, OrderLifecycleState } from "../types/lifecycle.ts";
import { 
  PaperAccountRepository, 
  PaperOrderRepository, 
  PaperPositionRepository, 
  PaperTradeRepository, 
  PaperJournalRepository 
} from "../repositories/index.ts";
import { tradeLifecycleManager } from "./lifecycle-manager.ts";
import { tradingSessionKernel } from "./session-kernel.ts";
import { EventBusService } from "../../events/services/index.ts";
import logger from "../../../lib/logger";
import { getDeterministicRandom } from "../../../lib/utils.ts";

export class ExecutionCoordinator {
  private static instance: ExecutionCoordinator;
  private accountRepo = new PaperAccountRepository();
  private orderRepo = new PaperOrderRepository();
  private positionRepo = new PaperPositionRepository();
  private tradeRepo = new PaperTradeRepository();
  private journalRepo = new PaperJournalRepository();
  private eventBus = EventBusService.getInstance();

  private queue: ExecutionQueueItem[] = [];
  private processedIds = new Set<string>(); // For strict idempotency check
  private auditLogs: ExecutionAuditLog[] = [];
  private isProcessing = false;

  public static getInstance(): ExecutionCoordinator {
    if (!ExecutionCoordinator.instance) {
      ExecutionCoordinator.instance = new ExecutionCoordinator();
    }
    return ExecutionCoordinator.instance;
  }

  constructor() {
    // Start processing queue items
    setInterval(() => this.processQueue(), 2000);
    // Start timeout monitor
    setInterval(() => this.monitorTimeouts(), 5000);
  }

  /**
   * Pushes a new order into the Execution Queue.
   * Leverages strict idempotency checks using an idempotencyKey.
   */
  async enqueue(orderId: number, organizationId: string, userId: number): Promise<void> {
    const order = await this.orderRepo.findById(orderId, organizationId);
    if (!order) throw new Error(`Order #${orderId} not found.`);

    // Idempotency check: Ensure the order is not queued twice
    const queueId = `q-item-${orderId}`;
    if (this.processedIds.has(queueId)) {
      logger.warn(`[ExecutionCoordinator] Blocked duplicate execution queue request for Order #${orderId}`);
      return;
    }

    this.processedIds.add(queueId);

    const queueItem: ExecutionQueueItem = {
      id: queueId,
      orderId,
      organizationId,
      userId,
      ticker: order.ticker,
      side: order.side,
      quantity: order.quantity,
      price: order.price,
      type: order.type,
      retryCount: 0,
      maxRetries: 3,
      queuedAt: new Date().toISOString()
    };

    this.queue.push(queueItem);
    await tradeLifecycleManager.transitionTo(orderId, organizationId, 'QUEUED', 'SYSTEM', 'Order placed in Execution Queue.');

    this.logAudit(orderId, organizationId, queueId, 'QUEUED', 'SUCCESS', `Order #${orderId} successfully enqueued.`);
  }

  /**
   * Processes the Execution Queue items one-by-one or in parallel.
   */
  private async processQueue() {
    if (this.isProcessing || this.queue.length === 0) return;
    this.isProcessing = true;

    try {
      const item = this.queue.shift();
      if (!item) return;

      await this.dispatchOrder(item);
    } catch (err: any) {
      logger.error(`[ExecutionCoordinator] Error during queue processing: ${err.message}`);
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Dispatches and simulates real trade execution through the state machine.
   */
  private async dispatchOrder(item: ExecutionQueueItem) {
    const { orderId, organizationId, userId, ticker, side, quantity, price, type } = item;
    item.lastAttemptAt = new Date().toISOString();

    logger.info(`[ExecutionCoordinator] Dispatching Order #${orderId} - Attempt ${item.retryCount + 1}`);

    try {
      // 1. Submit Order to virtual execution venue
      await tradeLifecycleManager.transitionTo(orderId, organizationId, 'SUBMITTED', 'SYSTEM', 'Submitting order to exchange matching book.');
      
      // Simulating minor latency
      await new Promise(resolve => setTimeout(resolve, 300));
      await tradeLifecycleManager.transitionTo(orderId, organizationId, 'ACCEPTED', 'SYSTEM', 'Order accepted on matching engine ledger.');

      // 2. Check Session Status: Is Market closed?
      const sessionClock = tradingSessionKernel.getClockState();
      if (sessionClock.marketStatus === 'CLOSED') {
        throw new Error('Exchange is currently CLOSED. Order rejected by matching engine.');
      }

      // 3. Simulated Fill calculation
      const account = await this.accountRepo.findByOrganizationId(organizationId);
      if (!account) throw new Error(`Virtual Account not found for organization: ${organizationId}`);

      // Generate fill price near ticker's last price or use order limit price
      const basePrice = price ? parseFloat(price) : 150.00;
      const slippageMultiplier = 1 + (getDeterministicRandom(orderId.toString(), 30) * 0.0006 - 0.0003); // +/- 0.03% slippage
      const executionPrice = basePrice * slippageMultiplier;
      const totalValue = parseFloat(quantity) * executionPrice;

      if (side === 'BUY') {
        const currentBal = parseFloat(account.balance);
        if (currentBal < totalValue) {
          throw new Error(`Insufficient funds: Required $${totalValue.toFixed(2)}, Available $${currentBal.toFixed(2)}`);
        }

        // Debit cash
        await this.accountRepo.updateBalance(organizationId, (currentBal - totalValue).toFixed(2));

        // Credit holding position
        const existingPos = await this.positionRepo.findByTicker(organizationId, ticker);
        const newQty = parseFloat(existingPos?.quantity || "0") + parseFloat(quantity);
        const newAvg = ((parseFloat(existingPos?.averagePrice || "0") * parseFloat(existingPos?.quantity || "0")) + totalValue) / newQty;

        await this.positionRepo.upsert({
          organizationId,
          ticker,
          quantity: newQty.toFixed(4),
          averagePrice: newAvg.toFixed(2),
        });
      } else {
        // Sell side validation
        const existingPos = await this.positionRepo.findByTicker(organizationId, ticker);
        if (!existingPos || parseFloat(existingPos.quantity) < parseFloat(quantity)) {
          throw new Error(`Insufficient holdings: Attempting to SELL ${quantity} ${ticker}, but only hold ${existingPos?.quantity || 0}`);
        }

        // Credit Cash
        const currentBal = parseFloat(account.balance);
        await this.accountRepo.updateBalance(organizationId, (currentBal + totalValue).toFixed(2));

        // Debit holding position
        const remainingQty = parseFloat(existingPos.quantity) - parseFloat(quantity);
        if (remainingQty <= 0) {
          await this.positionRepo.delete(existingPos.id);
        } else {
          await this.positionRepo.upsert({
            organizationId,
            ticker,
            quantity: remainingQty.toFixed(4),
            averagePrice: existingPos.averagePrice,
          });
        }
      }

      // 4. Record Trade Log in Database
      const trade = await this.tradeRepo.create({
        orderId,
        organizationId,
        ticker,
        side,
        quantity,
        executionPrice: executionPrice.toFixed(2)
      });

      // 5. Record Journal Entry in Database
      const pnlValue = side === 'SELL' ? (totalValue - (parseFloat(quantity) * 150.00)).toFixed(2) : null;
      await this.journalRepo.create({
        organizationId,
        tradeId: trade.id,
        entryType: 'TRADE',
        notes: `Execution complete: ${side} ${quantity} ${ticker} @ $${executionPrice.toFixed(2)} via ExecutionCoordinator.`,
        pnl: pnlValue
      });

      // 6. Complete Order Lifecycle -> FILLED -> CLOSED
      await tradeLifecycleManager.transitionTo(orderId, organizationId, 'FILLED', 'SYSTEM', `Order filled @ $${executionPrice.toFixed(2)}`);
      await tradeLifecycleManager.transitionTo(orderId, organizationId, 'CLOSED', 'SYSTEM', 'Ledger balances synchronized and settled.');

      this.logAudit(orderId, organizationId, item.id, 'DISPATCH', 'SUCCESS', `Successfully executed ${side} ${quantity} ${ticker} @ $${executionPrice.toFixed(2)}`);

      // Publish Execution completed events
      await this.eventBus.publish({
        eventType: "EXECUTION_COMPLETED",
        source: "EXECUTION_COORDINATOR",
        organizationId,
        userId,
        entityId: trade.id.toString(),
        payload: { ticker, side, quantity, price: executionPrice, tradeId: trade.id }
      });

    } catch (err: any) {
      logger.error(`[ExecutionCoordinator] Dispatch failed for Order #${orderId}: ${err.message}`);
      
      // Retry logic
      if (item.retryCount < item.maxRetries) {
        item.retryCount++;
        item.error = err.message;
        this.queue.push(item); // Re-queue for retry
        this.logAudit(orderId, organizationId, item.id, 'RETRY', 'RETRYING', `Retry #${item.retryCount} due to: ${err.message}`);
        await this.eventBus.publish({
          eventType: "EXECUTION_RETRY",
          source: "EXECUTION_COORDINATOR",
          organizationId,
          userId,
          payload: { orderId, attempt: item.retryCount, reason: err.message }
        });
      } else {
        // Exceeded retries -> Mark REJECTED / FAILED
        await tradeLifecycleManager.transitionTo(orderId, organizationId, 'REJECTED', 'SYSTEM', `Execution failed: ${err.message}`);
        this.logAudit(orderId, organizationId, item.id, 'DISPATCH', 'FAILED', `Execution failed permanently after ${item.retryCount} retries. Reason: ${err.message}`);
      }
    }
  }

  /**
   * Monitor for hanging orders that might exceed timeout limits.
   */
  private async monitorTimeouts() {
    const cutoff = Date.now() - 30 * 1000; // 30 seconds timeout limit
    for (let i = this.queue.length - 1; i >= 0; i--) {
      const item = this.queue[i];
      const queuedTime = new Date(item.queuedAt).getTime();
      if (queuedTime < cutoff) {
        // Remove from queue
        this.queue.splice(i, 1);
        try {
          await tradeLifecycleManager.transitionTo(item.orderId, item.organizationId, 'REJECTED', 'SYSTEM', 'Execution timeout limit exceeded (30s).');
          this.logAudit(item.orderId, item.organizationId, item.id, 'TIMEOUT', 'TIMEOUT', 'Order timed out waiting in execution queue.');
        } catch (err: any) {
          logger.error(`[ExecutionCoordinator] Timeout update failed: ${err.message}`);
        }
      }
    }
  }

  private logAudit(
    orderId: number, 
    organizationId: string, 
    queueItemId: string, 
    action: string, 
    status: ExecutionAuditLog['status'], 
    details: string
  ) {
    const auditLog: ExecutionAuditLog = {
      id: `audit-${crypto.randomUUID().substring(0, 8)}`,
      queueItemId,
      orderId,
      organizationId,
      action,
      status,
      details,
      timestamp: new Date().toISOString()
    };
    this.auditLogs.push(auditLog);
  }

  public getQueue(): ExecutionQueueItem[] {
    return this.queue;
  }

  public getAuditTrail(organizationId: string): ExecutionAuditLog[] {
    return this.auditLogs.filter(log => log.organizationId === organizationId);
  }
}
export const executionCoordinator = ExecutionCoordinator.getInstance();
