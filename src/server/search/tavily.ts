import type { SearchResult } from '../types';
import { getDomain, type WebSearchOptions, type WebSearchProvider } from './search';

interface TavilyResponse {
  results?: Array<{
    url: string;
    title: string;
    content: string;
    score?: number;
    published_date?: string;
  }>;
}

type FetchFn = typeof fetch;

/**
 * Tavily Search adapter. Tavily is the PRD's primary research provider
 * because it returns clean, summarised snippets that work well as LLM
 * context with no extra preprocessing.
 */
export class TavilySearchProvider implements WebSearchProvider {
  readonly id = 'tavily' as const;

  constructor(
    private readonly apiKey: string,
    private readonly fetcher: FetchFn = fetch
  ) {}

  async search(query: string, opts: WebSearchOptions = {}): Promise<SearchResult[]> {
    const limit = opts.limit ?? opts.maxResults ?? 8;
    const res = await this.fetcher('https://api.tavily.com/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        api_key: this.apiKey,
        query,
        search_depth: 'basic',
        include_answer: false,
        include_raw_content: false,
        max_results: limit,
        time_range: opts.dateRange,
      }),
    });
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(`Tavily ${res.status}: ${text.slice(0, 200)}`);
    }
    const data = (await res.json()) as TavilyResponse;
    return (data.results ?? []).map((r) => ({
      url: r.url,
      title: r.title,
      snippet: r.content,
      domain: getDomain(r.url),
      publishedAt: r.published_date ?? null,
      score: r.score ?? null,
    }));
  }
}
