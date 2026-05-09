import { z } from 'zod';

/**
 * Zod schemas used for runtime validation at the API boundary and for
 * parsing LLM JSON output. Keeping them in one place lets us derive both
 * TypeScript types and validators from a single source of truth.
 */

export const createJobSchema = z.object({
  prompt: z
    .string()
    .min(10, 'Prompt must be at least 10 characters')
    .max(1000, 'Prompt must be at most 1000 characters')
    .transform((s) => s.trim())
    .refine((s) => s.length >= 10, 'Prompt must be at least 10 characters'),
});

export type CreateJobInput = z.infer<typeof createJobSchema>;

export const listJobsQuerySchema = z.object({
  page: z.coerce.number().int().positive().max(10_000).default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  status: z
    .enum(['queued', 'researching', 'screenshotting', 'writing', 'done', 'failed'])
    .optional(),
});

export type ListJobsQuery = z.infer<typeof listJobsQuerySchema>;

export const scriptSegmentSchema = z.object({
  order: z.number().int().nonnegative(),
  heading: z.string().min(1),
  narration: z.string().min(1),
  bRollCues: z.array(z.string()).default([]),
  sourceIds: z.array(z.string()).default([]),
  durationS: z.number().nonnegative(),
});

export const scriptOutputSchema = z.object({
  title: z.string().min(1),
  hook: z.string().min(1),
  segments: z.array(scriptSegmentSchema).min(1),
  outro: z.string().min(1),
});

export type ScriptOutputParsed = z.infer<typeof scriptOutputSchema>;

/**
 * Tolerant parser for LLM-emitted scripts.
 *
 * Models love wrapping JSON in ```json fences or chatty preamble even when
 * told not to. We strip the most common offenders before handing the
 * payload to Zod so downstream code sees a clean, validated object.
 */
export function parseScriptOutput(raw: string): ScriptOutputParsed {
  const trimmed = raw.trim();
  let text = trimmed;
  if (text.startsWith('```')) {
    text = text.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/i, '');
  }
  const firstBrace = text.indexOf('{');
  const lastBrace = text.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace > firstBrace) {
    text = text.slice(firstBrace, lastBrace + 1);
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch (err) {
    throw new Error(
      `Script writer returned invalid JSON: ${err instanceof Error ? err.message : String(err)}`
    );
  }
  // Older prompts use snake_case for the segment fields; accept both forms.
  if (
    parsed &&
    typeof parsed === 'object' &&
    Array.isArray((parsed as { segments?: unknown[] }).segments)
  ) {
    const obj = parsed as { segments: unknown[] };
    obj.segments = obj.segments.map((s) => normaliseSegment(s));
  }
  return scriptOutputSchema.parse(parsed);
}

function normaliseSegment(s: unknown): unknown {
  if (!s || typeof s !== 'object') return s;
  const seg = s as Record<string, unknown>;
  if (seg.b_roll_cues !== undefined && seg.bRollCues === undefined) {
    seg.bRollCues = seg.b_roll_cues;
    delete seg.b_roll_cues;
  }
  if (seg.source_ids !== undefined && seg.sourceIds === undefined) {
    seg.sourceIds = seg.source_ids;
    delete seg.source_ids;
  }
  if (seg.duration_s !== undefined && seg.durationS === undefined) {
    seg.durationS = seg.duration_s;
    delete seg.duration_s;
  }
  return seg;
}
