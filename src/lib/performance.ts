import logger from "../lib/logger.ts";

/**
 * Utility for tracking execution time of critical operations.
 * Implements Stage 12.6 performance metrics requirements.
 */
export class PerformanceTracker {
  private startTime: number;
  private label: string;
  private context: Record<string, any>;

  constructor(label: string, context: Record<string, any> = {}) {
    this.startTime = Date.now();
    this.label = label;
    this.context = context;
  }

  /**
   * Ends the tracking and logs the result.
   * Returns the duration in milliseconds.
   */
  finish(): number {
    const duration = Date.now() - this.startTime;
    
    logger.info({
      type: "PERFORMANCE_METRIC",
      label: this.label,
      durationMs: duration,
      ...this.context
    }, `Performance: ${this.label} took ${duration}ms`);

    return duration;
  }

  /**
   * Utility to track a function execution.
   */
  static async track<T>(label: string, fn: () => Promise<T>, context: Record<string, any> = {}): Promise<T> {
    const tracker = new PerformanceTracker(label, context);
    try {
      const result = await fn();
      tracker.finish();
      return result;
    } catch (error) {
      const duration = tracker.finish();
      logger.error({
        type: "PERFORMANCE_FAILURE",
        label,
        durationMs: duration,
        ...context,
        error
      }, `Performance Failure: ${label} failed after ${duration}ms`);
      throw error;
    }
  }
}
