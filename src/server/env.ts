/**
 * Typed environment variable loader.
 *
 * Centralising env access here means the rest of the codebase never has to
 * worry about `process.env.X || ''` rituals — and we get a single failure
 * point that clearly tells the developer which variable is missing.
 */

export interface BackendEnv {
  /** When `true`, in-memory adapters are forced regardless of other config. */
  forceInMemory: boolean;

  // Anthropic + search keys (also resolvable per-request from `api-keys-store`).
  anthropicApiKey: string | null;
  tavilyApiKey: string | null;
  serperApiKey: string | null;
  braveApiKey: string | null;

  // Supabase
  supabaseUrl: string | null;
  supabaseAnonKey: string | null;
  supabaseServiceRoleKey: string | null;

  // Redis / BullMQ
  redisUrl: string | null;
  redisToken: string | null;

  // Screenshot worker
  screenshotConcurrency: number;
  screenshotProxyUrl: string | null;

  // Rate limiting
  jobsPerHourPerUser: number;

  // Misc
  isProduction: boolean;
}

function readNumber(name: string, fallback: number): number {
  const raw = process.env[name];
  if (!raw) return fallback;
  const parsed = Number(raw);
  if (!Number.isFinite(parsed)) {
    throw new Error(`Env var ${name} must be a number, got "${raw}"`);
  }
  return parsed;
}

function readString(name: string): string | null {
  const raw = process.env[name];
  if (!raw) return null;
  const trimmed = raw.trim();
  return trimmed === '' ? null : trimmed;
}

export function loadEnv(): BackendEnv {
  return {
    forceInMemory: process.env.SUPERIOUS_FORCE_IN_MEMORY === 'true',
    anthropicApiKey: readString('ANTHROPIC_API_KEY'),
    tavilyApiKey: readString('TAVILY_API_KEY'),
    serperApiKey: readString('SERPER_API_KEY'),
    braveApiKey: readString('BRAVE_API_KEY'),
    supabaseUrl: readString('SUPABASE_URL') ?? readString('NEXT_PUBLIC_SUPABASE_URL'),
    supabaseAnonKey: readString('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
    supabaseServiceRoleKey: readString('SUPABASE_SERVICE_ROLE_KEY'),
    redisUrl: readString('UPSTASH_REDIS_URL') ?? readString('REDIS_URL'),
    redisToken: readString('UPSTASH_REDIS_TOKEN'),
    screenshotConcurrency: readNumber('SCREENSHOT_CONCURRENCY', 3),
    screenshotProxyUrl: readString('SCREENSHOT_PROXY_URL'),
    jobsPerHourPerUser: readNumber('JOBS_PER_HOUR_PER_USER', 10),
    isProduction: process.env.NODE_ENV === 'production',
  };
}

/**
 * Returns true if the runtime has been told to use real Supabase / Redis /
 * Anthropic. When any of these are missing we fall back to the in-memory
 * adapters — which is safe for local dev and required for unit tests.
 */
export function hasSupabaseCredentials(env: BackendEnv): boolean {
  return Boolean(env.supabaseUrl && env.supabaseServiceRoleKey) && !env.forceInMemory;
}

export function hasRedisCredentials(env: BackendEnv): boolean {
  return Boolean(env.redisUrl) && !env.forceInMemory;
}

export function hasAnthropicCredentials(env: BackendEnv): boolean {
  return Boolean(env.anthropicApiKey) && !env.forceInMemory;
}
