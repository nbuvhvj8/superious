import { randomBytes, randomUUID } from 'crypto';

/**
 * UUID v4 generator with a predictable fallback.
 *
 * Node's `randomUUID` is available everywhere we run, but we expose it
 * through this helper so tests can stub it out via `setIdGenerator` to
 * make assertions deterministic.
 */
let generator: () => string = () => randomUUID();

export function newId(): string {
  return generator();
}

export function setIdGenerator(fn: () => string): void {
  generator = fn;
}

export function resetIdGenerator(): void {
  generator = () => randomUUID();
}

/**
 * Short opaque token used for SSE channel names and idempotency keys.
 * 16 bytes of entropy → 32 hex chars, plenty for one-shot tokens.
 */
export function newToken(): string {
  return randomBytes(16).toString('hex');
}
