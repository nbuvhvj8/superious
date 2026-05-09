import { afterEach, describe, expect, it } from 'vitest';
import { fakeClock, resetClock, setClock } from '@/server/clock';
import { MemoryRateLimiter } from '@/server/rate-limit';

describe('MemoryRateLimiter', () => {
  afterEach(() => resetClock());

  it('allows up to limit requests in a window', async () => {
    const limiter = new MemoryRateLimiter(3, 1_000);
    const a = await limiter.take('user-1');
    const b = await limiter.take('user-1');
    const c = await limiter.take('user-1');
    expect([a.allowed, b.allowed, c.allowed]).toEqual([true, true, true]);
  });

  it('rejects the (limit+1)-th request inside the window', async () => {
    const limiter = new MemoryRateLimiter(2, 1_000);
    await limiter.take('u');
    await limiter.take('u');
    const denied = await limiter.take('u');
    expect(denied.allowed).toBe(false);
    expect(denied.remaining).toBe(0);
    expect(denied.resetAt).toBeGreaterThan(0);
  });

  it('lets new requests through after the window slides', async () => {
    setClock(fakeClock(1_000_000, 0));
    const limiter = new MemoryRateLimiter(2, 1_000);
    await limiter.take('u');
    await limiter.take('u');
    expect((await limiter.take('u')).allowed).toBe(false);
    setClock(fakeClock(1_000_000 + 2_000, 0));
    expect((await limiter.take('u')).allowed).toBe(true);
  });

  it('isolates buckets per key', async () => {
    const limiter = new MemoryRateLimiter(1, 1_000);
    await limiter.take('a');
    expect((await limiter.take('a')).allowed).toBe(false);
    expect((await limiter.take('b')).allowed).toBe(true);
  });

  it('rejects nonsense configuration', () => {
    expect(() => new MemoryRateLimiter(0, 100)).toThrow();
    expect(() => new MemoryRateLimiter(10, 0)).toThrow();
  });
});
