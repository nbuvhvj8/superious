import { NextRequest, NextResponse } from 'next/server';
import { getBackend } from '@/server';
import type { HookAngle, HookVariant } from '@/server/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * `GET /api/v1/scripts/:jobId/hook-variants`
 *
 * Generates five alternative hooks for the job's existing script, each
 * leaning into a different angle (data-led, contrarian, narrative,
 * emotional, question-led). The variants share the same source manifest
 * as the canonical script so they remain cite-able.
 *
 * The route asks the configured `LLMProvider` for a JSON list. When the
 * LLM is the in-process mock (no provider key configured) the route
 * returns a deterministic stub derived from the existing hook. The UI
 * has a baked-in fallback as well so failure here is never user-facing.
 */
const ANGLES: HookAngle[] = ['data-led', 'contrarian', 'narrative', 'emotional', 'question-led'];

export async function GET(req: NextRequest, ctx: { params: Promise<{ jobId: string }> }) {
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

  const script = await backend.repo.getScript(jobId);
  if (!script) {
    return NextResponse.json({ error: 'Script not generated yet' }, { status: 409 });
  }
  const sources = await backend.repo.listSources(jobId);

  const sourceManifest = sources
    .map((s) => `id:${s.id} | title:${s.title} | summary:${s.summary}`)
    .join('\n');

  const systemPrompt =
    'You generate five alternative hooks for a video script. Each hook must be a single paragraph, ' +
    '15-25 seconds when read at 130 wpm, and cite at least one source by id. Output ONLY a JSON ' +
    'array of objects with shape {angle, text, sourceIds}. Use one of these angle values exactly: ' +
    "'data-led', 'contrarian', 'narrative', 'emotional', 'question-led'. No preamble.";
  const userMessage = [
    `Topic: ${job.prompt}`,
    `Current hook (avoid repeating verbatim):\n${script.hook}`,
    `Sources:\n${sourceManifest}`,
    'Generate the JSON array now.',
  ].join('\n\n');

  let raw = '';
  try {
    raw = await backend.llm.complete(
      [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage },
      ],
      { maxTokens: 1500, temperature: 0.7 }
    );
  } catch {
    return NextResponse.json({
      variants: stubVariants(
        script.hook,
        sources.map((s) => s.id)
      ),
    });
  }

  const parsed = parseHookArray(raw);
  if (!parsed) {
    return NextResponse.json({
      variants: stubVariants(
        script.hook,
        sources.map((s) => s.id)
      ),
    });
  }

  const variants: HookVariant[] = parsed.slice(0, 5).map((v, i) => ({
    id: `hook-var-${i + 1}`,
    angle: ANGLES.includes(v.angle) ? v.angle : ANGLES[i % ANGLES.length],
    text: v.text,
    sourceIds: v.sourceIds.filter((id) => sources.some((s) => s.id === id)),
    estimatedDurationS: estimateDuration(v.text),
  }));

  return NextResponse.json({ variants });
}

function estimateDuration(text: string): number {
  const words = text.trim().split(/\s+/).length;
  return Math.max(8, Math.round((words / 130) * 60));
}

interface RawVariant {
  angle: HookAngle;
  text: string;
  sourceIds: string[];
}

function parseHookArray(raw: string): RawVariant[] | null {
  let text = raw.trim();
  if (text.startsWith('```')) {
    text = text.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/i, '');
  }
  const firstBracket = text.indexOf('[');
  const lastBracket = text.lastIndexOf(']');
  if (firstBracket !== -1 && lastBracket > firstBracket) {
    text = text.slice(firstBracket, lastBracket + 1);
  }
  let json: unknown;
  try {
    json = JSON.parse(text);
  } catch {
    return null;
  }
  if (!Array.isArray(json)) return null;
  const out: RawVariant[] = [];
  for (const entry of json) {
    if (!entry || typeof entry !== 'object') continue;
    const e = entry as Record<string, unknown>;
    const angle = typeof e.angle === 'string' ? (e.angle as HookAngle) : 'data-led';
    const variantText = typeof e.text === 'string' ? e.text : '';
    const sourceIdsRaw = Array.isArray(e.sourceIds)
      ? e.sourceIds
      : Array.isArray(e.source_ids)
        ? e.source_ids
        : [];
    const sourceIds = sourceIdsRaw.filter((s): s is string => typeof s === 'string');
    if (variantText.length === 0) continue;
    out.push({ angle, text: variantText, sourceIds });
  }
  return out;
}

/**
 * Deterministic stub used when the LLM call fails or returns garbage.
 * The five hooks reuse the original hook's content but reframe each
 * with a different angle so the UI can still demo the feature.
 */
function stubVariants(originalHook: string, sourceIds: string[]): HookVariant[] {
  const trim = (s: string, n: number) => (s.length > n ? s.slice(0, n).trim() + '…' : s);
  const seed = trim(originalHook, 220);
  const refs = sourceIds.slice(0, 3);
  const fragments: Record<HookAngle, string> = {
    'data-led': `By the numbers: ${seed}`,
    contrarian: `Conventional wisdom says otherwise — but ${seed}`,
    narrative: `Picture this moment: ${seed}`,
    emotional: `For the people living this story, ${seed}`,
    'question-led': `What if we've been wrong about this? ${seed}`,
  };
  return ANGLES.map((angle, i) => ({
    id: `hook-var-stub-${i + 1}`,
    angle,
    text: fragments[angle],
    sourceIds: refs,
    estimatedDurationS: estimateDuration(fragments[angle]),
  }));
}
