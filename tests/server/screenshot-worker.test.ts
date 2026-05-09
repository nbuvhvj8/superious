import { describe, expect, it } from 'vitest';
import { MemoryJobPubSub } from '@/server/pubsub';
import { MemoryJobQueue } from '@/server/queue';
import { MemoryJobRepository } from '@/server/repo';
import {
  MockScreenshotter,
  registerScreenshotWorker,
  SCREENSHOT_QUEUE,
  type ScreenshotJobPayload,
} from '@/server/screenshot';
import { MemoryScreenshotStorage } from '@/server/storage';

const setup = async () => {
  const repo = new MemoryJobRepository();
  const queue = new MemoryJobQueue();
  const pubsub = new MemoryJobPubSub();
  const storage = new MemoryScreenshotStorage();
  const screenshotter = new MockScreenshotter();
  registerScreenshotWorker({ queue, repo, pubsub, storage, screenshotter });
  const job = await repo.createJob({ userId: 'u1', prompt: 'hello there friend' });
  const source = await repo.createSource({
    jobId: job.id,
    url: 'https://example.com/article',
    title: 'Article',
    summary: 'summary',
    domain: 'example.com',
  });
  return { repo, queue, pubsub, storage, screenshotter, job, source };
};

describe('registerScreenshotWorker', () => {
  it('captures, uploads, and marks the source done', async () => {
    const { repo, queue, pubsub, storage, source } = await setup();
    const events: string[] = [];
    pubsub.subscribe(source.jobId, (e) => events.push(e.type));
    await queue.enqueue<ScreenshotJobPayload>(SCREENSHOT_QUEUE, {
      jobId: source.jobId,
      sourceId: source.id,
      url: source.url,
    });
    await queue.drain();

    const updated = (await repo.listSources(source.jobId))[0];
    expect(updated.status).toBe('done');
    expect(updated.screenshotPath).toBeTruthy();
    expect(updated.screenshotUrl).toBeTruthy();
    expect(storage.list().length).toBe(1);
    expect(events).toContain('source');
  });

  it('marks the source failed on capture errors but still publishes', async () => {
    const { repo, queue, pubsub, screenshotter, source } = await setup();
    screenshotter.failOn(source.url);
    const events: string[] = [];
    pubsub.subscribe(source.jobId, (e) => events.push(e.type));
    await queue.enqueue<ScreenshotJobPayload>(SCREENSHOT_QUEUE, {
      jobId: source.jobId,
      sourceId: source.id,
      url: source.url,
    });
    await queue.drain();

    const updated = (await repo.listSources(source.jobId))[0];
    expect(updated.status).toBe('failed');
    expect(events).toContain('source');
  });

  it('refuses unsafe URLs without ever calling the screenshotter', async () => {
    const { repo, queue, pubsub, screenshotter, job } = await setup();
    const source = await repo.createSource({
      jobId: job.id,
      url: 'http://10.0.0.5/secret',
      title: 't',
      summary: '',
      domain: '10.0.0.5',
    });
    await queue.enqueue<ScreenshotJobPayload>(SCREENSHOT_QUEUE, {
      jobId: source.jobId,
      sourceId: source.id,
      url: source.url,
    });
    await queue.drain();
    expect(screenshotter.captures()).toEqual([]);
    const updated = (await repo.listSources(job.id)).find((s) => s.id === source.id);
    expect(updated?.status).toBe('failed');
  });
});
