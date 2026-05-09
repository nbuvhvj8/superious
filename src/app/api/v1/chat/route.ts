import { NextRequest } from 'next/server';
import { getDecryptedApiKey } from '@/lib/api-keys-store';
import { SUPERIOUS_SYSTEM_BODY } from '@/brain';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Streaming chat endpoint.
 *
 * The client POSTs `{messages, provider?, model?, useWebSearch?, searchResults?}`
 * and we stream back plaintext deltas as SSE `data:` lines so the typewriter
 * renderer on the client can paint tokens as they arrive.
 *
 * Provider is auto-selected from whichever key the user has configured if
 * not specified; we don't lock chat to a single provider.
 */

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface ChatRequestBody {
  messages: ChatMessage[];
  provider?: string;
  model?: string;
  useWebSearch?: boolean;
  searchResults?: Array<{ title: string; url: string; snippet: string }>;
}

const PROVIDER_PRIORITY = [
  'anthropic',
  'openai',
  'google',
  'groq',
  'openrouter',
  'mistral',
  'deepseek',
  'xai',
  'perplexity',
  'together',
  'fireworks',
  'cerebras',
  'cohere',
];

const DEFAULT_MODELS: Record<string, string> = {
  anthropic: 'claude-3-5-sonnet-latest',
  openai: 'gpt-4o-mini',
  google: 'gemini-1.5-flash',
  groq: 'llama-3.3-70b-versatile',
  openrouter: 'openai/gpt-4o-mini',
  mistral: 'mistral-large-latest',
  deepseek: 'deepseek-chat',
  xai: 'grok-2-latest',
  perplexity: 'sonar',
  together: 'meta-llama/Llama-3.3-70B-Instruct-Turbo',
  fireworks: 'accounts/fireworks/models/llama-v3p3-70b-instruct',
  cerebras: 'llama-3.3-70b',
  cohere: 'command-r-plus',
};

function sseEncoder() {
  const encoder = new TextEncoder();
  return {
    delta(text: string): Uint8Array {
      return encoder.encode(`data: ${JSON.stringify({ type: 'delta', text })}\n\n`);
    },
    done(): Uint8Array {
      return encoder.encode(`data: ${JSON.stringify({ type: 'done' })}\n\n`);
    },
    error(message: string): Uint8Array {
      return encoder.encode(`data: ${JSON.stringify({ type: 'error', error: message })}\n\n`);
    },
  };
}

async function pickProvider(preferred?: string): Promise<{ provider: string; key: string } | null> {
  if (preferred) {
    const k = await getDecryptedApiKey(preferred);
    if (k) return { provider: preferred, key: k };
  }
  for (const p of PROVIDER_PRIORITY) {
    const k = await getDecryptedApiKey(p);
    if (k) return { provider: p, key: k };
  }
  return null;
}

function buildSystemPrompt(searchResults?: ChatRequestBody['searchResults']): string {
  const base = SUPERIOUS_SYSTEM_BODY;
  if (!searchResults || searchResults.length === 0) return base;
  const formatted = searchResults
    .slice(0, 8)
    .map(
      (r, i) =>
        `[${i + 1}] ${r.title}\n${r.url}\n${r.snippet?.replace(/\s+/g, ' ').slice(0, 400) ?? ''}`
    )
    .join('\n\n');
  return `${base}\n\nThe following web-search results were retrieved for the user's latest question. Cite them with [n] markers when you reference a specific fact.\n\n${formatted}`;
}

// ─── Provider streamers ────────────────────────────────────────────────────

async function* streamOpenAICompatible(
  baseUrl: string,
  apiKey: string,
  model: string,
  messages: ChatMessage[],
  systemPrompt: string,
  authHeader: 'Authorization' | 'X-API-Key' = 'Authorization'
): AsyncGenerator<string> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  headers[authHeader] = authHeader === 'Authorization' ? `Bearer ${apiKey}` : apiKey;
  const res = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      model,
      stream: true,
      messages: [{ role: 'system', content: systemPrompt }, ...messages],
    }),
  });
  if (!res.ok || !res.body) {
    const text = await res.text().catch(() => '');
    throw new Error(`Upstream ${res.status}: ${text.slice(0, 300)}`);
  }
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() ?? '';
    for (const raw of lines) {
      const line = raw.trim();
      if (!line.startsWith('data:')) continue;
      const payload = line.slice(5).trim();
      if (payload === '[DONE]') return;
      try {
        const parsed = JSON.parse(payload) as {
          choices?: Array<{ delta?: { content?: string } }>;
        };
        const delta = parsed.choices?.[0]?.delta?.content;
        if (delta) yield delta;
      } catch {
        // ignore keep-alive comments / partial chunks
      }
    }
  }
}

async function* streamAnthropic(
  apiKey: string,
  model: string,
  messages: ChatMessage[],
  systemPrompt: string
): AsyncGenerator<string> {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      stream: true,
      system: systemPrompt,
      max_tokens: 2048,
      messages: messages.map((m) => ({
        role: m.role === 'system' ? 'user' : m.role,
        content: m.content,
      })),
    }),
  });
  if (!res.ok || !res.body) {
    const text = await res.text().catch(() => '');
    throw new Error(`Anthropic ${res.status}: ${text.slice(0, 300)}`);
  }
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() ?? '';
    for (const raw of lines) {
      const line = raw.trim();
      if (!line.startsWith('data:')) continue;
      const payload = line.slice(5).trim();
      if (!payload || payload === '[DONE]') continue;
      try {
        const parsed = JSON.parse(payload) as {
          type?: string;
          delta?: { type?: string; text?: string };
        };
        if (parsed.type === 'content_block_delta' && parsed.delta?.text) {
          yield parsed.delta.text;
        }
      } catch {
        // skip
      }
    }
  }
}

