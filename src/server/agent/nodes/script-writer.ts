import type { LLMProvider } from '../../llm';
import type { JobRepository } from '../../repo';
import { parseScriptOutput } from '../../schemas';
import type { AgentState, ScriptOutput, ScriptSegment, Source } from '../../types';
import { SUPERIOUS_SYSTEM_BODY } from '@/brain';

const SYSTEM_PROMPT = `${SUPERIOUS_SYSTEM_BODY}

You are SUPERIOUS_SCRIPT_WRITER, an expert video script writer.

You write rough-cut scripts grounded ONLY in the provided source documents. Every factual claim MUST cite at least one source_id from the sources list.

Output ONLY valid JSON matching this schema:
{
  "title": string,
  "hook": string,
  "segments": [
    {
      "order": number,
      "heading": string,
      "narration": string,
      "b_roll_cues": string[],
      "source_ids": string[],
      "duration_s": number
    }
  ],
  "outro": string
}

No preamble. No markdown fences. Pure JSON only.`;

/**
 * `script_writer` agent node.
 *
 * Synthesises a structured video script from the gathered sources and
 * persists it to the repo via `upsertScript`. On parser failure, the
 * pipeline records the error and surfaces a synthetic minimal script so
 * the user still gets *something* — partial output beats a hard fail.
 */
export async function scriptWriterNode(
  state: AgentState,
  llm: LLMProvider,
  repo: JobRepository
): Promise<AgentState> {
  if (state.sources.length === 0) {
    const fallback = synthesiseFallback(state, []);
    await repo.upsertScript({ jobId: state.jobId, ...fallback });
    return {
      ...state,
      script: fallback,
      errors: [...state.errors, 'script_writer: no sources, returning placeholder script'],
    };
  }

  const sourceManifest = state.sources
    .map((s) => `id:${s.id} | title: ${s.title} | url: ${s.url} | summary: ${s.summary}`)
    .join('\n');

  const userMessage = [
    `User prompt: ${state.prompt}`,
    '',
    'Sources:',
    sourceManifest,
    '',
    'Generate the script JSON now.',
  ].join('\n');

  let raw = '';
  try {
    raw = await llm.complete(
      [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userMessage },
      ],
      { maxTokens: 4096, temperature: 0.5 }
    );
  } catch (err) {
    const fallback = synthesiseFallback(state, state.sources);
    await repo.upsertScript({ jobId: state.jobId, ...fallback });
    return {
      ...state,
      script: fallback,
      errors: [
        ...state.errors,
        `script_writer: ${err instanceof Error ? err.message : String(err)}`,
      ],
    };
  }

  let parsed;
  try {
    parsed = parseScriptOutput(raw);
  } catch (err) {
    const fallback = synthesiseFallback(state, state.sources);
    await repo.upsertScript({ jobId: state.jobId, ...fallback });
    return {
      ...state,
      script: fallback,
      errors: [
        ...state.errors,
        `script_writer: ${err instanceof Error ? err.message : String(err)}`,
      ],
    };
  }

  // Defensive cleanup — re-number segments and clamp duration to non-negative.
  const segments = parsed.segments.map((seg, idx) => ({
    order: idx + 1,
    heading: seg.heading,
    narration: seg.narration,
    bRollCues: seg.bRollCues,
    sourceIds: seg.sourceIds.filter((id) => state.sources.some((s) => s.id === id)),
    durationS: Math.max(0, seg.durationS),
  }));

  const script = {
    title: parsed.title,
    hook: parsed.hook,
    segments,
    outro: parsed.outro,
  };

  await repo.upsertScript({ jobId: state.jobId, ...script });

  return {
    ...state,
    script,
  };
}

function synthesiseFallback(state: AgentState, sources: Source[]): ScriptOutput {
  const ids = sources.map((s) => s.id);
  const segment: ScriptSegment = {
    order: 1,
    heading: 'Sources Reviewed',
    narration:
      sources.length > 0
        ? `We reviewed ${sources.length} sources covering different angles of this topic. See the source panel for the full list with screenshots.`
        : 'No sources were captured for this run.',
    bRollCues: ['source thumbnail montage'],
    sourceIds: ids,
    durationS: 30,
  };
  return {
    title: `Research Notes: ${state.prompt}`,
    hook: `Quick research-backed overview of "${state.prompt}". The full LLM-written script could not be generated for this run; this is a fallback summary built from the sources we did capture.`,
    segments: [segment],
    outro: 'Re-run the job once provider credentials are configured for a full script.',
  };
}
