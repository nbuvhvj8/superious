/**
 * Shared types for the Superious / Outlier backend.
 *
 * These types are the lingua-franca passed across the agent graph, the
 * persistence layer, the queue, and the API. Everything else in
 * `src/server/*` is built on top of them.
 */

export type JobStatus = 'queued' | 'researching' | 'screenshotting' | 'writing' | 'done' | 'failed';

export type SourceStatus = 'pending' | 'done' | 'failed';

export interface Job {
  id: string;
  userId: string;
  prompt: string;
  status: JobStatus;
  error: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Source {
  id: string;
  jobId: string;
  url: string;
  title: string;
  summary: string;
  domain: string;
  publishedAt: string | null;
  rankScore: number | null;
  screenshotPath: string | null;
  screenshotUrl: string | null;
  capturedAt: string | null;
  status: SourceStatus;
  error: string | null;
}

export interface ScriptSegment {
  order: number;
  heading: string;
  narration: string;
  bRollCues: string[];
  sourceIds: string[];
  durationS: number;
}

export interface Script {
  id: string;
  jobId: string;
  title: string;
  hook: string;
  segments: ScriptSegment[];
  outro: string;
  wordCount: number;
  estimatedDurationS: number;
  createdAt: string;
}

/** Raw search hit returned by a `WebSearchProvider`. */
export interface SearchResult {
  url: string;
  title: string;
  snippet: string;
  domain: string;
  publishedAt: string | null;
  score: number | null;
}

/** Output of the `script_writer` LLM node, before persisting as a `Script`. */
export interface ScriptOutput {
  title: string;
  hook: string;
  segments: ScriptSegment[];
  outro: string;
}

/**
 * Mutable state passed from one agent node to the next.
 *
 * Following the LangGraph convention, every node takes the state in and
 * returns an updated state out — never mutating in place. This makes the
 * pipeline trivially unit-testable and replayable.
 */
export interface AgentState {
  jobId: string;
  userId: string;
  prompt: string;
  queries: string[];
  rawResults: SearchResult[];
  sources: Source[];
  script: ScriptOutput | null;
  errors: string[];
}

/** Public-facing event emitted on the SSE stream. */
export type JobEvent =
  | { type: 'status'; status: JobStatus }
  | { type: 'source'; source: Source }
  | { type: 'script'; script: Script }
  | { type: 'error'; message: string; recoverable: boolean }
  | { type: 'done' };
