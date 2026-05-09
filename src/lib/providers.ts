/**
 * Catalogue of every AI / search provider we accept an API key for.
 *
 * Each entry is opaque to the rest of the app — adding a new provider is
 * a matter of dropping another row in here and (optionally) wiring it in
 * `src/app/api/v1/chat/route.ts` if it's an LLM that should drive chat.
 */
export type ProviderCategory = 'llm' | 'search';

export interface ProviderDefinition {
  id: string;
  name: string;
  category: ProviderCategory;
  description: string;
  keyPlaceholder: string;
  /** Loose regex used purely for client-side prefix validation. */
  keyPattern?: string;
  docsUrl: string;
}

export const PROVIDERS: ProviderDefinition[] = [
  // ─── LLM providers ─────────────────────────────────────────────────────
  {
    id: 'openai',
    name: 'OpenAI',
    category: 'llm',
    description: 'GPT-4o, GPT-4.1, o1, o3 and the rest of the OpenAI lineup.',
    keyPlaceholder: 'sk-…',
    keyPattern: '^sk-',
    docsUrl: 'https://platform.openai.com/api-keys',
  },
  {
    id: 'anthropic',
    name: 'Anthropic',
    category: 'llm',
    description: 'Claude Sonnet, Haiku and Opus models.',
    keyPlaceholder: 'sk-ant-…',
    keyPattern: '^sk-ant-',
    docsUrl: 'https://console.anthropic.com/settings/keys',
  },
  {
    id: 'google',
    name: 'Google Gemini',
    category: 'llm',
    description: 'Gemini 1.5/2.0 Pro and Flash via Google AI Studio.',
    keyPlaceholder: 'AIza…',
    docsUrl: 'https://aistudio.google.com/app/apikey',
  },
  {
    id: 'xai',
    name: 'xAI (Grok)',
    category: 'llm',
    description: 'Grok-2 and Grok-Beta from xAI.',
    keyPlaceholder: 'xai-…',
    keyPattern: '^xai-',
    docsUrl: 'https://console.x.ai/',
  },
  {
    id: 'mistral',
    name: 'Mistral',
    category: 'llm',
    description: 'Mistral Large, Medium and Codestral.',
    keyPlaceholder: 'Your Mistral API key',
    docsUrl: 'https://console.mistral.ai/api-keys/',
  },
  {
    id: 'deepseek',
    name: 'DeepSeek',
    category: 'llm',
    description: 'DeepSeek V3 / R1 reasoning models.',
    keyPlaceholder: 'sk-…',
    keyPattern: '^sk-',
    docsUrl: 'https://platform.deepseek.com/api_keys',
  },
  {
    id: 'groq',
    name: 'Groq',
    category: 'llm',
    description: 'Llama 3.3, Mixtral and DeepSeek hosted on LPU hardware.',
    keyPlaceholder: 'gsk_…',
    keyPattern: '^gsk_',
    docsUrl: 'https://console.groq.com/keys',
  },
  {
    id: 'openrouter',
    name: 'OpenRouter',
    category: 'llm',
    description: 'Unified gateway for 100+ models via a single API key.',
    keyPlaceholder: 'sk-or-…',
    keyPattern: '^sk-or-',
    docsUrl: 'https://openrouter.ai/keys',
  },
  {
    id: 'perplexity',
    name: 'Perplexity',
    category: 'llm',
    description: 'Sonar models with built-in web search grounding.',
    keyPlaceholder: 'pplx-…',
    keyPattern: '^pplx-',
    docsUrl: 'https://www.perplexity.ai/settings/api',
  },
  {
    id: 'cohere',
    name: 'Cohere',
    category: 'llm',
    description: 'Command R+ and embedding models.',
    keyPlaceholder: 'Your Cohere API key',
    docsUrl: 'https://dashboard.cohere.com/api-keys',
  },
  {
    id: 'together',
    name: 'Together AI',
    category: 'llm',
    description: 'Open-weights inference for Llama, Qwen, DeepSeek and more.',
    keyPlaceholder: 'Your Together API key',
    docsUrl: 'https://api.together.xyz/settings/api-keys',
  },
  {
    id: 'fireworks',
    name: 'Fireworks AI',
    category: 'llm',
    description: 'Hosted open models with low-latency serving.',
    keyPlaceholder: 'fw_…',
    keyPattern: '^fw_',
    docsUrl: 'https://fireworks.ai/account/api-keys',
  },
  {
    id: 'cerebras',
    name: 'Cerebras',
    category: 'llm',
    description: 'Wafer-scale Llama inference at extreme throughput.',
    keyPlaceholder: 'csk-…',
    keyPattern: '^csk-',
    docsUrl: 'https://cloud.cerebras.ai',
  },

  // ─── Search providers ──────────────────────────────────────────────────
  {
    id: 'tavily',
    name: 'Tavily Search',
    category: 'search',
    description: 'Primary web-search provider used by the research tool.',
    keyPlaceholder: 'tvly-…',
    keyPattern: '^tvly-',
    docsUrl: 'https://app.tavily.com/home',
  },
  {
    id: 'serper',
    name: 'Serper',
    category: 'search',
    description: 'Google SERP API. Used as a fallback when Tavily is unavailable.',
    keyPlaceholder: 'Your Serper API key',
    docsUrl: 'https://serper.dev/api-key',
  },
  {
    id: 'brave',
    name: 'Brave Search',
    category: 'search',
    description: 'Independent index from Brave. Used as an additional fallback.',
    keyPlaceholder: 'Your Brave Search API token',
    docsUrl: 'https://brave.com/search/api/',
  },
  {
    id: 'exa',
    name: 'Exa',
    category: 'search',
    description: 'Neural search optimized for finding similar content.',
    keyPlaceholder: 'Your Exa API key',
    docsUrl: 'https://dashboard.exa.ai/api-keys',
  },
];

export function getProvider(id: string): ProviderDefinition | undefined {
  return PROVIDERS.find((p) => p.id === id);
}

export const PROVIDER_IDS: string[] = PROVIDERS.map((p) => p.id);
