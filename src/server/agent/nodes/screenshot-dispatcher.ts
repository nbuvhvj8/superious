import type { JobPubSub } from '../../pubsub';
import type { JobQueue } from '../../queue';
import type { JobRepository } from '../../repo';
import type { ScreenshotJobPayload } from '../../screenshot/types';
import type { AgentState, Source } from '../../types';

export const SCREENSHOT_QUEUE = 'screenshot';

const FANOUT_TIMEOUT_MS = 30_000;

/**
 * `screenshot_dispatcher` agent node.
 *
 * For each source ranked in the previous step:
 *   1. Fires a job onto the `screenshot` queue (handled out-of-band).
 *   2. Subscribes to a per-source completion signal via pubsub.
 *
 * Waits up to 30 s for the entire fanout to settle (per the PRD); any
 * source still pending after the timeout is left as `pending` and the
 * pipeline moves on to script generation. Failure of an individual
 * screenshot does NOT block the script writer.
 */
export async function screenshotDispatcherNode(
  state: AgentState,
  queue: JobQueue,
  repo: JobRepository,
  pubsub: JobPubSub,
  opts: { timeoutMs?: number } = {}
): Promise<AgentState> {
  if (state.sources.length === 0) {
    return state;
  }

  const timeoutMs = opts.timeoutMs ?? FANOUT_TIMEOUT_MS;
  const pendingIds = new Set(state.sources.map((s) => s.id));

  const fanout = new Promise<void>((resolve) => {
    if (pendingIds.size === 0) {
      resolve();
      return;
    }
    const unsubscribe = pubsub.subscribe(state.jobId, (event) => {
      if (event.type === 'source') {
        if (event.source.status === 'done' || event.source.status === 'failed') {
          pendingIds.delete(event.source.id);
          if (pendingIds.size === 0) {
            unsubscribe();
            resolve();
          }
        }
      }
    });
  });

  for (const source of state.sources) {
    const payload: ScreenshotJobPayload = {
      jobId: state.jobId,
      sourceId: source.id,
      url: source.url,
    };
    await queue.enqueue<ScreenshotJobPayload>(SCREENSHOT_QUEUE, payload, { attempts: 2 });
  }

  await Promise.race([fanout, sleep(timeoutMs)]);

  // Re-load sources from the repo so the script writer sees the latest
  // status / screenshot URLs (or `pending` if a worker hasn't replied yet).
  const refreshed: Source[] = await repo.listSources(state.jobId);
  return {
    ...state,
    sources: refreshed,
  };
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
