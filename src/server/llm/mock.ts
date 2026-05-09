import type { LLMMessage, LLMOptions, LLMProvider } from './llm';

/**
 * Deterministic LLM stand-in used in tests and the keyless dev pipeline.
 *
 * The provider inspects the system prompt to decide which fixture to
 * return, so a single instance can serve every node in the graph (query
 * planner, ranker, script writer) without any per-call wiring.
 *
 * Behaviours:
 *   - "decompose"  → returns a JSON array of 3 search queries derived from
 *     the most recent user message.
 *   - "rank"       → returns a JSON array of source-id strings.
 *   - "script"     → returns a fully-formed `ScriptOutput` JSON document
 *     that references the source ids passed in the user message.
 *   - default       → echoes the user message.
 */
export class MockLLMProvider implements LLMProvider {
  readonly id = 'mock' as const;

  constructor(private readonly overrides: Partial<MockResponses> = {}) {}

  async complete(messages: LLMMessage[], _opts: LLMOptions = {}): Promise<string> {
    const system = messages.find((m) => m.role === 'system')?.content ?? '';
    const lastUser = [...messages].reverse().find((m) => m.role === 'user')?.content ?? '';

    if (system.includes('SUPERIOUS_QUERY_PLANNER')) {
      return this.overrides.queryPlanner?.(lastUser) ?? this.defaultQueries(lastUser);
    }
    if (system.includes('SUPERIOUS_SOURCE_RANKER')) {
      return this.overrides.sourceRanker?.(lastUser) ?? this.defaultRanking(lastUser);
    }
    if (system.includes('SUPERIOUS_SCRIPT_WRITER')) {
      return this.overrides.scriptWriter?.(lastUser) ?? this.defaultScript(lastUser);
    }
    return this.overrides.default?.(lastUser) ?? lastUser;
  }

  private defaultQueries(prompt: string): string {
    const base = prompt.replace(/[^a-zA-Z0-9 ]+/g, ' ').trim() || 'topic';
    return JSON.stringify([
      `${base} overview`,
      `${base} recent developments`,
      `${base} expert opinions`,
    ]);
  }

  private defaultRanking(input: string): string {
    // Extract every "id:" token from the input — they're the candidate IDs.
    const ids = [...input.matchAll(/id:([a-z0-9-]+)/gi)].map((m) => m[1]);
    return JSON.stringify(ids.slice(0, 8));
  }

  private defaultScript(input: string): string {
    const ids = [...input.matchAll(/id:([a-z0-9-]+)/gi)].map((m) => m[1]);
    const sourceIds = ids.length > 0 ? [ids[0]] : [];
    const promptMatch = input.match(/User prompt: (.+)/i);
    const topic = promptMatch?.[1]?.trim() ?? 'this topic';
    const script = {
      title: `A Researched Look at ${topic}`,
      hook: `What if everything you thought you knew about ${topic} was missing one critical detail?`,
      segments: [
        {
          order: 1,
          heading: 'Background',
          narration: `Here's the context behind ${topic} drawn directly from verified sources.`,
          b_roll_cues: ['archival footage', 'animated timeline'],
          source_ids: sourceIds,
          duration_s: 30,
        },
        {
          order: 2,
          heading: 'Key Findings',
          narration: `These are the three findings that matter most for understanding ${topic}.`,
          b_roll_cues: ['expert interview B-roll', 'data visualisation'],
          source_ids: sourceIds,
          duration_s: 60,
        },
      ],
      outro: `Subscribe for more research-backed deep dives on ${topic}.`,
    };
    return JSON.stringify(script);
  }
}

export interface MockResponses {
  queryPlanner: (userInput: string) => string;
  sourceRanker: (userInput: string) => string;
  scriptWriter: (userInput: string) => string;
  default: (userInput: string) => string;
}
