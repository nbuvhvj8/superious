import type { SearchResult } from '../types';
import type { WebSearchOptions, WebSearchProvider } from './search';

/**
 * Failover wrapper that tries each provider in order and returns the first
 * one to yield a non-empty result set.
 *
 * If every provider throws, the chain throws an aggregate error containing
 * all individual messages. If a provider returns zero results, the chain
 * advances to the next provider rather than treating empty as success.
 */
export class ChainSearchProvider implements WebSearchProvider {
  readonly id = 'tavily' as const; // chain reports as the primary by default

  constructor(private readonly providers: readonly WebSearchProvider[]) {
    if (providers.length === 0) {
      throw new Error('ChainSearchProvider requires at least one provider');
    }
  }

  async search(query: string, opts: WebSearchOptions): Promise<SearchResult[]> {
    const errors: string[] = [];
    for (const p of this.providers) {
      try {
        const results = await p.search(query, opts);
        if (results.length > 0) return results;
        errors.push(`${p.id}: zero results`);
      } catch (err) {
        errors.push(`${p.id}: ${err instanceof Error ? err.message : String(err)}`);
      }
    }
    throw new Error(`All search providers exhausted: ${errors.join('; ')}`);
  }
}
