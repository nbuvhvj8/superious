import { describe, expect, it } from 'vitest';
import {
  emptyAgentState,
  queryPlannerNode,
  screenshotDispatcherNode,
  scriptWriterNode,
  sourceRankerNode,
  webResearcherNode,
} from '@/server/agent';
import type { LLMProvider } from '@/server/llm';
import { MockLLMProvider } from '@/server/llm';
import { MemoryJobPubSub } from '@/server/pubsub';
import { MemoryJobQueue } from '@/server/queue';
import { MemoryJobRepository } from '@/server/repo';
import { MockSearchProvider } from '@/server/search';
import type { JobEvent, ScriptOutput, SearchResult, Source } from '@/server/types';

class StubLLM implements LLMProvider {
  constructor(private readonly impl: () => string) {}
  async complete(): Promise<string> {
    return this.impl();
  }
}

const seed = async () => {
  const repo = new MemoryJobRepository();
  const job = await repo.createJob({ userId: 'u1', prompt: 'tell me about solar power' });
  return { repo, state: emptyAgentState({ jobId: job.id, userId: 'u1', prompt: job.prompt }) };
};

describe('queryPlannerNode', () => {
  it('returns 3-5 queries when LLM cooperates', async () => {
    const { state } = await seed();
    const out = await queryPlannerNode(state, new MockLLMProvider());
    expect(out.queries.length).toBeGreaterThanOrEqual(3);
    expect(out.queries.length).toBeLessThanOrEqual(5);
  });

  it('falls back gracefully on garbage LLM output', async () => {
    const { state } = await seed();
    const out = await queryPlannerNode(state, new StubLLM(() => 'not json at all'));
    expect(out.queries.length).toBeGreaterThanOrEqual(3);
    expect(out.queries.length).toBeLessThanOrEqual(5);
  });

  it('records an error when the LLM call itself throws', async () => {
    const { state } = await seed();
    const out = await queryPlannerNode(
      state,
      new StubLLM(() => {
        throw new Error('rate-limited');
      })
    );
    expect(out.errors.length).toBeGreaterThan(0);
    expect(out.queries.length).toBeGreaterThanOrEqual(3);
  });

  it('does not include duplicate queries', async () => {
    const { state } = await seed();
    const out = await queryPlannerNode(
      state,
      new StubLLM(() => JSON.stringify(['a', 'a', 'a', 'b', 'c']))
    );
    expect(new Set(out.queries).size).toBe(out.queries.length);
  });
});

describe('webResearcherNode', () => {
  it('aggregates and dedupes results across queries', async () => {
    const { state } = await seed();
    const initial = { ...state, queries: ['a', 'b'] };
    const out = await webResearcherNode(initial, new MockSearchProvider());
    expect(out.rawResults.length).toBeGreaterThan(0);
    const urls = out.rawResults.map((r) => r.url);
    expect(new Set(urls).size).toBe(urls.length);
  });

  it('records errors per-query without aborting the pipeline', async () => {
    const { state } = await seed();
    const provider = {
      async search(q: string): Promise<SearchResult[]> {
        if (q === 'bad') throw new Error('rate-limited');
        return [
          { url: 'https://x.com/a', title: 'a', snippet: '', domain: 'x.com', publishedAt: null, score: 1 },
        ];
      },
    };
    const out = await webResearcherNode({ ...state, queries: ['bad', 'ok'] }, provider);
    expect(out.errors.length).toBe(1);
    expect(out.rawResults).toHaveLength(1);
  });
});

