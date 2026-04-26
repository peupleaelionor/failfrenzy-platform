/**
 * FAIL FRENZY - Resilience Utilities
 * Retry with exponential backoff and circuit breaker pattern.
 * Use these wrappers around DB calls and external API requests to
 * improve tolerance to transient failures (database blips, network hiccups).
 */

// ─── Retry ────────────────────────────────────────────────────────────────────

export interface RetryOptions {
  /** Maximum number of attempts (default: 3). */
  maxAttempts: number;
  /** Initial delay between attempts in ms (default: 100). */
  delayMs: number;
  /** Backoff multiplier applied after each failure (default: 2). */
  backoff: number;
  /** Optional predicate: only retry when this returns true (default: always). */
  retryIf?: (err: unknown) => boolean;
}

/**
 * Execute `fn` with automatic retry on failure.
 *
 * @example
 *   const result = await withRetry(() => db.select()..., { maxAttempts: 3 });
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: Partial<RetryOptions> = {}
): Promise<T> {
  const { maxAttempts = 3, delayMs = 100, backoff = 2, retryIf } = options;
  let lastError: unknown;
  let delay = delayMs;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      if (retryIf && !retryIf(err)) break;
      if (attempt < maxAttempts) {
        await new Promise<void>((r) => setTimeout(r, delay));
        delay *= backoff;
      }
    }
  }

  throw lastError;
}

// ─── Circuit Breaker ──────────────────────────────────────────────────────────

export type CircuitState = "closed" | "open" | "half-open";

export interface CircuitBreakerOptions {
  /** Number of consecutive failures before opening the circuit (default: 5). */
  failureThreshold: number;
  /** Milliseconds the circuit stays open before attempting a probe (default: 10 000). */
  recoveryTimeMs: number;
}

/**
 * Simple circuit breaker.
 * - **closed**: requests pass through normally.
 * - **open**: requests are rejected immediately (fail fast).
 * - **half-open**: one probe request is allowed; success closes, failure re-opens.
 *
 * @example
 *   const cb = new CircuitBreaker({ failureThreshold: 3, recoveryTimeMs: 5000 });
 *   const data = await cb.call(() => fetchFromDB());
 */
export class CircuitBreaker {
  private state: CircuitState = "closed";
  private failures = 0;
  private lastFailureTime = 0;
  private readonly opts: Required<CircuitBreakerOptions>;

  constructor(options: Partial<CircuitBreakerOptions> = {}) {
    this.opts = {
      failureThreshold: options.failureThreshold ?? 5,
      recoveryTimeMs: options.recoveryTimeMs ?? 10_000,
    };
  }

  get currentState(): CircuitState {
    return this.state;
  }

  async call<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === "open") {
      const elapsed = Date.now() - this.lastFailureTime;
      if (elapsed >= this.opts.recoveryTimeMs) {
        this.state = "half-open";
      } else {
        throw new Error(`Circuit breaker is OPEN (retry in ${Math.ceil((this.opts.recoveryTimeMs - elapsed) / 1000)}s)`);
      }
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (err) {
      this.onFailure();
      throw err;
    }
  }

  private onSuccess(): void {
    this.failures = 0;
    this.state = "closed";
  }

  private onFailure(): void {
    this.failures++;
    this.lastFailureTime = Date.now();
    if (this.failures >= this.opts.failureThreshold) {
      this.state = "open";
    }
  }

  reset(): void {
    this.state = "closed";
    this.failures = 0;
    this.lastFailureTime = 0;
  }
}

// ─── Pre-configured instance for the database ─────────────────────────────────

/** Shared circuit breaker for the PostgreSQL database. */
export const dbCircuitBreaker = new CircuitBreaker({
  failureThreshold: 5,
  recoveryTimeMs: 15_000,
});
