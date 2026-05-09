import { describe, expect, it } from 'vitest';
import { emptyAgentState, runAgentGraph } from '@/server/agent';
import { MockLLMProvider } from '@/server/llm';
import { MemoryJobPubSub } from '@/server/pubsub';
import { MemoryJobQueue } from '@/server/queue';
import { MemoryJobRepository } from '@/server/repo';
import { MockSearchProvider } from '@/server/search';
import {
  MockScreenshotter,
  registerScreenshotWorker,
  SCREENSHOT_QUEUE,
} from '@/server/screenshot';
import { MemoryScreenshotStorage } from '@/server/storage';
import type { JobEvent, JobStatus, Source } from '@/server/types';

const buildEnv = async () => {
  const repo = new MemoryJobRepository();
  const queue = new MemoryJobQueue();
  const pubsub = new MemoryJobPubSub();
  const storage = new MemoryScreenshotStorage();
  const screenshotter = new MockScreenshotter();
  // Bypass the SSRF guard's DNS lookups in unit tests so synthetic URLs
  // from MockSearchProvider don't depend on real DNS being available.
  registerScreenshotWorker({
    queue,
    repo,
    pubsub,
    storage,
    screenshotter,
    safetyCheck: async () => {},
  });
  return { repo, queue, pubsub, storage, screenshotter };
};

describe('runAgentGraph', () => {
  it('runs end-to-end with mocks and produces a script + sources', async () => {
    const { repo, queue, pubsub, storage } = await buildEnv();
    const job = await repo.createJob({ userId: 'u1', prompt: 'tell me about solar power' });
    const state = emptyAgentState({ jobId: job.id, userId: 'u1', prompt: job.prompt });
    const events: JobEvent[] = [];
    pubsub.subscribe(job.id, (e) => events.push(e));

    const { finalState } = await runAgentGraph(state, {
      llm: new MockLLMProvider(),
      search: new MockSearchProvider(),
      repo,
      queue,
      pubsub,
      screenshotTimeoutMs: 5_000,
    });
    await queue.drain();

    expect(finalState.script).not.toBeNull();
    const persisted = await repo.getScript(job.id);
    expect(persisted).not.toBeNull();
    const sources = await repo.listSources(job.id);
    expect(sources.length).toBeGreaterThan(0);
    expect(sources.every((s: Source) => s.status !== 'pending')).toBe(true);

    const reread = await repo.getJob(job.id);
    const expected: JobStatus[] = ['researching', 'screenshotting', 'writing', 'done'];
    expect(reread?.status).toBe('done');
    const statuses = events
      .filter((e) => e.type === 'status')
      .map((e) => (e.type === 'status' ? e.status : 'unknown'));
    for (const s of expected) {
      expect(statuses).toContain(s);
    }
    expect(events.some((e) => e.type === 'script')).toBe(true);
    expect(events[events.length - 1].type).toBe('done');
    expect(storage.list().length).toBeGreaterThan(0);
  });
});
