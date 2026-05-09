import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { POST as postJobs, GET as getJobs } from '@/app/api/v1/jobs/route';
import { GET as getJob, DELETE as deleteJob } from '@/app/api/v1/jobs/[id]/route';
import { PATCH as patchScript } from '@/app/api/v1/scripts/[jobId]/route';
import { GET as streamJob } from '@/app/api/v1/jobs/[id]/stream/route';
import { resetBackend, getBackend } from '@/server';

const buildRequest = (init: { url: string; method?: string; body?: unknown; userId?: string | null; headers?: Record<string, string> }) => {
  const headers = new Headers(init.headers);
  if (init.userId !== null) headers.set('x-user-id', init.userId ?? 'tester');
  if (init.body !== undefined) headers.set('content-type', 'application/json');
  const req = new Request(init.url, {
    method: init.method ?? 'GET',
    headers,
    body: init.body === undefined ? undefined : JSON.stringify(init.body),
  });
  return req as unknown as import('next/server').NextRequest;
};

describe('POST /api/v1/jobs', () => {
  beforeEach(() => resetBackend());

  it('creates a job and returns 202', async () => {
    const res = await postJobs(
      buildRequest({
        url: 'http://localhost/api/v1/jobs',
        method: 'POST',
        body: { prompt: 'tell me about coffee history' },
      })
    );
    expect(res.status).toBe(202);
    const body = (await res.json()) as { jobId: string; status: string };
    expect(body.jobId).toBeTruthy();
    expect(body.status).toBe('queued');
  });

  it('rejects malformed JSON bodies', async () => {
    const req = new Request('http://localhost/api/v1/jobs', {
      method: 'POST',
      body: '{not json',
      headers: { 'content-type': 'application/json', 'x-user-id': 'tester' },
    });
    const res = await postJobs(req as unknown as import('next/server').NextRequest);
    expect(res.status).toBe(400);
  });

  it('rejects too-short prompts', async () => {
    const res = await postJobs(
      buildRequest({
        url: 'http://localhost/api/v1/jobs',
        method: 'POST',
        body: { prompt: 'too short' },
      })
    );
    expect(res.status).toBe(400);
  });

  it('throttles after the configured per-hour limit', async () => {
    const backend = await getBackend();
    backend.env.jobsPerHourPerUser = 1;
    backend.rateLimiter = new (await import('@/server/rate-limit')).MemoryRateLimiter(1, 3_600_000);
    await postJobs(
      buildRequest({
        url: 'http://localhost/api/v1/jobs',
        method: 'POST',
        body: { prompt: 'first prompt within limit' },
      })
    );
    const res2 = await postJobs(
      buildRequest({
        url: 'http://localhost/api/v1/jobs',
        method: 'POST',
        body: { prompt: 'second prompt over limit' },
      })
    );
    expect(res2.status).toBe(429);
  });
});

describe('GET /api/v1/jobs', () => {
  beforeEach(() => resetBackend());

  it('lists the caller jobs only', async () => {
    const backend = await getBackend();
    await backend.repo.createJob({ userId: 'tester', prompt: 'mine' });
    await backend.repo.createJob({ userId: 'other', prompt: 'theirs' });
    const res = await getJobs(buildRequest({ url: 'http://localhost/api/v1/jobs' }));
    const body = (await res.json()) as { total: number; jobs: { userId: string }[] };
    expect(body.total).toBe(1);
    expect(body.jobs[0].userId).toBe('tester');
  });
});

