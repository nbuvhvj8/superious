import { getDecryptedApiKey } from '@/lib/api-keys-store';
import { DevAuthResolver, type AuthResolver, SupabaseAuthResolver } from './auth';
import { hasAnthropicCredentials, loadEnv, type BackendEnv } from './env';
import { AnthropicLLMProvider, MockLLMProvider, type LLMProvider } from './llm';
import { MemoryRateLimiter, type RateLimiter } from './rate-limit';
import { MemoryJobRepository, type JobRepository } from './repo';
import { MemoryScreenshotStorage, type ScreenshotStorage } from './storage';

export type { AuthenticatedUser } from './auth';

export interface Backend {
  env: BackendEnv;
  repo: JobRepository;
  storage: ScreenshotStorage;
  llm: LLMProvider;
  rateLimiter: RateLimiter;
  auth: AuthResolver;
}

let cached: Backend | null = null;

export async function getBackend(init: Partial<Backend> = {}): Promise<Backend> {
  if (cached && Object.keys(init).length === 0) {
    return cached;
  }
  const env = init.env ?? loadEnv();
  const repo = init.repo ?? new MemoryJobRepository();
  const storage = init.storage ?? new MemoryScreenshotStorage();
  const llm = init.llm ?? (await pickLLM(env));
  const rateLimiter =
    init.rateLimiter ?? new MemoryRateLimiter(env.jobsPerHourPerUser, 60 * 60 * 1000);

  let auth: AuthResolver;
  if (init.auth) {
    auth = init.auth;
  } else if (env.supabaseUrl && env.supabaseAnonKey) {
    auth = new SupabaseAuthResolver();
  } else if (process.env.NODE_ENV === 'development' || env.forceInMemory) {
    auth = new DevAuthResolver();
  } else {
    throw new Error('No authentication resolver provided and production environment is not configured.');
  }

  const backend: Backend = {
    env,
    repo,
    storage,
    llm,
    rateLimiter,
    auth,
  };
  if (Object.keys(init).length === 0) {
    cached = backend;
  }
  return backend;
}

export function resetBackend(): void {
  cached = null;
}

async function pickLLM(env: BackendEnv): Promise<LLMProvider> {
  if (hasAnthropicCredentials(env) && env.anthropicApiKey) {
    return new AnthropicLLMProvider(env.anthropicApiKey);
  }
  const userKey = await getDecryptedApiKey('anthropic').catch(() => null);
  if (userKey && !env.forceInMemory) {
    return new AnthropicLLMProvider(userKey);
  }
  return new MockLLMProvider();
}
