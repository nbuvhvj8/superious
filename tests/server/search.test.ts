import { describe, expect, it } from 'vitest';
import { ChainSearchProvider, MockSearchProvider, getDomain } from '@/server/search';
import type { SearchResult } from '@/server/types';
import type { WebSearchOptions, WebSearchProvider } from '@/server/search';

describe('getDomain', () => {
  it('extracts apex hostname', () => {
    expect(getDomain('https://www.example.com/path')).toBe('example.com');
    expect(getDomain('https://news.example.co.uk/x?y=1')).toBe('news.example.co.uk');
  });

  it('returns empty string for malformed urls', () => {
    expect(getDomain('not a url')).toBe('');
  });
});

describe('MockSearchProvider', () => {
  it('returns deterministic results for the same query', async () => {
    const p = new MockSearchProvider();
    const a = await p.search('solar power');
    const b = await p.search('solar power');
    expect(a).toEqual(b);
    expect(a.length).toBeGreaterThan(0);
    expect(a[0].url).toMatch(/^https?:\/\//);
  });

  it('honours fixture overrides', async () => {
    const fixture: SearchResult[] = [
      {
        url: 'https://x.com/a',
        title: 'fixture',
        snippet: 's',
        domain: 'x.com',
        publishedAt: null,
        score: 1,
      },
    ];
    const p = new MockSearchProvider(fixture);
    expect(await p.search('solar power')).toEqual(fixture);
  });

  it('respects opts.limit', async () => {
    const p = new MockSearchProvider();
    const out = await p.search('anything', { limit: 2 });
    expect(out).toHaveLength(2);
  });
});

class StubProvider implements WebSearchProvider {
  constructor(
    private readonly impl: (q: string, opts?: WebSearchOptions) => Promise<SearchResult[]>
  ) {}
  async search(q: string, opts?: WebSearchOptions): Promise<SearchResult[]> {
    return this.impl(q, opts);
  }
}

describe('ChainSearchProvider', () => {
  it('uses the first provider whose result set is non-empty', async () => {
    const calls: string[] = [];
    const empty = new StubProvider(async () => {
      calls.push('empty');
      return [];
    });
    const good = new StubProvider(async () => {
      calls.push('good');
      return [
        {
          url: 'https://x.com',
          title: 't',
          snippet: 's',
          domain: 'x.com',
          publishedAt: null,
          score: 1,
        },
      ];
    });
    const chain = new ChainSearchProvider([empty, good]);
    const out = await chain.search('q');
    expect(out).toHaveLength(1);
    expect(calls).toEqual(['empty', 'good']);
  });

  it('treats throws as failover triggers', async () => {
    const bad = new StubProvider(async () => {
      throw new Error('rate-limited');
    });
    const good = new StubProvider(async () => [
      {
        url: 'https://x.com',
        title: 't',
        snippet: 's',
        domain: 'x.com',
        publishedAt: null,
        score: 1,
      },
    ]);
    const chain = new ChainSearchProvider([bad, good]);
    const out = await chain.search('q');
    expect(out).toHaveLength(1);
  });

  it('throws aggregate if every provider fails', async () => {
    const bad = new StubProvider(async () => {
      throw new Error('boom');
    });
    const chain = new ChainSearchProvider([bad, bad]);
    await expect(chain.search('q')).rejects.toThrow();
  });

  it('rejects empty provider lists at construction', () => {
    expect(() => new ChainSearchProvider([])).toThrow();
  });
});
