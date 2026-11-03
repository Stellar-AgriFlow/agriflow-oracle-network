export interface RetryOptions {
  maxAttempts: number;
  initialDelayMs: number;
  maxDelayMs: number;
  backoffMultiplier: number;
}

export const DEFAULT_RETRY_OPTIONS: RetryOptions = {
  maxAttempts: 4,
  initialDelayMs: 500,
  maxDelayMs: 10_000,
  backoffMultiplier: 2.0,
};

/**
 * Executes an async task with exponential backoff and randomized jitter
 */
export async function withRetry<T>(
  task: (attempt: number) => Promise<T>,
  options: Partial<RetryOptions> = {}
): Promise<T> {
  const config = { ...DEFAULT_RETRY_OPTIONS, ...options };
  let currentDelay = config.initialDelayMs;
  let lastError: unknown;

  for (let attempt = 1; attempt <= config.maxAttempts; attempt++) {
    try {
      return await task(attempt);
    } catch (err) {
      lastError = err;
      if (attempt >= config.maxAttempts) {
        break;
      }

      // Add full jitter: random value between 0 and currentDelay
      const jitter = Math.random() * currentDelay;
      const sleepMs = Math.min(config.maxDelayMs, currentDelay + jitter);

      await new Promise((resolve) => setTimeout(resolve, sleepMs));
      currentDelay = Math.min(config.maxDelayMs, currentDelay * config.backoffMultiplier);
    }
  }

  throw lastError;
}