async function* streamGoogle(
  apiKey: string,
  model: string,
  messages: ChatMessage[],
  systemPrompt: string
): AsyncGenerator<string> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
    model
  )}:streamGenerateContent?alt=sse&key=${encodeURIComponent(apiKey)}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      systemInstruction: { role: 'system', parts: [{ text: systemPrompt }] },
      contents: messages.map((m) => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }],
      })),
    }),
  });
  if (!res.ok || !res.body) {
    const text = await res.text().catch(() => '');
    throw new Error(`Google ${res.status}: ${text.slice(0, 300)}`);
  }
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() ?? '';
    for (const raw of lines) {
      const line = raw.trim();
      if (!line.startsWith('data:')) continue;
      const payload = line.slice(5).trim();
      if (!payload) continue;
      try {
        const parsed = JSON.parse(payload) as {
          candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
        };
        for (const part of parsed.candidates?.[0]?.content?.parts ?? []) {
          if (part.text) yield part.text;
        }
      } catch {
        // skip
      }
    }
  }
}

function getStreamForProvider(
  provider: string,
  apiKey: string,
  model: string,
  messages: ChatMessage[],
  systemPrompt: string
): AsyncGenerator<string> {
  switch (provider) {
    case 'anthropic':
      return streamAnthropic(apiKey, model, messages, systemPrompt);
    case 'google':
      return streamGoogle(apiKey, model, messages, systemPrompt);
    case 'openai':
      return streamOpenAICompatible(
        'https://api.openai.com/v1',
        apiKey,
        model,
        messages,
        systemPrompt
      );
    case 'groq':
      return streamOpenAICompatible(
        'https://api.groq.com/openai/v1',
        apiKey,
        model,
        messages,
        systemPrompt
      );
    case 'openrouter':
      return streamOpenAICompatible(
        'https://openrouter.ai/api/v1',
        apiKey,
        model,
        messages,
        systemPrompt
      );
    case 'mistral':
      return streamOpenAICompatible(
        'https://api.mistral.ai/v1',
        apiKey,
        model,
        messages,
        systemPrompt
      );
    case 'deepseek':
      return streamOpenAICompatible(
        'https://api.deepseek.com/v1',
        apiKey,
        model,
        messages,
        systemPrompt
      );
    case 'xai':
      return streamOpenAICompatible('https://api.x.ai/v1', apiKey, model, messages, systemPrompt);
    case 'perplexity':
      return streamOpenAICompatible(
        'https://api.perplexity.ai',
        apiKey,
        model,
        messages,
        systemPrompt
      );
    case 'together':
      return streamOpenAICompatible(
        'https://api.together.xyz/v1',
        apiKey,
        model,
        messages,
        systemPrompt
      );
    case 'fireworks':
      return streamOpenAICompatible(
        'https://api.fireworks.ai/inference/v1',
        apiKey,
        model,
        messages,
        systemPrompt
      );
    case 'cerebras':
      return streamOpenAICompatible(
        'https://api.cerebras.ai/v1',
        apiKey,
        model,
        messages,
        systemPrompt
      );
    case 'cohere':
      // Cohere has its own API shape; treated as a future extension.
      throw new Error('Cohere streaming is not yet wired up.');
    default:
      throw new Error(`Provider ${provider} does not support streaming chat.`);
  }
}

// ─── Demo (keyless) fallback ──────────────────────────────────────────────

async function* demoStream(messages: ChatMessage[]): AsyncGenerator<string> {
  const last = messages[messages.length - 1]?.content ?? '';
  const reply =
    `I'm running in demo mode because no provider API key has been configured yet. ` +
    `Open Settings → API Configuration to add a key for any provider you'd like to use ` +
    `(OpenAI, Anthropic, Google, Groq, OpenRouter and more are supported). ` +
    `\n\nYour message was: "${last.slice(0, 200)}${last.length > 200 ? '…' : ''}"`;
  for (const chunk of reply.match(/\S+\s*|\s+/g) ?? [reply]) {
    yield chunk;
    await new Promise((r) => setTimeout(r, 30));
  }
}

// ─── Route handler ─────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  let body: ChatRequestBody;
  try {
    body = (await req.json()) as ChatRequestBody;
  } catch {
    return new Response('Invalid JSON', { status: 400 });
  }
  if (!Array.isArray(body.messages) || body.messages.length === 0) {
    return new Response('messages is required', { status: 400 });
  }

  const sse = sseEncoder();
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        const picked = await pickProvider(body.provider);
        const systemPrompt = buildSystemPrompt(body.searchResults);
        const generator = picked
          ? getStreamForProvider(
              picked.provider,
              picked.key,
              body.model || DEFAULT_MODELS[picked.provider] || 'gpt-4o-mini',
              body.messages,
              systemPrompt
            )
          : demoStream(body.messages);

        for await (const delta of generator) {
          if (delta) controller.enqueue(sse.delta(delta));
        }
        controller.enqueue(sse.done());
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown streaming error';
        controller.enqueue(sse.error(message));
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    status: 200,
    headers: {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
    },
  });
}
