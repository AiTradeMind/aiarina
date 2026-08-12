import { OrderLifecycleState, OrderLifecycleEvent } from "../types/lifecycle.ts";
import { PaperOrderRepository } from "../repositories/index.ts";
import { EventBusService } from "../../events/services/index.ts";
import logger from "../../../lib/logger";

export class TradeLifecycleManager {
  private static instance: TradeLifecycleManager;
  private orderRepo = new PaperOrderRepository();
  private eventBus = EventBusService.getInstance();

  // Immutable history log in memory (can be queryable per order)
  private immutableHistory: OrderLifecycleEvent[] = [];

  private allowedTransitions: Record<OrderLifecycleState, OrderLifecycleState[]> = {
    'CREATED': ['VALIDATED', 'REJECTED'],
    'VALIDATED': ['RISK_APPROVED', 'REJECTED'],
    'RISK_APPROVED': ['QUEUED', 'REJECTED'],
    'QUEUED': ['SUBMITTED', 'CANCELLED', 'REJECTED'],
    'SUBMITTED': ['ACCEPTED', 'CANCELLED', 'REJECTED'],
    'ACCEPTED': ['PARTIALLY_FILLED', 'FILLED', 'CANCELLED', 'REJECTED'],
    'PARTIALLY_FILLED': ['FILLED', 'CANCELLED', 'REJECTED'],
    'FILLED': ['CLOSED'],
    'CLOSED': ['ARCHIVED'],
    'CANCELLED': ['ARCHIVED'],
    'REJECTED': ['ARCHIVED'],
    'ARCHIVED': []
  };

  public static getInstance(): TradeLifecycleManager {
    if (!TradeLifecycleManager.instance) {
      TradeLifecycleManager.instance = new TradeLifecycleManager();
    }
    return TradeLifecycleManager.instance;
  }

  /**
   * Transitions an order securely from its current state to the target state.
   * Validates state transitions via state machine constraints.
   */
  async transitionTo(
    orderId: number,
    organizationId: string,
    toState: OrderLifecycleState,
    triggerType: OrderLifecycleEvent['triggerType'],
    reason: string,
    operatorId = "SYSTEM"
  ): Promise<void> {
    const order = await this.orderRepo.findById(orderId, organizationId);
    if (!order) {
      throw new Error(`Order #${orderId} not found for lifecycle transition.`);
    }

    const fromState = order.status as OrderLifecycleState;

    if (fromState === toState) {
      return; // Idempotent check
    }

    // Validate transition
    const allowed = this.allowedTransitions[fromState] || [];
    // Allow force override for terminations like CANCELLED or REJECTED from active states
    const isSpecialTermination = ['CANCELLED', 'REJECTED'].includes(toState) && 
      !['FILLED', 'CLOSED', 'ARCHIVED'].includes(fromState);

    if (!allowed.includes(toState) && !isSpecialTermination) {
      throw new Error(`Invalid state transition: ${fromState} -> ${toState} for Order #${orderId}`);
    }

    // Update order status in repository. Wait, our OrderStatus standard in trading module has EXECUTED, FAILED, etc.
    // We'll map the enterprise Lifecycle states to the core DB order status representation seamlessly:
    // FILLED -> 'EXECUTED', REJECTED -> 'REJECTED', CANCELLED -> 'CANCELLED', FAILED -> 'FAILED'.
    // Others map directly or keep as strings.
    let repoStatus: any = toState;
    if (toState === 'FILLED') {
      repoStatus = 'EXECUTED';
    }

    await this.orderRepo.updateStatus(orderId, repoStatus);

    // Record immutable history
    const event: OrderLifecycleEvent = {
      id: `evt-${crypto.randomUUID().substring(0, 8)}`,
      orderId,
      fromState,
      toState,
      timestamp: new Date().toISOString(),
      triggerType,
      reason,
      operatorId
    };

    this.immutableHistory.push(event);
    logger.info(`[Lifecycle] Order #${orderId} transitioned: ${fromState} -> ${toState} (${reason})`);

    // Publish event
    await this.eventBus.publish({
      eventType: "ORDER_LIFECYCLE_TRANSITIONED",
      source: "LIFECYCLE_MANAGER",
      organizationId: order.organizationId,
      userId: order.userId,
      entityId: orderId.toString(),
      payload: { orderId, fromState, toState, event },
      audit: {
        action: `ORDER_STATE_${toState}`,
        status: 'SUCCESS',
        details: `Order #${orderId} transitioned to ${toState}. Reason: ${reason}`
      }
    });
  }

  getLifecycleHistory(orderId: number): OrderLifecycleEvent[] {
    return this.immutableHistory.filter(h => h.orderId === orderId);
  }

  getAllHistory(): OrderLifecycleEvent[] {
    return this.immutableHistory;
  }
}
export const tradeLifecycleManager = TradeLifecycleManager.getInstance();
