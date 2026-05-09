import type { LLMProvider } from '../../llm';
import type { AgentState } from '../../types';

const SYSTEM_PROMPT = `You are SUPERIOUS_QUERY_PLANNER, a research assistant that decomposes a high-level prompt into 3 to 5 specific web-search queries.

Rules:
- Output ONLY a JSON array of strings. No markdown, no commentary.
- Each query should target a different angle (background, recent events, expert opinions, contrasting views).
- Keep each query under 15 words.
`;

const MIN_QUERIES = 3;
const MAX_QUERIES = 5;

/**
 * `query_planner` agent node.
 *
 * Given the user's prompt, asks a small/cheap LLM to produce 3–5 search
 * queries that will be passed to the `web_researcher` node next.
 *
 * Falls back gracefully: if the model returns invalid JSON or fewer than
 * the minimum number of queries, the node synthesises sensible defaults
 * from the prompt itself rather than failing the whole pipeline.
 */
export async function queryPlannerNode(state: AgentState, llm: LLMProvider): Promise<AgentState> {
  const userMessage = `User prompt: ${state.prompt}\n\nReturn a JSON array of 3 to 5 queries.`;
  let queries: string[] = [];
  try {
    const raw = await llm.complete(
      [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userMessage },
      ],
      { maxTokens: 256, temperature: 0.4 }
    );
    queries = parseQueries(raw);
  } catch (err) {
    return {
      ...state,
      queries: fallbackQueries(state.prompt),
      errors: [
        ...state.errors,
        `query_planner: ${err instanceof Error ? err.message : String(err)}`,
      ],
    };
  }
  // Dedupe (case-insensitive) so a model that hallucinates the same query
  // multiple times doesn't blow up our research budget.
  queries = dedupe(queries);
  if (queries.length < MIN_QUERIES) {
    queries = dedupe([...queries, ...fallbackQueries(state.prompt)]);
  }
  return {
    ...state,
    queries: queries.slice(0, MAX_QUERIES),
  };
}

function dedupe(queries: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const q of queries) {
    const key = q.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(q);
  }
  return out;
}

function parseQueries(raw: string): string[] {
  const cleaned = raw
    .trim()
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/```\s*$/i, '');
  try {
    const parsed = JSON.parse(cleaned) as unknown;
    if (Array.isArray(parsed)) {
      return parsed.map((q) => (typeof q === 'string' ? q.trim() : '')).filter((q) => q.length > 0);
    }
  } catch {
    // Try newline-separated fallback for models that ignore "JSON only".
    return cleaned
      .split('\n')
      .map((line) => line.replace(/^[\d.\-)\s]+/, '').trim())
      .filter((line) => line.length > 0)
      .slice(0, MAX_QUERIES);
  }
  return [];
}

function fallbackQueries(prompt: string): string[] {
  const trimmed = prompt.trim();
  return [
    `${trimmed} overview`,
    `${trimmed} key facts and statistics`,
    `${trimmed} expert analysis`,
  ];
}
