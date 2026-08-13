import { CircuitBreakerState } from "../types/index.ts";
import { CIRCUIT_BREAKER_STATUSES } from "../constants/index.ts";
import { RuntimeGovernanceRepository } from "../repositories/runtime-governance.repository.ts";
import logger from "../../../lib/logger.ts";

export class CircuitBreakerService {
  private static instance: CircuitBreakerService;
  private repository: RuntimeGovernanceRepository;

  private constructor() {
    this.repository = RuntimeGovernanceRepository.getInstance();
  }

  public static getInstance(): CircuitBreakerService {
    if (!CircuitBreakerService.instance) {
      CircuitBreakerService.instance = new CircuitBreakerService();
    }
    return CircuitBreakerService.instance;
  }

  public async checkCircuitBreaker(target: string = "GLOBAL"): Promise<{
    isOpen: boolean;
    state: CircuitBreakerState;
  }> {
    let state = await this.repository.getCircuitBreaker(target);

    if (!state) {
      state = {
        target,
        status: CIRCUIT_BREAKER_STATUSES.CLOSED,
        tripCount: 0,
        cooldownMs: 60000,
      };
    }

    if (state.status === CIRCUIT_BREAKER_STATUSES.OPEN) {
      const now = Date.now();
      const lastTripped = state.lastTrippedAt ? new Date(state.lastTrippedAt).getTime() : 0;
      if (now - lastTripped > state.cooldownMs) {
        state.status = CIRCUIT_BREAKER_STATUSES.HALF_OPEN;
        await this.repository.saveCircuitBreaker(state);

        logger.info(
          { target, cooldownMs: state.cooldownMs },
          "Circuit Breaker transitioned to HALF_OPEN after cooldown period"
        );
        return { isOpen: false, state };
      }

      return { isOpen: true, state };
    }

    return { isOpen: false, state };
  }

  public async tripCircuitBreaker(
    target: string = "GLOBAL",
    reason: string = "Volatile market anomaly or high execution error rate",
    cooldownMs: number = 60000
  ): Promise<CircuitBreakerState> {
    let state = await this.repository.getCircuitBreaker(target);
    const now = new Date();

    if (!state) {
      state = {
        target,
        status: CIRCUIT_BREAKER_STATUSES.OPEN,
        tripCount: 1,
        lastTrippedAt: now,
        cooldownMs,
        reason,
      };
    } else {
      state.status = CIRCUIT_BREAKER_STATUSES.OPEN;
      state.tripCount += 1;
      state.lastTrippedAt = now;
      state.cooldownMs = cooldownMs;
      state.reason = reason;
    }

    await this.repository.saveCircuitBreaker(state);

    logger.warn(
      {
        target,
        tripCount: state.tripCount,
        reason,
        cooldownMs,
      },
      "Circuit Breaker TRIPPED to OPEN status"
    );

    return state;
  }

  public async resetCircuitBreaker(
    target: string = "GLOBAL",
    resetBy: string = "OPERATOR"
  ): Promise<CircuitBreakerState> {
    let state = await this.repository.getCircuitBreaker(target);

    if (!state) {
      state = {
        target,
        status: CIRCUIT_BREAKER_STATUSES.CLOSED,
        tripCount: 0,
        cooldownMs: 60000,
      };
    } else {
      state.status = CIRCUIT_BREAKER_STATUSES.CLOSED;
      state.reason = `Manually reset by ${resetBy}`;
    }

    await this.repository.saveCircuitBreaker(state);

    logger.info({ target, resetBy }, "Circuit Breaker manually RESET to CLOSED");

    return state;
  }

  public async getAllBreakers(): Promise<CircuitBreakerState[]> {
    return this.repository.getAllCircuitBreakers();
  }
}
