import type { LLMMessage, LLMOptions, LLMProvider } from './llm';

interface AnthropicResponse {
  content?: Array<{ type: string; text?: string }>;
  error?: { type?: string; message?: string };
}

type FetchFn = typeof fetch;

const DEFAULT_MODEL = 'claude-sonnet-4-20250514';
const DEFAULT_MAX_TOKENS = 2048;

/**
 * Anthropic Messages API adapter.
 *
 * Non-streaming for now — the script_writer node only needs the final
 * payload. Streaming is handled separately at the HTTP layer for chat.
 */
export class AnthropicLLMProvider implements LLMProvider {
  readonly id = 'anthropic' as const;

  constructor(
    private readonly apiKey: string,
    private readonly fetcher: FetchFn = fetch
  ) {}

  async complete(messages: LLMMessage[], opts: LLMOptions = {}): Promise<string> {
    const system = messages.find((m) => m.role === 'system')?.content;
    const conversation = messages.filter((m) => m.role !== 'system');
    const res = await this.fetcher('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': this.apiKey,
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: opts.model ?? DEFAULT_MODEL,
        max_tokens: opts.maxTokens ?? DEFAULT_MAX_TOKENS,
        temperature: opts.temperature,
        system,
        messages: conversation.map((m) => ({ role: m.role, content: m.content })),
      }),
    });
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(`Anthropic ${res.status}: ${text.slice(0, 300)}`);
    }
    const data = (await res.json()) as AnthropicResponse;
    if (data.error) {
      throw new Error(`Anthropic error: ${data.error.message ?? data.error.type}`);
    }
    const text = (data.content ?? [])
      .filter((c) => c.type === 'text' && typeof c.text === 'string')
      .map((c) => c.text)
      .join('');
    return text;
  }
}