describe('sourceRankerNode', () => {
  it('persists ranked sources in pending status', async () => {
    const { repo, state } = await seed();
    const initial = {
      ...state,
      rawResults: [
        { url: 'https://a.com/1', title: 'a', snippet: '', domain: 'a.com', publishedAt: null, score: 1 },
        { url: 'https://b.com/1', title: 'b', snippet: '', domain: 'b.com', publishedAt: null, score: 0.5 },
      ],
    };
    const out = await sourceRankerNode(initial, new MockLLMProvider(), repo);
    expect(out.sources.length).toBe(2);
    expect(out.sources.every((s: Source) => s.status === 'pending')).toBe(true);
    expect(await repo.listSources(state.jobId)).toHaveLength(2);
  });

  it('falls back to raw scores if LLM returns nothing useful', async () => {
    const { repo, state } = await seed();
    const initial = {
      ...state,
      rawResults: [
        { url: 'https://a.com/1', title: 'a', snippet: '', domain: 'a.com', publishedAt: null, score: 0.1 },
        { url: 'https://b.com/1', title: 'b', snippet: '', domain: 'b.com', publishedAt: null, score: 0.9 },
      ],
    };
    const out = await sourceRankerNode(
      initial,
      new StubLLM(() => 'not even json'),
      repo
    );
    expect(out.sources.length).toBe(2);
  });
});

describe('screenshotDispatcherNode', () => {
  it('publishes a per-source completion signal and re-reads from the repo', async () => {
    const { repo, state } = await seed();
    const queue = new MemoryJobQueue();
    const pubsub = new MemoryJobPubSub();

    const s1 = await repo.createSource({
      jobId: state.jobId,
      url: 'https://a.com/1',
      title: 'a',
      summary: '',
      domain: 'a.com',
    });

    queue.registerWorker<{ jobId: string; sourceId: string; url: string }>(
      'screenshot',
      async (payload) => {
        await repo.updateSource(payload.sourceId, {
          status: 'done',
          screenshotPath: 'screenshots/x.png',
        });
        await pubsub.publish(payload.jobId, {
          type: 'source',
          source: { ...s1, status: 'done', screenshotPath: 'screenshots/x.png' },
        });
      }
    );

    const initial = { ...state, sources: [s1] };
    const out = await screenshotDispatcherNode(initial, queue, repo, pubsub, { timeoutMs: 1_000 });
    await queue.drain();
    expect(out.sources[0].status).toBe('done');
  });

  it('does not block forever if a screenshot worker never replies', async () => {
    const { repo, state } = await seed();
    const queue = new MemoryJobQueue();
    const pubsub = new MemoryJobPubSub();
    const s1 = await repo.createSource({
      jobId: state.jobId,
      url: 'https://a.com/1',
      title: 'a',
      summary: '',
      domain: 'a.com',
    });
    queue.registerWorker('screenshot', async () => {
      // never publishes a `source` event
    });
    const out = await screenshotDispatcherNode(
      { ...state, sources: [s1] },
      queue,
      repo,
      pubsub,
      { timeoutMs: 50 }
    );
    expect(out.sources).toHaveLength(1);
  });
});

describe('scriptWriterNode', () => {
  it('persists a parsed script and returns it on state', async () => {
    const { repo, state } = await seed();
    const sources: Source[] = [
      {
        id: 'src-1',
        jobId: state.jobId,
        url: 'https://a.com',
        title: 'A',
        summary: 'sum',
        domain: 'a.com',
        publishedAt: null,
        rank: 1,
        screenshotPath: null,
        screenshotUrl: null,
        status: 'done',
        capturedAt: null,
      },
    ];
    const out = await scriptWriterNode({ ...state, sources }, new MockLLMProvider(), repo);
    expect(out.script).not.toBeNull();
    const persisted = await repo.getScript(state.jobId);
    expect(persisted).not.toBeNull();
  });

  it('produces a synthetic script if the LLM output is unparseable', async () => {
    const { repo, state } = await seed();
    const out = await scriptWriterNode(
      { ...state, sources: [] },
      new StubLLM(() => 'definitely not script json'),
      repo
    );
    expect(out.script).not.toBeNull();
    const cast = out.script as ScriptOutput;
    expect(cast.segments.length).toBeGreaterThan(0);
    expect(out.errors.length).toBeGreaterThan(0);
  });
});

describe('agent fan-in stays event-correct', () => {
  it('publishes status events through the pipeline (smoke)', async () => {
    const { repo, state } = await seed();
    const pubsub = new MemoryJobPubSub();
    await repo.updateJobStatus(state.jobId, 'researching');
    await pubsub.publish(state.jobId, { type: 'status', status: 'researching' });
    expect(pubsub.history(state.jobId).map((e: JobEvent) => e.type)).toContain('status');
  });
});
