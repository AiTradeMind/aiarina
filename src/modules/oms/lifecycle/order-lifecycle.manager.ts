import { OMSRepository } from "../repositories/oms.repository.ts";
import { OrderStatus, OMSOrder } from "../types/index.ts";
import { OrderStateMachine } from "../state-machine/order-state-machine.ts";

export class OrderLifecycleManager {
  private repo: OMSRepository;

  constructor(repo?: OMSRepository) {
    this.repo = repo || new OMSRepository();
  }

  /**
   * Advances order lifecycle state to target status with validation and audit logging.
   */
  async transition(
    orderId: string,
    targetStatus: OrderStatus,
    reason?: string,
    additionalData?: Partial<OMSOrder>
  ): Promise<OMSOrder> {
    const order = await this.repo.getOrderById(orderId);
    if (!order) {
      throw new Error(`OrderLifecycleManager: Order '${orderId}' not found.`);
    }

    // State machine check
    OrderStateMachine.assertTransition(order.status, targetStatus);

    // Perform transition in repo
    const updated = await this.repo.updateOrderStatus(orderId, targetStatus, reason, additionalData);
    return updated;
  }

  /**
   * Cancel an active order.
   */
  async cancel(orderId: string, reason?: string): Promise<OMSOrder> {
    return await this.transition(orderId, "CANCELLED", reason || "Order cancelled by user or system request.");
  }

  /**
   * Expire an active order.
   */
  async expire(orderId: string, reason?: string): Promise<OMSOrder> {
    return await this.transition(orderId, "EXPIRED", reason || "Order expired due to Time-In-Force limit.");
  }

  /**
   * Reject an order.
   */
  async reject(orderId: string, reason: string): Promise<OMSOrder> {
    return await this.transition(orderId, "REJECTED", reason, { failureReason: reason });
  }

  /**
   * Mark order as READY for execution.
   */
  async markReady(orderId: string): Promise<OMSOrder> {
    return await this.transition(orderId, "READY", "Order validated and queued. Ready for execution.");
  }

  /**
   * Archive a terminal order.
   */
  async archive(orderId: string): Promise<OMSOrder> {
    return await this.transition(orderId, "ARCHIVED", "Order archived.");
  }
}
