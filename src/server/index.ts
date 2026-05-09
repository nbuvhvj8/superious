/**
 * Public re-exports for the Outlier backend framework.
 *
 * API route handlers and external callers should import from `@/server`
 * rather than reaching into individual subdirectories.
 */
export type {
  AgentState,
  Job,
  JobEvent,
  JobStatus,
  ScriptOutput,
  ScriptSegment,
  Script,
  SearchResult,
  Source,
  SourceStatus,
} from './types';

export {
  createJobSchema,
  listJobsQuerySchema,
  parseScriptOutput,
  scriptOutputSchema,
  scriptSegmentSchema,
} from './schemas';

export type { CreateJobInput, ListJobsQuery, ScriptOutputParsed } from './schemas';

export {
  loadEnv,
  hasAnthropicCredentials,
  hasRedisCredentials,
  hasSupabaseCredentials,
} from './env';
export type { BackendEnv } from './env';

export { newId, newToken, setIdGenerator, resetIdGenerator } from './ids';
export { getClock, setClock, resetClock, fakeClock } from './clock';

export { MemoryJobRepository } from './repo';
export type {
  JobRepository,
  JobsPage,
  ListJobsOptions,
  NewJob,
  NewScript,
  NewSource,
  SourcePatch,
} from './repo';

export { MemoryJobQueue } from './queue';
export type { JobQueue, EnqueueOptions, WorkerHandler } from './queue';

export { MemoryJobPubSub } from './pubsub';
export type { JobPubSub, Unsubscribe } from './pubsub';

export { MemoryScreenshotStorage } from './storage';
export type { ScreenshotStorage, UploadOptions, UploadedFile } from './storage';

export {
  BraveSearchProvider,
  ChainSearchProvider,
  MockSearchProvider,
  SerperSearchProvider,
  TavilySearchProvider,
  getDomain,
} from './search';
export type { WebSearchOptions, WebSearchProvider } from './search';

export { AnthropicLLMProvider, MockLLMProvider } from './llm';
export type { LLMMessage, LLMOptions, LLMProvider, MockResponses } from './llm';

export {
  MockScreenshotter,
  SsrfError,
  assertSafeUrl,
  isPrivateIp,
  registerScreenshotWorker,
  SCREENSHOT_QUEUE,
} from './screenshot';
export type { ScreenshotJobPayload, ScreenshotResult, Screenshotter } from './screenshot';

export {
  emptyAgentState,
  queryPlannerNode,
  runAgentGraph,
  screenshotDispatcherNode,
  scriptWriterNode,
  sourceRankerNode,
  webResearcherNode,
} from './agent';
export type { AgentGraphDeps, AgentGraphRun } from './agent';

export { MemoryRateLimiter } from './rate-limit';
export type { RateLimitResult, RateLimiter } from './rate-limit';

export { DevAuthResolver, SupabaseAuthResolver } from './auth';
export type { AuthResolver, AuthenticatedUser } from './auth';

export { getBackend, resetBackend } from './bootstrap';
export type { Backend } from './bootstrap';

export { RESEARCH_QUEUE, registerResearchWorker, startResearchJob } from './orchestrator';
export type { ResearchJobPayload } from './orchestrator';
