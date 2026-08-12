import logger from '../../lib/logger';

export enum CircuitState {
  CLOSED = 'CLOSED',
  OPEN = 'OPEN',
  HALF_OPEN = 'HALF_OPEN'
}

export interface CircuitBreakerOptions {
  failureThreshold?: number;    // Number of failures before tripping (default 5)
  successThreshold?: number;    // Number of successes in half-open before closing (default 2)
  recoveryTimeoutMs?: number;   // Time in OPEN state before trying HALF_OPEN (default 10000)
  name?: string;
}

export class CircuitBreaker {
  private state: CircuitState = CircuitState.CLOSED;
  private failureCount = 0;
  private successCount = 0;
  private nextAttemptTime = 0;
  private readonly failureThreshold: number;
  private readonly successThreshold: number;
  private readonly recoveryTimeoutMs: number;
  public readonly name: string;

  constructor(options: CircuitBreakerOptions = {}) {
    this.failureThreshold = options.failureThreshold ?? 5;
    this.successThreshold = options.successThreshold ?? 2;
    this.recoveryTimeoutMs = options.recoveryTimeoutMs ?? 10000;
    this.name = options.name ?? 'default-circuit-breaker';
  }

  public getState(): CircuitState {
    if (this.state === CircuitState.OPEN && Date.now() >= this.nextAttemptTime) {
      this.state = CircuitState.HALF_OPEN;
      this.successCount = 0;
      logger.info({ name: this.name }, 'Circuit breaker entering HALF_OPEN state');
    }
    return this.state;
  }

  public async execute<T>(action: () => Promise<T>, fallback?: () => Promise<T>): Promise<T> {
    const currentState = this.getState();

    if (currentState === CircuitState.OPEN) {
      logger.warn({ name: this.name }, 'Circuit breaker is OPEN. Execution blocked.');
      if (fallback) {
        return fallback();
      }
      throw new Error(`Circuit breaker '${this.name}' is OPEN. Execution short-circuited.`);
    }

    try {
      const result = await action();
      this.onSuccess();
      return result;
    } catch (error: any) {
      this.onFailure(error);
      if (fallback) {
        return fallback();
      }
      throw error;
    }
  }

  private onSuccess(): void {
    if (this.state === CircuitState.HALF_OPEN) {
      this.successCount++;
      if (this.successCount >= this.successThreshold) {
        this.state = CircuitState.CLOSED;
        this.failureCount = 0;
        this.successCount = 0;
        logger.info({ name: this.name }, 'Circuit breaker recovered and reset to CLOSED state');
      }
    } else if (this.state === CircuitState.CLOSED) {
      this.failureCount = 0;
    }
  }

  private onFailure(error: any): void {
    this.failureCount++;
    logger.warn({ name: this.name, failureCount: this.failureCount, error: error?.message }, 'Circuit breaker recorded failure');

    if (this.state === CircuitState.HALF_OPEN || this.failureCount >= this.failureThreshold) {
      this.state = CircuitState.OPEN;
      this.nextAttemptTime = Date.now() + this.recoveryTimeoutMs;
      logger.error(
        { name: this.name, recoveryTimeoutMs: this.recoveryTimeoutMs },
        'Circuit breaker tripped to OPEN state'
      );
    }
  }

  public getMetrics() {
    return {
      name: this.name,
      state: this.getState(),
      failureCount: this.failureCount,
      successCount: this.successCount,
      nextAttemptTime: this.nextAttemptTime > Date.now() ? this.nextAttemptTime - Date.now() : 0
    };
  }
}
