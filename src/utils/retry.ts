import { createChildLogger } from '../logger.js';
import { AppError } from './errors.js';

const log = createChildLogger('retry');

export interface RetryOptions {
  maxRetries: number;
  baseDelayMs: number;
  maxDelayMs: number;
  jitter: boolean;
}

const DEFAULT_OPTIONS: RetryOptions = {
  maxRetries: 3,
  baseDelayMs: 200,
  maxDelayMs: 8000,
  jitter: true,
};

function isRetryable(err: unknown): boolean {
  if (err instanceof AppError) {
    return err.statusCode === 429 || err.statusCode >= 500;
  }
  return true;
}

export async function withRetry<T>(
  fn: () => Promise<T>,
  options: Partial<RetryOptions> = {},
): Promise<T> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  let lastError: Error | undefined;

  for (let attempt = 0; attempt <= opts.maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));

      if (attempt === opts.maxRetries || !isRetryable(err)) break;

      const delay = calculateDelay(attempt, opts);
      log.warn({ attempt: attempt + 1, delay, error: lastError.message }, 'Retrying after failure');
      await sleep(delay);
    }
  }

  throw lastError;
}

function calculateDelay(attempt: number, opts: RetryOptions): number {
  const exponential = opts.baseDelayMs * Math.pow(2, attempt);
  const capped = Math.min(exponential, opts.maxDelayMs);
  if (!opts.jitter) return capped;
  return capped + Math.random() * opts.baseDelayMs;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
