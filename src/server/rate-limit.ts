import { getClock } from './clock';

/**
 * Sliding-window rate limiter.
 *
 * Used to enforce the PRD's "10 jobs per user per hour" rule and any
 * other per-key throttles. Backed by an in-memory map; in production this
 * can be replaced with a Redis ZSET impl that exposes the same `take()`
 * surface.
 */
export interface RateLimiter {
  take(key: string): Promise<RateLimitResult>;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
}

export class MemoryRateLimiter implements RateLimiter {
  private readonly windows = new Map<string, number[]>();

  constructor(
    private readonly limit: number,
    private readonly windowMs: number
  ) {
    if (limit <= 0) throw new Error('limit must be > 0');
    if (windowMs <= 0) throw new Error('windowMs must be > 0');
  }

  async take(key: string): Promise<RateLimitResult> {
    const now = getClock().now();
    const cutoff = now - this.windowMs;
    const existing = this.windows.get(key) ?? [];
    const fresh = existing.filter((ts) => ts > cutoff);
    if (fresh.length >= this.limit) {
      const earliest = fresh[0];
      this.windows.set(key, fresh);
      return {
        allowed: false,
        remaining: 0,
        resetAt: earliest + this.windowMs,
      };
    }
    fresh.push(now);
    this.windows.set(key, fresh);
    return {
      allowed: true,
      remaining: this.limit - fresh.length,
      resetAt: now + this.windowMs,
    };
  }

  /** Test helper — wipe state. */
  reset(): void {
    this.windows.clear();
  }
}
