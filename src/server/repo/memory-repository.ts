import { getClock } from '../clock';
import { newId } from '../ids';
import type { Job, Script, ScriptSegment, Source } from '../types';
import type {
  JobRepository,
  JobsPage,
  ListJobsOptions,
  NewJob,
  NewScript,
  NewSource,
  SourcePatch,
} from './repository';

/**
 * In-memory implementation of `JobRepository`.
 *
 * Uses plain `Map` instances keyed by id. All methods return defensive
 * copies (via spread) so that callers can never mutate stored state by
 * accident.
 */
export class MemoryJobRepository implements JobRepository {
  private readonly jobs = new Map<string, Job>();
  private readonly sources = new Map<string, Source>();
  private readonly scripts = new Map<string, Script>();
  /** jobId → ordered list of source ids (for stable iteration). */
  private readonly sourcesByJob = new Map<string, string[]>();

  async createJob(input: NewJob): Promise<Job> {
    const now = getClock().isoNow();
    const job: Job = {
      id: newId(),
      userId: input.userId,
      prompt: input.prompt,
      status: 'queued',
      error: null,
      createdAt: now,
      updatedAt: now,
    };
    this.jobs.set(job.id, job);
    return { ...job };
  }

  async getJob(jobId: string): Promise<Job | null> {
    const job = this.jobs.get(jobId);
    return job ? { ...job } : null;
  }

  async updateJobStatus(
    jobId: string,
    status: Job['status'],
    error: string | null = null
  ): Promise<Job> {
    const existing = this.jobs.get(jobId);
    if (!existing) {
      throw new Error(`Job not found: ${jobId}`);
    }
    const updated: Job = {
      ...existing,
      status,
      error: status === 'failed' ? (error ?? existing.error) : existing.error,
      updatedAt: getClock().isoNow(),
    };
    this.jobs.set(jobId, updated);
    return { ...updated };
  }

  async listJobs(userId: string, opts: ListJobsOptions): Promise<JobsPage> {
    const all = [...this.jobs.values()]
      .filter((j) => j.userId === userId)
      .filter((j) => (opts.status ? j.status === opts.status : true))
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    const offset = (opts.page - 1) * opts.limit;
    const slice = all.slice(offset, offset + opts.limit);
    return {
      jobs: slice.map((j) => ({ ...j })),
      total: all.length,
      page: opts.page,
      limit: opts.limit,
    };
  }

  async deleteJob(jobId: string): Promise<void> {
    if (!this.jobs.has(jobId)) return;
    this.jobs.delete(jobId);
    const sourceIds = this.sourcesByJob.get(jobId) ?? [];
    for (const id of sourceIds) this.sources.delete(id);
    this.sourcesByJob.delete(jobId);
    this.scripts.delete(jobId);
  }

  async createSource(input: NewSource): Promise<Source> {
    if (!this.jobs.has(input.jobId)) {
      throw new Error(`Cannot attach source to unknown job: ${input.jobId}`);
    }
    const source: Source = {
      id: newId(),
      jobId: input.jobId,
      url: input.url,
      title: input.title,
      summary: input.summary,
      domain: input.domain,
      publishedAt: input.publishedAt ?? null,
      rankScore: input.rankScore ?? null,
      screenshotPath: null,
      screenshotUrl: null,
      capturedAt: null,
      status: 'pending',
      error: null,
    };
    this.sources.set(source.id, source);
    const ordered = this.sourcesByJob.get(input.jobId) ?? [];
    ordered.push(source.id);
    this.sourcesByJob.set(input.jobId, ordered);
    return { ...source };
  }

  async updateSource(sourceId: string, patch: SourcePatch): Promise<Source> {
    const existing = this.sources.get(sourceId);
    if (!existing) {
      throw new Error(`Source not found: ${sourceId}`);
    }
    const updated: Source = { ...existing, ...patch };
    this.sources.set(sourceId, updated);
    return { ...updated };
  }

  async listSources(jobId: string): Promise<Source[]> {
    const ids = this.sourcesByJob.get(jobId) ?? [];
    return ids
      .map((id) => this.sources.get(id))
      .filter((s): s is Source => Boolean(s))
      .map((s) => ({ ...s }));
  }

  async upsertScript(input: NewScript): Promise<Script> {
    const existing = this.scripts.get(input.jobId);
    const segments: ScriptSegment[] = input.segments.map((s) => ({ ...s }));
    const wordCount = countWords(input.hook, input.outro, segments);
    const script: Script = {
      id: existing?.id ?? newId(),
      jobId: input.jobId,
      title: input.title,
      hook: input.hook,
      segments,
      outro: input.outro,
      wordCount,
      estimatedDurationS: estimateDuration(wordCount),
      createdAt: existing?.createdAt ?? getClock().isoNow(),
    };
    this.scripts.set(input.jobId, script);
    return { ...script };
  }

  async getScript(jobId: string): Promise<Script | null> {
    const s = this.scripts.get(jobId);
    return s ? { ...s } : null;
  }
}

function countWords(hook: string, outro: string, segments: ScriptSegment[]): number {
  const text = [hook, outro, ...segments.map((s) => s.narration)].join(' ');
  const trimmed = text.trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).length;
}

/** 130 wpm narration cadence per the PRD. */
function estimateDuration(wordCount: number): number {
  return Math.round((wordCount / 130) * 60);
}
