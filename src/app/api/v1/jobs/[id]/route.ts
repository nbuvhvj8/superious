import { NextRequest, NextResponse } from 'next/server';
import { getBackend } from '@/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Job detail + soft-delete endpoint.
 *
 * `GET    /api/v1/jobs/:id` — full job, sources, and (if available) script.
 * `DELETE /api/v1/jobs/:id` — cascades to sources & scripts.
 */
export async function GET(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const backend = await getBackend();
  const user = await backend.auth.resolve(req);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { id } = await ctx.params;
  const job = await backend.repo.getJob(id);
  if (!job) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  if (job.userId !== user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  const [sources, script] = await Promise.all([
    backend.repo.listSources(id),
    backend.repo.getScript(id),
  ]);
  return NextResponse.json({ job, sources, script });
}

export async function DELETE(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const backend = await getBackend();
  const user = await backend.auth.resolve(req);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { id } = await ctx.params;
  const job = await backend.repo.getJob(id);
  if (!job) {
    return new NextResponse(null, { status: 204 });
  }
  if (job.userId !== user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  // Delete any persisted screenshots from storage before dropping rows so
  // we don't leave orphaned bytes behind.
  const sources = await backend.repo.listSources(id);
  await Promise.allSettled(
    sources
      .filter((s) => s.screenshotPath)
      .map((s) => backend.storage.delete(s.screenshotPath as string))
  );
  await backend.repo.deleteJob(id);
  return new NextResponse(null, { status: 204 });
}
