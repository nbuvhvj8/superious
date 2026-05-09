import { getClock } from '../clock';
import type { JobPubSub } from '../pubsub';
import type { JobQueue } from '../queue';
import type { JobRepository } from '../repo';
import type { ScreenshotStorage } from '../storage';
import type { Source } from '../types';
import { assertSafeUrl, SsrfError } from './ssrf-guard';
import type { ScreenshotJobPayload, Screenshotter } from './types';

export const SCREENSHOT_QUEUE = 'screenshot';

interface WorkerDeps {
  queue: JobQueue;
  repo: JobRepository;
  pubsub: JobPubSub;
  storage: ScreenshotStorage;
  screenshotter: Screenshotter;
  /** Optional override of the SSRF guard for tests. */
  safetyCheck?: (url: string) => Promise<void>;
}

/**
 * Registers the screenshot worker against the given queue.
 *
 * Each captured screenshot ends with:
 *   - Bytes uploaded to storage at `screenshots/{jobId}/{sourceId}.png`.
 *   - The `sources` row updated with `screenshot_path`, `screenshot_url`,
 *     `captured_at`, and `status='done'`.
 *   - A `source` event published on the pubsub channel so the SSE client
 *     and the dispatcher's fanout listener both see the completion.
 *
 * Failure paths mark the source `failed`, log the reason, and still
 * publish a `source` event so the dispatcher can drop the entry from its
 * pending set and unblock the script writer.
 */
export function registerScreenshotWorker(deps: WorkerDeps): void {
  const safety =
    deps.safetyCheck ??
    (async (url: string) => {
      await assertSafeUrl(url);
    });

  deps.queue.registerWorker<ScreenshotJobPayload>(SCREENSHOT_QUEUE, async (payload) => {
    let updated: Source;
    try {
      await safety(payload.url);
      const result = await deps.screenshotter.capture(payload.url);
      const path = `screenshots/${payload.jobId}/${payload.sourceId}.png`;
      const uploaded = await deps.storage.upload(path, result.bytes, {
        contentType: result.contentType,
      });
      updated = await deps.repo.updateSource(payload.sourceId, {
        screenshotPath: uploaded.path,
        screenshotUrl: uploaded.signedUrl,
        capturedAt: getClock().isoNow(),
        status: 'done',
        title: result.title,
      });
    } catch (err) {
      const message =
        err instanceof SsrfError
          ? `ssrf:${err.reason}: ${err.message}`
          : err instanceof Error
            ? err.message
            : String(err);
      updated = await deps.repo.updateSource(payload.sourceId, {
        status: 'failed',
        error: message,
      });
    }
    await deps.pubsub.publish(payload.jobId, { type: 'source', source: updated });
  });
}
