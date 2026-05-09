import { afterEach, describe, expect, it } from 'vitest';
import { fakeClock, getClock, resetClock, setClock } from '@/server/clock';
import { newId, newToken, resetIdGenerator, setIdGenerator } from '@/server/ids';

describe('clock', () => {
  afterEach(() => resetClock());

  it('returns the real clock by default', () => {
    const before = Date.now();
    const t = getClock().now();
    const after = Date.now();
    expect(t).toBeGreaterThanOrEqual(before);
    expect(t).toBeLessThanOrEqual(after);
  });

  it('honours setClock for ISO output', () => {
    setClock(fakeClock(0, 0));
    expect(getClock().isoNow()).toBe('1970-01-01T00:00:00.000Z');
  });

  it('advances by the configured tick on each call', () => {
    setClock(fakeClock(1_000, 100));
    expect(getClock().now()).toBe(1_000);
    expect(getClock().now()).toBe(1_100);
    expect(getClock().now()).toBe(1_200);
  });
});

describe('ids', () => {
  afterEach(() => resetIdGenerator());

  it('generates unique uuids by default', () => {
    const a = newId();
    const b = newId();
    expect(a).not.toBe(b);
    expect(a).toMatch(/^[0-9a-f]{8}-/);
  });

  it('respects setIdGenerator', () => {
    let i = 0;
    setIdGenerator(() => `id-${i++}`);
    expect(newId()).toBe('id-0');
    expect(newId()).toBe('id-1');
  });

  it('newToken returns a 32-char hex string', () => {
    const t = newToken();
    expect(t).toMatch(/^[0-9a-f]{32}$/);
  });
});
