import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { resetIdGenerator, setIdGenerator } from '@/server/ids';
import { MemoryJobRepository } from '@/server/repo';

describe('MemoryJobRepository', () => {
  let repo: MemoryJobRepository;

  beforeEach(() => {
    let i = 0;
    setIdGenerator(() => `id-${i++}`);
    repo = new MemoryJobRepository();
  });

  afterEach(() => {
    resetIdGenerator();
  });

  it('creates jobs in queued status with timestamps', async () => {
    const job = await repo.createJob({ userId: 'u1', prompt: 'hello world' });
    expect(job.id).toBe('id-0');
    expect(job.status).toBe('queued');
    expect(job.userId).toBe('u1');
    expect(job.error).toBeNull();
    expect(job.createdAt).toMatch(/^\d{4}-\d{2}-\d{2}/);
  });

  it('returns null for unknown job ids', async () => {
    expect(await repo.getJob('missing')).toBeNull();
  });

  it('updates status and persists the new value', async () => {
    const j = await repo.createJob({ userId: 'u1', prompt: 'hello' });
    const updated = await repo.updateJobStatus(j.id, 'researching');
    expect(updated.status).toBe('researching');
    const reread = await repo.getJob(j.id);
    expect(reread?.status).toBe('researching');
  });

  it('records error message only on failed transitions', async () => {
    const j = await repo.createJob({ userId: 'u1', prompt: 'hello' });
    await repo.updateJobStatus(j.id, 'researching');
    let read = await repo.getJob(j.id);
    expect(read?.error).toBeNull();
    await repo.updateJobStatus(j.id, 'failed', 'boom');
    read = await repo.getJob(j.id);
    expect(read?.error).toBe('boom');
  });

  it('lists jobs sorted by recency, paginated, and filtered by status', async () => {
    for (let i = 0; i < 5; i += 1) {
      const j = await repo.createJob({ userId: 'u1', prompt: `p${i}` });
      if (i === 2) await repo.updateJobStatus(j.id, 'done');
    }
    await repo.createJob({ userId: 'other', prompt: 'no leak' });

    const page1 = await repo.listJobs('u1', { page: 1, limit: 3 });
    expect(page1.total).toBe(5);
    expect(page1.jobs).toHaveLength(3);

    const onlyDone = await repo.listJobs('u1', { page: 1, limit: 10, status: 'done' });
    expect(onlyDone.total).toBe(1);
    expect(onlyDone.jobs[0].status).toBe('done');

    const otherUser = await repo.listJobs('other', { page: 1, limit: 10 });
    expect(otherUser.total).toBe(1);
  });

  it('cascades source + script deletes when a job is deleted', async () => {
    const j = await repo.createJob({ userId: 'u1', prompt: 'hello' });
    const s = await repo.createSource({
      jobId: j.id,
      url: 'https://example.com/a',
      title: 'A',
      summary: 'sum',
      domain: 'example.com',
    });
    await repo.upsertScript({
      jobId: j.id,
      title: 'T',
      hook: 'H',
      outro: 'O',
      segments: [
        {
          order: 1,
          heading: 'h',
          narration: 'n',
          bRollCues: [],
          sourceIds: [s.id],
          durationS: 10,
        },
      ],
    });
    await repo.deleteJob(j.id);
    expect(await repo.getJob(j.id)).toBeNull();
    expect(await repo.listSources(j.id)).toEqual([]);
    expect(await repo.getScript(j.id)).toBeNull();
  });

  it('refuses to attach a source to an unknown job', async () => {
    await expect(
      repo.createSource({
        jobId: 'nope',
        url: 'https://example.com',
        title: '',
        summary: '',
        domain: 'example.com',
      })
    ).rejects.toThrow(/unknown job/i);
  });

  it('updates a source patch and reads it back', async () => {
    const j = await repo.createJob({ userId: 'u1', prompt: 'hello world' });
    const s = await repo.createSource({
      jobId: j.id,
      url: 'https://example.com',
      title: 'A',
      summary: 'sum',
      domain: 'example.com',
    });
    await repo.updateSource(s.id, {
      status: 'done',
      screenshotPath: 'screenshots/1.png',
      screenshotUrl: 'https://signed.example/1',
    });
    const sources = await repo.listSources(j.id);
    expect(sources[0].status).toBe('done');
    expect(sources[0].screenshotPath).toBe('screenshots/1.png');
  });

  it('upsertScript computes word count and duration', async () => {
    const j = await repo.createJob({ userId: 'u1', prompt: 'hello world' });
    const script = await repo.upsertScript({
      jobId: j.id,
      title: 'T',
      hook: 'one two three',
      outro: 'four',
      segments: [
        {
          order: 1,
          heading: 'h',
          narration: 'five six seven eight nine ten',
          bRollCues: [],
          sourceIds: [],
          durationS: 60,
        },
      ],
    });
    expect(script.wordCount).toBe(10);
    expect(script.estimatedDurationS).toBeGreaterThan(0);
  });

  it('preserves the script id across upserts (one-to-one with job)', async () => {
    const j = await repo.createJob({ userId: 'u1', prompt: 'hello world' });
    const a = await repo.upsertScript({
      jobId: j.id,
      title: 'T',
      hook: 'H',
      outro: 'O',
      segments: [
        { order: 1, heading: 'h', narration: 'n', bRollCues: [], sourceIds: [], durationS: 1 },
      ],
    });
    const b = await repo.upsertScript({
      jobId: j.id,
      title: 'New title',
      hook: 'H',
      outro: 'O',
      segments: [
        { order: 1, heading: 'h', narration: 'n', bRollCues: [], sourceIds: [], durationS: 1 },
      ],
    });
    expect(a.id).toBe(b.id);
    expect(b.title).toBe('New title');
  });
});
