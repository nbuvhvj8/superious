import { describe, expect, it } from 'vitest';
import { MockLLMProvider } from '@/server/llm';

describe('MockLLMProvider', () => {
  it('returns query-planner JSON when system prompt asks for it', async () => {
    const llm = new MockLLMProvider();
    const out = await llm.complete([
      { role: 'system', content: 'SUPERIOUS_QUERY_PLANNER' },
      { role: 'user', content: 'tell me about solar power' },
    ]);
    const parsed = JSON.parse(out) as string[];
    expect(Array.isArray(parsed)).toBe(true);
    expect(parsed.length).toBeGreaterThanOrEqual(3);
  });

  it('returns ranker JSON when system prompt asks for it', async () => {
    const llm = new MockLLMProvider();
    const out = await llm.complete([
      { role: 'system', content: 'SUPERIOUS_SOURCE_RANKER' },
      {
        role: 'user',
        content: 'Candidates: id:src-1 — A\nid:src-2 — B\nid:src-3 — C',
      },
    ]);
    const parsed = JSON.parse(out) as string[];
    expect(Array.isArray(parsed)).toBe(true);
    expect(parsed[0]).toBe('src-1');
  });

  it('returns a fully-formed script when system prompt asks for it', async () => {
    const llm = new MockLLMProvider();
    const out = await llm.complete([
      { role: 'system', content: 'SUPERIOUS_SCRIPT_WRITER' },
      { role: 'user', content: 'write me a video script about pizza' },
    ]);
    const parsed = JSON.parse(out) as {
      title: string;
      hook: string;
      segments: unknown[];
      outro: string;
    };
    expect(parsed.title).toBeTruthy();
    expect(parsed.hook).toBeTruthy();
    expect(parsed.outro).toBeTruthy();
    expect(parsed.segments.length).toBeGreaterThan(0);
  });

  it('honours per-call overrides', async () => {
    const llm = new MockLLMProvider({
      queryPlanner: () => JSON.stringify(['custom one', 'custom two', 'custom three']),
    });
    const out = await llm.complete([
      { role: 'system', content: 'SUPERIOUS_QUERY_PLANNER' },
      { role: 'user', content: 'x' },
    ]);
    expect(JSON.parse(out)).toEqual(['custom one', 'custom two', 'custom three']);
  });

  it('echoes user content for unknown system prompts', async () => {
    const llm = new MockLLMProvider();
    const out = await llm.complete([
      { role: 'system', content: 'something-else' },
      { role: 'user', content: 'hello' },
    ]);
    expect(out).toContain('hello');
  });
});
