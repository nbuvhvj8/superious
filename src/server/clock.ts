/**
 * Pluggable wall-clock used everywhere in the backend.
 *
 * Wrapping `Date.now()` in a single helper means that tests can freeze time
 * with `setClock`, while production uses the real clock with zero overhead.
 */

export interface Clock {
  now(): number;
  isoNow(): string;
}

const realClock: Clock = {
  now: () => Date.now(),
  isoNow: () => new Date().toISOString(),
};

let activeClock: Clock = realClock;

export function getClock(): Clock {
  return activeClock;
}

export function setClock(c: Clock): void {
  activeClock = c;
}

export function resetClock(): void {
  activeClock = realClock;
}

/**
 * Test helper — returns a clock that starts at `start` and advances by
 * `tick` ms on every call to `now()`. Wrap with `setClock(...)` in a
 * `beforeEach` block to make timestamps in your test output deterministic.
 */
export function fakeClock(start: number = 1_700_000_000_000, tick: number = 1000): Clock {
  let cursor = start;
  return {
    now() {
      const t = cursor;
      cursor += tick;
      return t;
    },
    isoNow() {
      return new Date(this.now()).toISOString();
    },
  };
}
