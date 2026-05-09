import { describe, expect, it } from 'vitest';
import { getBackend, registerResearchWorker, resetBackend, startResearchJob } from '@/server';

describe('orchestrator', () => {
  it('runs an end-to-end research job through the in-memory backend', async () => {
    resetBackend();
    const backend = await getBackend();
    registerResearchWorker(backend);
    const job = await backend.repo.createJob({ userId: 'u1', prompt: 'tell me about pizza' });
    await startResearchJob(backend, { jobId: job.id, userId: 'u1', prompt: job.prompt });
    await backend.queue.drain();

    const final = await backend.repo.getJob(job.id);
    expect(final?.status).toBe('done');
    expect(await backend.repo.getScript(job.id)).not.toBeNull();
  });
});
