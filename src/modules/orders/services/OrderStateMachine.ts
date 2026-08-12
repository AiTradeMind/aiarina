import { EnterpriseOrderStatus } from "../types/index.ts";

export class OrderStateMachine {
  private allowedTransitions: Record<EnterpriseOrderStatus, EnterpriseOrderStatus[]> = {
    'CREATED': ['VALIDATED', 'REJECTED', 'CANCELLED'],
    'VALIDATED': ['QUEUED', 'REJECTED', 'CANCELLED'],
    'QUEUED': ['PARTIALLY_FILLED', 'FILLED', 'REJECTED', 'CANCELLED', 'EXPIRED'],
    'PARTIALLY_FILLED': ['FILLED', 'CANCELLED', 'REJECTED', 'EXPIRED'],
    'FILLED': [], // terminal state
    'CANCELLED': [], // terminal state
    'REJECTED': [], // terminal state
    'EXPIRED': [] // terminal state
  };

  public canTransition(currentStatus: EnterpriseOrderStatus, newStatus: EnterpriseOrderStatus): boolean {
    const allowed = this.allowedTransitions[currentStatus];
    return allowed ? allowed.includes(newStatus) : false;
  }

  public validateTransition(currentStatus: EnterpriseOrderStatus, newStatus: EnterpriseOrderStatus): void {
    if (!this.canTransition(currentStatus, newStatus)) {
      throw new Error(`State Transition Error: Cannot transition order from ${currentStatus} to ${newStatus}`);
    }
  }
}

export const orderStateMachine = new OrderStateMachine();
