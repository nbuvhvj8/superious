import { NextResponse } from 'next/server';
import { getBackend } from '@/server/container';
import { buildRecaptureRun } from '@/server/monitoring/diff-engine';

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const jobId = typeof body.jobId === 'string' ? body.jobId : '';
  const scheduleId = typeof body.scheduleId === 'string' ? body.scheduleId : 'cron-manual';
  if (!jobId) return NextResponse.json({ error: 'jobId is required' }, { status: 400 });

  const backend = getBackend();
  const currentSources = await backend.repo.listSources(jobId);
  const previousSources = currentSources.slice(0, Math.max(0, currentSources.length - 1));

  const run = buildRecaptureRun({
    scheduleId,
    jobId,
    topic: (await backend.repo.getJob(jobId))?.prompt ?? 'Unknown topic',
    previous: previousSources,
    latest: currentSources,
  });

  const alerts = [
    ...run.newSources.map((source) => ({ type: 'new_source', severity: 'info', source })),
    ...run.brokenSources.map((source) => ({ type: 'broken_source', severity: 'warn', source })),
    ...run.contradictedClaims.map((claim) => ({ type: 'contradiction', severity: 'high', claim })),
  ];

  return NextResponse.json({ run, alerts });
}