describe('GET / DELETE /api/v1/jobs/:id', () => {
  beforeEach(() => resetBackend());

  it('returns 404 for unknown jobs', async () => {
    const res = await getJob(buildRequest({ url: 'http://localhost/api/v1/jobs/nope' }), {
      params: Promise.resolve({ id: 'nope' }),
    });
    expect(res.status).toBe(404);
  });

  it('forbids access from a different user', async () => {
    const backend = await getBackend();
    const j = await backend.repo.createJob({ userId: 'someone-else', prompt: 'private prompt' });
    const res = await getJob(buildRequest({ url: `http://localhost/api/v1/jobs/${j.id}` }), {
      params: Promise.resolve({ id: j.id }),
    });
    expect(res.status).toBe(403);
  });

  it('returns the full job detail when authorized', async () => {
    const backend = await getBackend();
    const j = await backend.repo.createJob({ userId: 'tester', prompt: 'private prompt yes' });
    const res = await getJob(buildRequest({ url: `http://localhost/api/v1/jobs/${j.id}` }), {
      params: Promise.resolve({ id: j.id }),
    });
    expect(res.status).toBe(200);
    const body = (await res.json()) as { job: { id: string }; sources: unknown[]; script: unknown };
    expect(body.job.id).toBe(j.id);
    expect(Array.isArray(body.sources)).toBe(true);
  });

  it('soft-deletes a job', async () => {
    const backend = await getBackend();
    const j = await backend.repo.createJob({ userId: 'tester', prompt: 'will be deleted' });
    const res = await deleteJob(
      buildRequest({ url: `http://localhost/api/v1/jobs/${j.id}`, method: 'DELETE' }),
      { params: Promise.resolve({ id: j.id }) }
    );
    expect(res.status).toBe(204);
    expect(await backend.repo.getJob(j.id)).toBeNull();
  });
});

describe('PATCH /api/v1/scripts/:jobId', () => {
  beforeEach(() => resetBackend());

  it('rejects edits before the script is generated', async () => {
    const backend = await getBackend();
    const j = await backend.repo.createJob({ userId: 'tester', prompt: 'fresh prompt' });
    const res = await patchScript(
      buildRequest({
        url: `http://localhost/api/v1/scripts/${j.id}`,
        method: 'PATCH',
        body: { title: 'New title' },
      }),
      { params: Promise.resolve({ jobId: j.id }) }
    );
    expect(res.status).toBe(409);
  });

  it('updates fields once a script exists', async () => {
    const backend = await getBackend();
    const j = await backend.repo.createJob({ userId: 'tester', prompt: 'fresh prompt' });
    await backend.repo.upsertScript({
      jobId: j.id,
      title: 'old',
      hook: 'h',
      outro: 'o',
      segments: [
        { order: 1, heading: 'h', narration: 'n', bRollCues: [], sourceIds: [], durationS: 1 },
      ],
    });
    const res = await patchScript(
      buildRequest({
        url: `http://localhost/api/v1/scripts/${j.id}`,
        method: 'PATCH',
        body: { title: 'new title' },
      }),
      { params: Promise.resolve({ jobId: j.id }) }
    );
    expect(res.status).toBe(200);
    const body = (await res.json()) as { title: string };
    expect(body.title).toBe('new title');
  });
});

describe('GET /api/v1/jobs/:id/stream', () => {
  beforeEach(() => resetBackend());

  it('returns SSE history with done event', async () => {
    const backend = await getBackend();
    const j = await backend.repo.createJob({ userId: 'tester', prompt: 'sse prompt' });
    await backend.pubsub.publish(j.id, { type: 'status', status: 'done' });
    await backend.pubsub.publish(j.id, { type: 'done' });
    const reqHeaders = new Headers({ 'x-user-id': 'tester' });
    const ctrl = new AbortController();
    const req = new Request(`http://localhost/api/v1/jobs/${j.id}/stream`, {
      headers: reqHeaders,
      signal: ctrl.signal,
    });
    const res = await streamJob(req as unknown as import('next/server').NextRequest, {
      params: Promise.resolve({ id: j.id }),
    });
    expect(res.status).toBe(200);
    expect(res.headers.get('content-type')).toContain('text/event-stream');
    const text = await res.text();
    expect(text).toContain('event: status');
    expect(text).toContain('event: done');
  });
});

afterEach(() => resetBackend());
