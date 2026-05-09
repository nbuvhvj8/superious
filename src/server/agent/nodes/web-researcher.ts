import type { WebSearchProvider } from '../../search';
import type { AgentState, SearchResult } from '../../types';

const PER_QUERY_LIMIT = 8;
const TOTAL_LIMIT = 24;

/**
 * `web_researcher` agent node.
 *
 * Fans out the planned queries to the search provider in parallel,
 * deduplicates by canonical URL, and stores the merged result list on
 * `state.rawResults`. Errors from individual queries are recorded but do
 * not abort the pipeline — research is best-effort.
 */
export async function webResearcherNode(
  state: AgentState,
  search: WebSearchProvider
): Promise<AgentState> {
  if (state.queries.length === 0) {
    return {
      ...state,
      errors: [...state.errors, 'web_researcher: no queries planned, skipping search'],
    };
  }

  const settled = await Promise.allSettled(
    state.queries.map((query) => search.search(query, { maxResults: PER_QUERY_LIMIT }))
  );

  const rawResults: SearchResult[] = [];
  const errors: string[] = [];
  const seenUrls = new Set<string>();

  for (const [i, outcome] of settled.entries()) {
    if (outcome.status === 'rejected') {
      const reason =
        outcome.reason instanceof Error ? outcome.reason.message : String(outcome.reason);
      errors.push(`web_researcher[${i}]: ${reason}`);
      continue;
    }
    for (const r of outcome.value) {
      const canonical = canonicalise(r.url);
      if (!canonical || seenUrls.has(canonical)) continue;
      seenUrls.add(canonical);
      rawResults.push({ ...r, url: canonical });
      if (rawResults.length >= TOTAL_LIMIT) break;
    }
    if (rawResults.length >= TOTAL_LIMIT) break;
  }

  return {
    ...state,
    rawResults,
    errors: errors.length > 0 ? [...state.errors, ...errors] : state.errors,
  };
}

/**
 * Strip query strings that are usually tracking junk (utm_*, fbclid, etc.)
 * and remove fragments, so two identical articles served via different
 * tracking params dedupe to one entry.
 */
function canonicalise(url: string): string | null {
  try {
    const u = new URL(url);
    u.hash = '';
    const TRACKERS = [
      'utm_source',
      'utm_medium',
      'utm_campaign',
      'utm_content',
      'utm_term',
      'fbclid',
      'gclid',
      'mc_cid',
      'mc_eid',
    ];
    for (const t of TRACKERS) u.searchParams.delete(t);
    return u.toString();
  } catch {
    return null;
  }
}
