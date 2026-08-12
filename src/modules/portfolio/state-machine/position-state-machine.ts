import { PositionStatus } from "../types/index.ts";

export class PositionStateMachine {
  private static readonly ALLOWED_TRANSITIONS: Record<PositionStatus, PositionStatus[]> = {
    OPEN: ["INCREASED", "REDUCED", "PARTIALLY_CLOSED", "CLOSED", "ARCHIVED"],
    INCREASED: ["INCREASED", "REDUCED", "PARTIALLY_CLOSED", "CLOSED", "ARCHIVED"],
    REDUCED: ["INCREASED", "REDUCED", "PARTIALLY_CLOSED", "CLOSED", "ARCHIVED"],
    PARTIALLY_CLOSED: ["INCREASED", "REDUCED", "PARTIALLY_CLOSED", "CLOSED", "ARCHIVED"],
    CLOSED: ["ARCHIVED"],
    ARCHIVED: [],
  };

  /**
   * Check if transition from currentStatus to targetStatus is valid
   */
  static canTransition(currentStatus: PositionStatus, targetStatus: PositionStatus): boolean {
    if (currentStatus === targetStatus) {
      return true;
    }
    const allowed = this.ALLOWED_TRANSITIONS[currentStatus];
    return allowed ? allowed.includes(targetStatus) : false;
  }

  /**
   * Asserts valid state transition or throws error
   */
  static assertTransition(currentStatus: PositionStatus, targetStatus: PositionStatus): void {
    if (!this.canTransition(currentStatus, targetStatus)) {
      throw new Error(
        `Illegal State Transition: Cannot transition position state from '${currentStatus}' to '${targetStatus}'.`
      );
    }
  }
}
