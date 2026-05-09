/**
 * LLM provider contract.
 *
 * The agent only needs two operations:
 *   - `complete()` for short structured calls (query planning, ranking).
 *   - `completeJson()` for the script writer, which must return parseable JSON.
 *
 * Providers are responsible for their own retries / rate limiting; the
 * agent code stays oblivious.
 */
export interface LLMMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface LLMOptions {
  /** Provider-specific model name (e.g. `claude-sonnet-4-20250514`). */
  model?: string;
  maxTokens?: number;
  temperature?: number;
}

export interface LLMProvider {
  readonly id: 'anthropic' | 'mock';
  complete(messages: LLMMessage[], opts?: LLMOptions): Promise<string>;
}
