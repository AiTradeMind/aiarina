import logger from "./logger.ts";

/**
 * Configuration for the retry mechanism.
 */
export interface RetryOptions {
  maxRetries: number;
  initialDelayMs: number;
  maxDelayMs: number;
  factor: number;
  retryableErrors?: (error: any) => boolean;
  context?: string;
}

const DEFAULT_RETRY_OPTIONS: RetryOptions = {
  maxRetries: 3,
  initialDelayMs: 1000,
  maxDelayMs: 10000,
  factor: 2,
  retryableErrors: (error: any) => {
    // Retry on network errors or 429/5xx status codes
    if (error.status === 429 || error.status >= 500) return true;
    if (error.message?.toLowerCase().includes("timeout") || error.message?.toLowerCase().includes("network")) return true;
    return false;
  }
};

/**
 * Executes a function with exponential backoff retry logic.
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: Partial<RetryOptions> = {}
): Promise<T> {
  const config = { ...DEFAULT_RETRY_OPTIONS, ...options };
  const context = config.context || "Operation";
  let lastError: any;
  let delay = config.initialDelayMs;

  for (let attempt = 1; attempt <= config.maxRetries + 1; attempt++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;
      
      const shouldRetry = attempt <= config.maxRetries && (config.retryableErrors ? config.retryableErrors(error) : true);
      
      if (!shouldRetry) {
        logger.error({
          type: "RETRY_FAILURE",
          context,
          attempt,
          error: error.message,
          willRetry: false
        }, `${context} failed after ${attempt} attempts`);
        throw error;
      }

      logger.warn({
        type: "RETRY_ATTEMPT",
        context,
        attempt,
        nextDelayMs: delay,
        error: error.message
      }, `${context} failed (attempt ${attempt}). Retrying in ${delay}ms...`);

      await new Promise(resolve => setTimeout(resolve, delay));
      delay = Math.min(delay * config.factor, config.maxDelayMs);
    }
  }

  throw lastError;
}
