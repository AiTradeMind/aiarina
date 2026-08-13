import { OrderStatus } from "../constants/index.ts";

export class OrderStateMachine {
  private static readonly ALLOWED_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
    CREATED: ['VALIDATED', 'REJECTED', 'CANCELLED'],
    VALIDATED: ['QUEUED', 'REJECTED', 'CANCELLED'],
    QUEUED: ['READY', 'REJECTED', 'CANCELLED'],
    READY: ['SUBMITTED', 'REJECTED', 'CANCELLED', 'EXPIRED'],
    SUBMITTED: ['PARTIALLY_FILLED', 'FILLED', 'REJECTED', 'CANCELLED', 'EXPIRED'],
    PARTIALLY_FILLED: ['FILLED', 'PARTIALLY_FILLED', 'CANCELLED', 'REJECTED', 'EXPIRED'],
    FILLED: ['ARCHIVED'],
    CANCELLED: ['ARCHIVED'],
    REJECTED: ['ARCHIVED'],
    EXPIRED: ['ARCHIVED'],
    ARCHIVED: [],
  };

  /**
   * Checks whether a state transition from `currentStatus` to `targetStatus` is legal.
   */
  static canTransition(currentStatus: OrderStatus, targetStatus: OrderStatus): boolean {
    if (currentStatus === targetStatus) {
      // Allow self-transition for PARTIALLY_FILLED if multiple partial fills occur
      return currentStatus === 'PARTIALLY_FILLED';
    }
    const allowed = this.ALLOWED_TRANSITIONS[currentStatus];
    if (!allowed) return false;
    return allowed.includes(targetStatus);
  }

  /**
   * Asserts state transition legality. Throws Error if illegal.
   */
  static assertTransition(currentStatus: OrderStatus, targetStatus: OrderStatus): void {
    if (!this.canTransition(currentStatus, targetStatus)) {
      throw new Error(
        `Illegal State Transition: Cannot transition order state from '${currentStatus}' to '${targetStatus}'.`
      );
    }
  }

  /**
   * Returns list of allowed next states from current state.
   */
  static getNextLegalStates(currentStatus: OrderStatus): OrderStatus[] {
    return this.ALLOWED_TRANSITIONS[currentStatus] || [];
  }

  /**
   * Checks if state is terminal (i.e. ARCHIVED or ready to archive).
   */
  static isTerminal(status: OrderStatus): boolean {
    return status === 'ARCHIVED';
  }
}
