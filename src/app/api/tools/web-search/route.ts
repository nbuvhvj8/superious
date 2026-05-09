import { NextRequest, NextResponse } from 'next/server';
import { getDecryptedApiKey } from '@/lib/api-keys-store';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Web Search Tool
 *
 * The AI's window onto the live web. Tries the providers in priority order
 * (Tavily → Serper → Brave) using the user's encrypted API keys. The first
 * one that has a configured key and returns at least one result wins.
 *
 * Output is a normalised array of `{url, title, snippet, ...}` so that every
 * downstream consumer (chat orchestrator, source_ranker, citation builder)
 * sees the same shape regardless of which provider fulfilled the request.
 */

export interface WebSearchResult {
  url: string;
  title: string;
  snippet: string;
  domain: string;
  publishedAt?: string | null;
  score?: number | null;
}

export interface WebSearchResponse {
  query: string;
  provider: 'tavily' | 'serper' | 'brave';
  results: WebSearchResult[];
  totalResults: number;
}

interface SearchInput {
  query?: string;
  maxResults?: number;
  dateRange?: 'day' | 'week' | 'month' | 'year';
  provider?: 'auto' | 'tavily' | 'serper' | 'brave';
}

const DEFAULT_MAX_RESULTS = 8;

function getDomain(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return '';
  }
}

async function searchTavily(
  apiKey: string,
  query: string,
  maxResults: number,
  dateRange?: SearchInput['dateRange']
): Promise<WebSearchResult[]> {
  const res = await fetch('https://api.tavily.com/search', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      api_key: apiKey,
      query,
      search_depth: 'basic',
      include_answer: false,
      include_raw_content: false,
      max_results: maxResults,
      time_range: dateRange,
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Tavily error ${res.status}: ${text.slice(0, 200)}`);
  }
  const data = (await res.json()) as {
    results?: Array<{
      url: string;
      title: string;
      content: string;
      score?: number;
      published_date?: string;
    }>;
  };
  return (data.results ?? []).map((r) => ({
    url: r.url,
    title: r.title,
    snippet: r.content,
    domain: getDomain(r.url),
    publishedAt: r.published_date ?? null,
    score: r.score ?? null,
  }));
}

async function searchSerper(
  apiKey: string,
  query: string,
  maxResults: number
): Promise<WebSearchResult[]> {
  const res = await fetch('https://google.serper.dev/search', {
    method: 'POST',
    headers: {
      'X-API-KEY': apiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ q: query, num: maxResults }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Serper error ${res.status}: ${text.slice(0, 200)}`);
  }
  const data = (await res.json()) as {
    organic?: Array<{ link: string; title: string; snippet: string; date?: string }>;
  };
  return (data.organic ?? []).slice(0, maxResults).map((r) => ({
    url: r.link,
    title: r.title,
    snippet: r.snippet,
    domain: getDomain(r.link),
    publishedAt: r.date ?? null,
  }));
}

async function searchBrave(
  apiKey: string,
  query: string,
  maxResults: number
): Promise<WebSearchResult[]> {
  const url = new URL('https://api.search.brave.com/res/v1/web/search');
  url.searchParams.set('q', query);
  url.searchParams.set('count', String(Math.min(maxResults, 20)));
  const res = await fetch(url.toString(), {
    headers: {
      Accept: 'application/json',
      'X-Subscription-Token': apiKey,
    },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Brave error ${res.status}: ${text.slice(0, 200)}`);
  }
  const data = (await res.json()) as {
    web?: {
      results?: Array<{ url: string; title: string; description: string; age?: string }>;
    };
  };
  return (data.web?.results ?? []).slice(0, maxResults).map((r) => ({
    url: r.url,
    title: r.title,
    snippet: r.description,
    domain: getDomain(r.url),
    publishedAt: r.age ?? null,
  }));
}

async function runProvider(
  provider: 'tavily' | 'serper' | 'brave',
  query: string,
  maxResults: number,
  dateRange?: SearchInput['dateRange']
): Promise<WebSearchResult[] | null> {
  const apiKey = await getDecryptedApiKey(provider);
  if (!apiKey) return null;
  switch (provider) {
    case 'tavily':
      return searchTavily(apiKey, query, maxResults, dateRange);
    case 'serper':
      return searchSerper(apiKey, query, maxResults);
    case 'brave':
      return searchBrave(apiKey, query, maxResults);
  }
}

async function handleSearch(input: SearchInput): Promise<NextResponse> {
  const query = input.query?.trim();
  if (!query) {
    return NextResponse.json({ error: 'query is required' }, { status: 400 });
  }
  const maxResults = Math.min(Math.max(input.maxResults ?? DEFAULT_MAX_RESULTS, 1), 20);
  const order: Array<'tavily' | 'serper' | 'brave'> =
    input.provider && input.provider !== 'auto' ? [input.provider] : ['tavily', 'serper', 'brave'];

  const errors: string[] = [];
  for (const provider of order) {
    try {
      const results = await runProvider(provider, query, maxResults, input.dateRange);
      if (results === null) continue; // no key configured for this provider
      if (results.length === 0) {
        errors.push(`${provider}: zero results`);
        continue;
      }
      const payload: WebSearchResponse = {
        query,
        provider,
        results,
        totalResults: results.length,
      };
      return NextResponse.json(payload);
    } catch (err) {
      errors.push(
        err instanceof Error ? `${provider}: ${err.message}` : `${provider}: unknown error`
      );
    }
  }

  return NextResponse.json(
    {
      error:
        errors.length > 0
          ? `All search providers failed: ${errors.join('; ')}`
          : 'No search-provider API keys are configured. Add one in Settings → API Configuration.',
    },
    { status: 502 }
  );
}

export async function POST(req: NextRequest) {
  let body: SearchInput;
  try {
    body = (await req.json()) as SearchInput;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }
  return handleSearch(body);
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  return handleSearch({
    query: searchParams.get('q') ?? searchParams.get('query') ?? undefined,
    maxResults: searchParams.has('maxResults') ? Number(searchParams.get('maxResults')) : undefined,
    dateRange: (searchParams.get('dateRange') as SearchInput['dateRange']) ?? undefined,
    provider: (searchParams.get('provider') as SearchInput['provider']) ?? undefined,
  });
}
