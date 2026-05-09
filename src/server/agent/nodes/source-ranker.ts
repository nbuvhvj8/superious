import type { LLMProvider } from '../../llm';
import type { JobRepository } from '../../repo';
import type { AgentState, SearchResult, Source } from '../../types';
import { SUPERIOUS_SYSTEM_BODY } from '@/brain';

const SYSTEM_PROMPT = `${SUPERIOUS_SYSTEM_BODY}

You are SUPERIOUS_SOURCE_RANKER, an expert at curating research sources for video scripts.

Given a candidate list of sources, return ONLY a JSON array of source ids ordered by usefulness for the user's prompt. Pick at most 8 ids.

Prefer:
- Reputable domains (.edu, established news, official organisations).
- Recent publications when freshness matters.
- Diverse perspectives over redundant sources.
`;

const MAX_SOURCES = 8;

/**
 * `source_ranker` agent node.
 *
 * Asks a cheap LLM to rank the deduped candidate list and returns the top
 * 8. Sources are then persisted to the repository in `pending` status so
 * the next stage can attach screenshot rows by id.
 */
export async function sourceRankerNode(
  state: AgentState,
  llm: LLMProvider,
  repo: JobRepository
): Promise<AgentState> {
  if (state.rawResults.length === 0) {
    return {
      ...state,
      errors: [...state.errors, 'source_ranker: no raw results to rank, skipping'],
    };
  }

  const candidates = state.rawResults.slice(0, 24);
  // We attach a synthetic id while ranking so the LLM has something stable
  // to point at without leaking real source UUIDs (those don't exist yet).
  const indexed = candidates.map((r, i) => ({ id: `cand-${i}`, result: r }));

  const userMessage = [
    `User prompt: ${state.prompt}`,
    '',
    'Candidate sources:',
    ...indexed.map(
      ({ id, result }) =>
        `id:${id} | title: ${result.title} | url: ${result.url} | snippet: ${truncate(result.snippet, 200)}`
    ),
    '',
    'Return JSON array of up to 8 ids ordered best-first.',
  ].join('\n');

  let topIds: string[] = [];
  try {
    const raw = await llm.complete(
      [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userMessage },
      ],
      { maxTokens: 256, temperature: 0 }
    );
    topIds = parseIds(raw);
  } catch (err) {
    state.errors.push(`source_ranker: ${err instanceof Error ? err.message : String(err)}`);
  }

  const idLookup = new Map(indexed.map((x) => [x.id, x.result]));
  const ranked = topIds
    .map((id) => idLookup.get(id))
    .filter((r): r is SearchResult => Boolean(r))
    .slice(0, MAX_SOURCES);

  // Fallback: if the LLM returned nothing usable, pick by score / order.
  const finalRanked: SearchResult[] =
    ranked.length > 0
      ? ranked
      : [...candidates].sort((a, b) => (b.score ?? 0) - (a.score ?? 0)).slice(0, MAX_SOURCES);

  const created: Source[] = [];
  for (const r of finalRanked) {
    const src = await repo.createSource({
      jobId: state.jobId,
      url: r.url,
      title: r.title,
      summary: truncate(r.snippet, 600),
      domain: r.domain,
      publishedAt: r.publishedAt,
      rankScore: r.score ?? null,
    });
    created.push(src);
  }
  return {
    ...state,
    sources: created,
  };
}

function truncate(text: string, max: number): string {
  if (!text) return '';
  return text.length <= max ? text : `${text.slice(0, max - 1).trimEnd()}…`;
}

function parseIds(raw: string): string[] {
  const cleaned = raw
    .trim()
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/```\s*$/i, '');
  try {
    const parsed = JSON.parse(cleaned) as unknown;
    if (Array.isArray(parsed)) {
      return parsed.filter((x): x is string => typeof x === 'string');
    }
  } catch {
    // Fall back to extracting `cand-N` tokens from a newline-separated reply.
    return [...cleaned.matchAll(/cand-\d+/g)].map((m) => m[0]);
  }
  return [];
}
