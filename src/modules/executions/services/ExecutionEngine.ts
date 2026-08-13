import { executionRepository } from "../repositories/ExecutionRepository.ts";
import { executionValidator } from "./ExecutionValidator.ts";
import { executionStateMachine } from "./ExecutionStateMachine.ts";
import { executionPriceResolver } from "./ExecutionPriceResolver.ts";
import { orderEngine } from "../../orders/services/OrderEngine.ts";
import { orderRepository } from "../../orders/repositories/OrderRepository.ts";
import { auditEngine } from "../../audit/services/AuditEngine.ts";
import { eventService } from "../../notifications/services/EventService.ts";
import { RunExecutionPayload, IExecution, ExecutionStatus } from "../types/index.ts";
import { randomUUID } from "crypto";

export class ExecutionEngine {
  public async executeOrder(actorId: number, payload: RunExecutionPayload): Promise<IExecution> {
    const { orderId, organizationId } = payload;
    
    // 1. Fetch Order
    const order = await orderRepository.getOrderById(orderId, organizationId);
    if (!order) {
      throw new Error(`Order not found: ${orderId}`);
    }

    // 2. Validate Rules
    executionValidator.validateOrderForExecution(order);

    // 3. Create Execution Record (PENDING)
    const executionId = `exec_${randomUUID().replace(/-/g, '').substring(0, 12)}`;
    let execution = await executionRepository.createExecution({
      id: executionId,
      orderId: order.id,
      organizationId,
      symbol: order.symbol,
      side: order.side as any,
      executionType: order.orderType,
      quantity: order.quantity,
      price: order.price || "0",
      status: 'PENDING'
    });

    await executionRepository.addHistory({ executionId, status: 'PENDING', notes: 'Execution requested' });

    const startTime = Date.now();
    try {
      // 4. Transition to MATCHING
      execution = await this.transitionExecution(execution.id, 'MATCHING', 'Initiating matching process');
      
      // 5. Price Resolution
      const resolvedPrice = await executionPriceResolver.resolvePrice(order.symbol, order.orderType, order.price);
      
      // We will simulate a full fill for this enterprise engine
      const filledQuantity = order.quantity; // Assuming 100% fill for now
      
      // 6. Transition to FILLED
      execution = await this.transitionExecution(execution.id, 'FILLED', 'Order filled completely', resolvedPrice, filledQuantity);
      
      // 7. Update Order Status
      if (order.status === 'VALIDATED') {
        await orderEngine.transitionStatus(actorId, order.id, organizationId, 'QUEUED');
      }
      await orderEngine.transitionStatus(actorId, order.id, organizationId, 'FILLED');
      
      // 8. Update Metrics
      const latency = Date.now() - startTime;
      const volume = parseFloat(filledQuantity) * parseFloat(resolvedPrice);
      await executionRepository.updateMetrics(organizationId, new Date().toISOString().split('T')[0], {
        totalExecutions: 1,
        totalVolume: volume.toString(),
        avgLatencyMs: latency,
        fillRate: "1.0"
      });

      // 8.5 Update Portfolio & Positions
      const { portfolioService } = await import("../../portfolios/services/PortfolioService.ts");
      await portfolioService.handleExecution({
        organizationId,
        portfolioId: order.workspaceId || "default_portfolio", // Use workspaceId as portfolioId for now, since it wasn't on order earlier
        symbol: order.symbol,
        assetClass: "NSE_STOCKS", // default for test
        side: order.side as 'BUY' | 'SELL',
        quantity: filledQuantity,
        price: resolvedPrice,
        executionId: execution.id
      });

      // 9. Emit Event
      await eventService.publishEvent({
        organizationId,
        type: "EXECUTION_COMPLETED",
        category: "AUDIT", // or one of the valid ones
        data: {
          executionId: execution.id,
          orderId: order.id,
          status: execution.status,
          price: resolvedPrice,
          quantity: filledQuantity
        }
      });

      // 10. Audit
      await auditEngine.logEvent({
        actorId,
        organizationId,
        action: "EXECUTION_COMPLETED",
        sourceModule: "EXECUTION_ENGINE",
        resourceType: "EXECUTION",
        resourceId: execution.id,
        details: { orderId: order.id, status: execution.status, price: resolvedPrice }
      });

      return execution;
    } catch (error: any) {
      // Handle Failure/Rejection
      const failedStatus: ExecutionStatus = error.message.includes('rejected') ? 'REJECTED' : 'FAILED';
      execution = await this.transitionExecution(execution.id, failedStatus, error.message);
      
      // Attempt to reject the order, but be mindful it might be in a state that doesn't allow it, although REJECTED is allowed from VALIDATED and QUEUED.
      try {
        await orderEngine.transitionStatus(actorId, order.id, organizationId, 'REJECTED');
      } catch (e) {
        // ignore if already terminal
      }
      
      await executionRepository.updateMetrics(organizationId, new Date().toISOString().split('T')[0], {
        totalExecutions: 1,
        rejectRate: "1.0"
      });

      await eventService.publishEvent({
        organizationId,
        type: "EXECUTION_FAILED",
        category: "AUDIT",
        data: {
          executionId: execution.id,
          orderId: order.id,
          status: execution.status,
          reason: error.message
        }
      });
      
      await auditEngine.logEvent({
        actorId,
        organizationId,
        action: "EXECUTION_FAILED",
        sourceModule: "EXECUTION_ENGINE",
        resourceType: "EXECUTION",
        resourceId: execution.id,
        details: { orderId: order.id, status: execution.status, error: error.message }
      });
      
      throw error;
    }
  }

  private async transitionExecution(id: string, newStatus: ExecutionStatus, reason?: string, price?: string, quantity?: string): Promise<IExecution> {
    // In a fuller implementation we'd fetch current status from DB, but we keep it simple here
    // For now we assume valid transition flow logic is enforced by caller
    const exec = await executionRepository.updateExecutionStatus(id, newStatus, reason, price, quantity);
    await executionRepository.addHistory({ executionId: id, status: newStatus, notes: reason });
    return exec;
  }
}

export const executionEngine = new ExecutionEngine();
