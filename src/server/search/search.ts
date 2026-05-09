import type { SearchResult } from '../types';

/**
 * Web-search provider contract. Concrete implementations adapt Tavily,
 * Serper, Brave, etc. to a single normalised result shape.
 */
export interface WebSearchProvider {
  readonly id: 'tavily' | 'serper' | 'brave' | 'mock';
  search(query: string, opts: WebSearchOptions): Promise<SearchResult[]>;
}

export interface WebSearchOptions {
  maxResults?: number;
  /** Convenience alias for `maxResults` so callers can use the more idiomatic `limit`. */
  limit?: number;
  dateRange?: 'day' | 'week' | 'month' | 'year';
}

export function getDomain(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return '';
  }
}
