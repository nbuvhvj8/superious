import type { JobEvent } from '../types';
import type { JobPubSub, Unsubscribe } from './pubsub';

/**
 * In-process pubsub backed by `Set<listener>` per channel.
 *
 * Also keeps a small per-job event buffer so a slow client connecting after
 * the agent has already emitted a couple of events can replay history and
 * not miss the start of the stream.
 */
const HISTORY_LIMIT = 64;

export class MemoryJobPubSub implements JobPubSub {
  private readonly listeners = new Map<string, Set<(event: JobEvent) => void>>();
  private readonly buffer = new Map<string, JobEvent[]>();

  async publish(jobId: string, event: JobEvent): Promise<void> {
    const buf = this.buffer.get(jobId) ?? [];
    buf.push(event);
    if (buf.length > HISTORY_LIMIT) buf.shift();
    this.buffer.set(jobId, buf);

    const listeners = this.listeners.get(jobId);
    if (!listeners) return;
    for (const fn of [...listeners]) {
      try {
        fn(event);
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error(`[pubsub] listener for ${jobId} threw`, err);
      }
    }
  }

  subscribe(jobId: string, listener: (event: JobEvent) => void): Unsubscribe {
    const set = this.listeners.get(jobId) ?? new Set();
    set.add(listener);
    this.listeners.set(jobId, set);
    return () => {
      set.delete(listener);
      if (set.size === 0) this.listeners.delete(jobId);
    };
  }

  history(jobId: string): JobEvent[] {
    return [...(this.buffer.get(jobId) ?? [])];
  }
}
