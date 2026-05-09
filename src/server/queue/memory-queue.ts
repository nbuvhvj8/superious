import { newId } from '../ids';
import type { EnqueueOptions, JobQueue, WorkerHandler } from './queue';

interface PendingJob {
  id: string;
  queue: string;
  payload: unknown;
  attempts: number;
  remainingRetries: number;
}

/**
 * In-process queue implementation backed by an immediate `setImmediate`.
 *
 * The contract matches `JobQueue`. There is **no** durability — restarting
 * the process loses any in-flight jobs. That's fine for tests, the dev
 * server, and any deployment that doesn't need horizontal worker scaling.
 *
 * Tracks a set of in-flight promises so `drain()` can wait for the entire
 * pipeline to settle, including jobs that were enqueued by other jobs.
 */
export class MemoryJobQueue implements JobQueue {
  private readonly handlers = new Map<string, WorkerHandler<unknown>>();
  private readonly inFlight = new Set<Promise<void>>();
  private closed = false;

  async enqueue<T>(queue: string, payload: T, opts: EnqueueOptions = {}): Promise<string> {
    if (this.closed) {
      throw new Error('Queue is closed');
    }
    const job: PendingJob = {
      id: opts.id ?? newId(),
      queue,
      payload,
      attempts: 0,
      remainingRetries: opts.attempts ?? 0,
    };
    const promise = this.run(job).catch((err) => {
      // Last-ditch — surface to the console so test failures aren't silent.
      // eslint-disable-next-line no-console
      console.error(`[memory-queue] job ${job.id} on ${queue} failed:`, err);
    });
    this.inFlight.add(promise);
    promise.finally(() => this.inFlight.delete(promise));
    return job.id;
  }

  registerWorker<T>(queue: string, handler: WorkerHandler<T>): void {
    this.handlers.set(queue, handler as WorkerHandler<unknown>);
  }

  async drain(): Promise<void> {
    // Loop until no jobs are in flight AND none are added during awaiting.
    while (this.inFlight.size > 0) {
      await Promise.allSettled([...this.inFlight]);
    }
  }

  async close(): Promise<void> {
    this.closed = true;
    await this.drain();
    this.handlers.clear();
  }

  private async run(job: PendingJob): Promise<void> {
    // Yield control once so callers always see `enqueue` return before the
    // worker starts — matches the BullMQ semantics and avoids surprise
    // synchronous reentrancy when a worker enqueues another job.
    await new Promise<void>((resolve) => setImmediate(resolve));

    const handler = this.handlers.get(job.queue);
    if (!handler) {
      // Drop silently — a queue with no registered worker is a noop in dev.
      return;
    }
    try {
      job.attempts += 1;
      await handler(job.payload);
    } catch (err) {
      if (job.remainingRetries > 0) {
        job.remainingRetries -= 1;
        await new Promise((r) => setTimeout(r, 5));
        await this.run(job);
        return;
      }
      throw err;
    }
  }
}
