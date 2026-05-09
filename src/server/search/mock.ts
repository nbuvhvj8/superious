import type { SearchResult } from '../types';
import { getDomain, type WebSearchOptions, type WebSearchProvider } from './search';

/**
 * Deterministic search provider used by the in-memory dev pipeline and unit
 * tests. Generates synthetic-but-realistic looking results based on the
 * query string so that downstream nodes have something to work with even
 * without a Tavily / Serper key.
 */
export class MockSearchProvider implements WebSearchProvider {
  readonly id = 'mock' as const;

  constructor(private readonly fixture?: SearchResult[]) {}

  async search(query: string, opts: WebSearchOptions = { maxResults: 8 }): Promise<SearchResult[]> {
    const limit = opts.limit ?? opts.maxResults ?? 8;
    if (this.fixture) {
      return this.fixture.slice(0, limit);
    }
    const tokens = query
      .toLowerCase()
      .split(/\s+/)
      .filter((t) => t.length > 2);
    const slug = tokens.slice(0, 3).join('-') || 'topic';
    return Array.from({ length: limit }, (_, i) => {
      const url = `https://research.example.com/${slug}/article-${i + 1}`;
      return {
        url,
        title: `Insights on ${query} (#${i + 1})`,
        snippet: `Synthetic research result ${i + 1} discussing ${query} at a depth suitable for downstream LLM consumption.`,
        domain: getDomain(url),
        publishedAt: null,
        score: 0.9 - i * 0.05,
      };
    });
  }
}
