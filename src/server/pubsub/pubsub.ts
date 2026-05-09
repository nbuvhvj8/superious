import type { JobEvent } from '../types';

/**
 * Publish-subscribe contract used to fan job events out to SSE clients.
 *
 * Producer: the agent graph publishes `JobEvent`s as the pipeline runs.
 * Consumer: an SSE handler subscribes to a single `jobId` channel and
 * forwards every event to its connected client.
 */
export type Unsubscribe = () => void;

export interface JobPubSub {
  publish(jobId: string, event: JobEvent): Promise<void>;
  subscribe(jobId: string, listener: (event: JobEvent) => void): Unsubscribe;
  /** Replay any buffered events for `jobId` (used to catch up new subscribers). */
  history(jobId: string): JobEvent[];
}
