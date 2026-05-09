import { getDecryptedApiKey } from '@/lib/api-keys-store';
import { DevAuthResolver, type AuthResolver } from './auth';
import { hasAnthropicCredentials, loadEnv, type BackendEnv } from './env';
import { AnthropicLLMProvider, MockLLMProvider, type LLMProvider } from './llm';
import { MemoryJobPubSub, type JobPubSub } from './pubsub';
import { MemoryJobQueue, type JobQueue } from './queue';
import { MemoryRateLimiter, type RateLimiter } from './rate-limit';
import { MemoryJobRepository, type JobRepository } from './repo';
import {
  BraveSearchProvider,
  ChainSearchProvider,
  MockSearchProvider,
  SerperSearchProvider,
  TavilySearchProvider,
  type WebSearchProvider,
} from './search';
import { MockScreenshotter, registerScreenshotWorker, type Screenshotter } from './screenshot';
import { MemoryScreenshotStorage, type ScreenshotStorage } from './storage';

/**
 * The wired-up backend. A single instance is built lazily on first
 * import and reused for the lifetime of the Next.js process.
 */
export interface Backend {
  env: BackendEnv;
  repo: JobRepository;
  queue: JobQueue;
  pubsub: JobPubSub;
  storage: ScreenshotStorage;
  llm: LLMProvider;
  search: WebSearchProvider;
  screenshotter: Screenshotter;
  rateLimiter: RateLimiter;
  auth: AuthResolver;
}

let cached: Backend | null = null;

/**
 * Lazy backend factory.
 *
 * Override individual fields by passing `init` — useful for tests that
 * want a fully real backend except for one collaborator (e.g. real repo,
 * mock LLM). When called with no args, returns the singleton.
 */
export async function getBackend(init: Partial<Backend> = {}): Promise<Backend> {
  if (cached && Object.keys(init).length === 0) {
    return cached;
  }
  const env = init.env ?? loadEnv();
  const repo = init.repo ?? new MemoryJobRepository();
  const queue = init.queue ?? new MemoryJobQueue();
  const pubsub = init.pubsub ?? new MemoryJobPubSub();
  const storage = init.storage ?? new MemoryScreenshotStorage();
  const llm = init.llm ?? (await pickLLM(env));
  const search = init.search ?? (await pickSearch(env));
  const screenshotter = init.screenshotter ?? new MockScreenshotter();
  const rateLimiter =
    init.rateLimiter ?? new MemoryRateLimiter(env.jobsPerHourPerUser, 60 * 60 * 1000);
  const auth = init.auth ?? new DevAuthResolver();

  registerScreenshotWorker({ queue, repo, pubsub, storage, screenshotter });

  const backend: Backend = {
    env,
    repo,
    queue,
    pubsub,
    storage,
    llm,
    search,
    screenshotter,
    rateLimiter,
    auth,
  };
  if (Object.keys(init).length === 0) {
    cached = backend;
  }
  return backend;
}

/** Test helper — clear the singleton between specs. */
export function resetBackend(): void {
  cached = null;
}

async function pickLLM(env: BackendEnv): Promise<LLMProvider> {
  if (hasAnthropicCredentials(env) && env.anthropicApiKey) {
    return new AnthropicLLMProvider(env.anthropicApiKey);
  }
  // Fall back to per-user encrypted key store if available.
  const userKey = await getDecryptedApiKey('anthropic').catch(() => null);
  if (userKey && !env.forceInMemory) {
    return new AnthropicLLMProvider(userKey);
  }
  return new MockLLMProvider();
}

async function pickSearch(env: BackendEnv): Promise<WebSearchProvider> {
  const providers: WebSearchProvider[] = [];

  const tavilyKey = env.tavilyApiKey ?? (await getDecryptedApiKey('tavily').catch(() => null));
  if (tavilyKey && !env.forceInMemory) {
    providers.push(new TavilySearchProvider(tavilyKey));
  }
  const serperKey = env.serperApiKey ?? (await getDecryptedApiKey('serper').catch(() => null));
  if (serperKey && !env.forceInMemory) {
    providers.push(new SerperSearchProvider(serperKey));
  }
  const braveKey = env.braveApiKey ?? (await getDecryptedApiKey('brave').catch(() => null));
  if (braveKey && !env.forceInMemory) {
    providers.push(new BraveSearchProvider(braveKey));
  }
  if (providers.length === 0) {
    return new MockSearchProvider();
  }
  if (providers.length === 1) {
    return providers[0];
  }
  return new ChainSearchProvider(providers);
}
