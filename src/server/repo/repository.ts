import type { Job, JobStatus, Script, Source, SourceStatus } from '../types';

/**
 * Persistence interface for the backend.
 *
 * Two implementations are provided:
 *   - `MemoryJobRepository`  — in-process, used for tests and dev.
 *   - `SupabaseJobRepository` — talks to Supabase Postgres in production.
 *
 * The two are kept behaviourally identical at the contract level so swapping
 * is a one-liner in `bootstrap.ts`.
 */
export interface JobRepository {
  // Jobs
  createJob(input: NewJob): Promise<Job>;
  getJob(jobId: string): Promise<Job | null>;
  updateJobStatus(jobId: string, status: JobStatus, error?: string | null): Promise<Job>;
  listJobs(userId: string, opts: ListJobsOptions): Promise<JobsPage>;
  deleteJob(jobId: string): Promise<void>;

  // Sources
  createSource(input: NewSource): Promise<Source>;
  updateSource(sourceId: string, patch: SourcePatch): Promise<Source>;
  listSources(jobId: string): Promise<Source[]>;

  // Scripts
  upsertScript(input: NewScript): Promise<Script>;
  getScript(jobId: string): Promise<Script | null>;
}

export interface NewJob {
  userId: string;
  prompt: string;
}

export interface NewSource {
  jobId: string;
  url: string;
  title: string;
  summary: string;
  domain: string;
  publishedAt?: string | null;
  rankScore?: number | null;
}

export interface SourcePatch {
  title?: string;
  summary?: string;
  screenshotPath?: string | null;
  screenshotUrl?: string | null;
  capturedAt?: string | null;
  status?: SourceStatus;
  error?: string | null;
}

export interface NewScript {
  jobId: string;
  title: string;
  hook: string;
  segments: Script['segments'];
  outro: string;
}

export interface ListJobsOptions {
  page: number;
  limit: number;
  status?: JobStatus;
}

export interface JobsPage {
  jobs: Job[];
  total: number;
  page: number;
  limit: number;
}
