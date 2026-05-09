import type { SearchResult } from '../types';
import { getDomain, type WebSearchOptions, type WebSearchProvider } from './search';

interface SerperResponse {
  organic?: Array<{
    link: string;
    title: string;
    snippet: string;
    date?: string;
  }>;
}

type FetchFn = typeof fetch;

/** Serper (google.serper.dev) adapter — fallback to Tavily. */
export class SerperSearchProvider implements WebSearchProvider {
  readonly id = 'serper' as const;

  constructor(
    private readonly apiKey: string,
    private readonly fetcher: FetchFn = fetch
  ) {}

  async search(query: string, opts: WebSearchOptions = {}): Promise<SearchResult[]> {
    const limit = opts.limit ?? opts.maxResults ?? 8;
    const res = await this.fetcher('https://google.serper.dev/search', {
      method: 'POST',
      headers: {
        'X-API-KEY': this.apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ q: query, num: limit }),
    });
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(`Serper ${res.status}: ${text.slice(0, 200)}`);
    }
    const data = (await res.json()) as SerperResponse;
    return (data.organic ?? []).slice(0, limit).map((r) => ({
      url: r.link,
      title: r.title,
      snippet: r.snippet,
      domain: getDomain(r.link),
      publishedAt: r.date ?? null,
      score: null,
    }));
  }
}
