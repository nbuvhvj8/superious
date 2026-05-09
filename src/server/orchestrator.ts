import { emptyAgentState, runAgentGraph } from './agent';
import type { Backend } from './bootstrap';

export const RESEARCH_QUEUE = 'research';

/**
 * Glue between the API layer and the agent graph.
 *
 * The HTTP handler creates a job row + enqueues a `research` job here.
 * The worker hydrates the job, runs the graph, and updates status to
 * `done` or `failed` along the way.
 */
export interface ResearchJobPayload {
  jobId: string;
  userId: string;
  prompt: string;
}

export function registerResearchWorker(backend: Backend): void {
  backend.queue.registerWorker<ResearchJobPayload>(RESEARCH_QUEUE, async (payload) => {
    try {
      const initial = emptyAgentState({
        jobId: payload.jobId,
        userId: payload.userId,
        prompt: payload.prompt,
      });
      await runAgentGraph(initial, {
        llm: backend.llm,
        search: backend.search,
        repo: backend.repo,
        queue: backend.queue,
        pubsub: backend.pubsub,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      try {
        await backend.repo.updateJobStatus(payload.jobId, 'failed', message);
      } catch (repoErr) {
        // eslint-disable-next-line no-console
        console.error('[orchestrator] failed to mark job failed', repoErr);
      }
      await backend.pubsub.publish(payload.jobId, {
        type: 'error',
        message,
        recoverable: false,
      });
      await backend.pubsub.publish(payload.jobId, { type: 'done' });
    }
  });
}

export async function startResearchJob(
  backend: Backend,
  payload: ResearchJobPayload
): Promise<void> {
  await backend.queue.enqueue<ResearchJobPayload>(RESEARCH_QUEUE, payload);
}
