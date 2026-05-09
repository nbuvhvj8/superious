import type { SearchResult } from '../types';
import { getDomain, type WebSearchOptions, type WebSearchProvider } from './search';

interface BraveResponse {
  web?: {
    results?: Array<{ url: string; title: string; description: string; age?: string }>;
  };
}

type FetchFn = typeof fetch;

/** Brave Search adapter — second fallback after Serper. */
export class BraveSearchProvider implements WebSearchProvider {
  readonly id = 'brave' as const;

  constructor(
    private readonly apiKey: string,
    private readonly fetcher: FetchFn = fetch
  ) {}

  async search(query: string, opts: WebSearchOptions = {}): Promise<SearchResult[]> {
    const limit = opts.limit ?? opts.maxResults ?? 8;
    const url = new URL('https://api.search.brave.com/res/v1/web/search');
    url.searchParams.set('q', query);
    url.searchParams.set('count', String(Math.min(limit, 20)));
    const res = await this.fetcher(url.toString(), {
      headers: {
        Accept: 'application/json',
        'X-Subscription-Token': this.apiKey,
      },
    });
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(`Brave ${res.status}: ${text.slice(0, 200)}`);
    }
    const data = (await res.json()) as BraveResponse;
    return (data.web?.results ?? []).slice(0, limit).map((r) => ({
      url: r.url,
      title: r.title,
      snippet: r.description,
      domain: getDomain(r.url),
      publishedAt: r.age ?? null,
      score: null,
    }));
  }
}
