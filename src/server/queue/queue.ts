/**
 * Generic job queue contract.
 *
 * Two named queues are used by the backend:
 *   - `research`   — kicks off the LangGraph research pipeline.
 *   - `screenshot` — fans out one job per source URL.
 *
 * The contract is intentionally tiny: enqueue + register a worker. Anything
 * more advanced (priorities, delays, retries) is configured per-implementation.
 */

export type WorkerHandler<TPayload> = (payload: TPayload) => Promise<void>;

export interface JobQueue {
  enqueue<T>(queue: string, payload: T, opts?: EnqueueOptions): Promise<string>;
  registerWorker<T>(queue: string, handler: WorkerHandler<T>): void;
  /** Wait for all currently-enqueued jobs to settle. Used in tests + graceful shutdown. */
  drain(): Promise<void>;
  close(): Promise<void>;
}

export interface EnqueueOptions {
  /** Optional id used for de-duplication. */
  id?: string;
  /** Number of retries on failure. */
  attempts?: number;
}
