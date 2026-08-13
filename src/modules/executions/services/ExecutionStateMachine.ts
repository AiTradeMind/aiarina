import { ExecutionStatus } from "../types/index.ts";

export class ExecutionStateMachine {
  private allowedTransitions: Record<ExecutionStatus, ExecutionStatus[]> = {
    'PENDING': ['MATCHING', 'REJECTED', 'EXPIRED', 'FAILED'],
    'MATCHING': ['PARTIALLY_FILLED', 'FILLED', 'REJECTED', 'EXPIRED', 'FAILED'],
    'PARTIALLY_FILLED': ['FILLED', 'REJECTED', 'EXPIRED', 'FAILED'], // E.g., remainder rejected or expired
    'FILLED': [],
    'REJECTED': [],
    'EXPIRED': [],
    'FAILED': []
  };

  public canTransition(current: ExecutionStatus, next: ExecutionStatus): boolean {
    return this.allowedTransitions[current]?.includes(next) ?? false;
  }

  public validateTransition(current: ExecutionStatus, next: ExecutionStatus): void {
    if (!this.canTransition(current, next)) {
      throw new Error(`Invalid execution status transition from ${current} to ${next}`);
    }
  }
}

export const executionStateMachine = new ExecutionStateMachine();
