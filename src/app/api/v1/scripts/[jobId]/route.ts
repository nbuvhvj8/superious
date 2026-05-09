import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getBackend, scriptSegmentSchema } from '@/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const patchSchema = z
  .object({
    title: z.string().min(1).optional(),
    hook: z.string().min(1).optional(),
    outro: z.string().min(1).optional(),
    segments: z.array(scriptSegmentSchema).min(1).optional(),
  })
  .refine(
    (d) =>
      d.title !== undefined ||
      d.hook !== undefined ||
      d.outro !== undefined ||
      d.segments !== undefined,
    'At least one field must be supplied'
  );

/**
 * Allow the user to edit the AI-generated script in-browser.
 *
 * `PATCH /api/v1/scripts/:jobId` — update any subset of {title, hook,
 * outro, segments}. Word count + duration are recomputed by the repo.
 */
export async function PATCH(req: NextRequest, ctx: { params: Promise<{ jobId: string }> }) {
  const backend = await getBackend();
  const user = await backend.auth.resolve(req);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { jobId } = await ctx.params;
  const job = await backend.repo.getJob(jobId);
  if (!job) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  if (job.userId !== user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }
  const parse = patchSchema.safeParse(body);
  if (!parse.success) {
    return NextResponse.json(
      { error: 'Validation failed', issues: parse.error.flatten() },
      { status: 400 }
    );
  }

  const existing = await backend.repo.getScript(jobId);
  if (!existing) {
    return NextResponse.json({ error: 'Script not generated yet' }, { status: 409 });
  }

  const updated = await backend.repo.upsertScript({
    jobId,
    title: parse.data.title ?? existing.title,
    hook: parse.data.hook ?? existing.hook,
    outro: parse.data.outro ?? existing.outro,
    segments: parse.data.segments ?? existing.segments,
  });
  return NextResponse.json(updated);
}
