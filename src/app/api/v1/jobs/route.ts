import { NextRequest, NextResponse } from 'next/server';
import {
  createJobSchema,
  getBackend,
  listJobsQuerySchema,
  registerResearchWorker,
  startResearchJob,
} from '@/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Job orchestration endpoint.
 *
 * `POST /api/v1/jobs`  — submit a new research prompt; returns 202 Accepted
 *                       with the new job id while the agent runs async.
 * `GET /api/v1/jobs`   — paginated list of the caller's jobs.
 */

let workerRegistered = false;
async function ensureWorker(): Promise<
  ReturnType<typeof getBackend> extends Promise<infer R> ? R : never
> {
  const backend = await getBackend();
  if (!workerRegistered) {
    registerResearchWorker(backend);
    workerRegistered = true;
  }
  return backend;
}

export async function POST(req: NextRequest) {
  const backend = await ensureWorker();
  const user = await backend.auth.resolve(req);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }
  const parse = createJobSchema.safeParse(body);
  if (!parse.success) {
    return NextResponse.json(
      { error: 'Validation failed', issues: parse.error.flatten() },
      { status: 400 }
    );
  }

  const limit = await backend.rateLimiter.take(`jobs:${user.id}`);
  if (!limit.allowed) {
    return NextResponse.json(
      {
        error: 'Rate limit exceeded',
        resetAt: new Date(limit.resetAt).toISOString(),
      },
      { status: 429 }
    );
  }

  const job = await backend.repo.createJob({ userId: user.id, prompt: parse.data.prompt });
  await startResearchJob(backend, {
    jobId: job.id,
    userId: user.id,
    prompt: parse.data.prompt,
  });

  return NextResponse.json(
    {
      jobId: job.id,
      status: job.status,
      estimatedSeconds: 90,
    },
    { status: 202 }
  );
}

export async function GET(req: NextRequest) {
  const backend = await ensureWorker();
  const user = await backend.auth.resolve(req);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const url = new URL(req.url);
  const parse = listJobsQuerySchema.safeParse({
    page: url.searchParams.get('page') ?? undefined,
    limit: url.searchParams.get('limit') ?? undefined,
    status: url.searchParams.get('status') ?? undefined,
  });
  if (!parse.success) {
    return NextResponse.json(
      { error: 'Invalid query', issues: parse.error.flatten() },
      { status: 400 }
    );
  }

  const page = await backend.repo.listJobs(user.id, parse.data);
  return NextResponse.json(page);
}
