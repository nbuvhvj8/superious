import type {
  RecaptureContradiction,
  RecaptureRun,
  RecaptureSourceRef,
  Source,
} from '@/shared/types';

export interface DiffInput {
  scheduleId: string;
  jobId: string;
  topic: string;
  previous: Source[];
  latest: Source[];
}

function toRef(source: Source): RecaptureSourceRef {
  return { id: source.id, url: source.url, title: source.title, domain: source.domain };
}

export function buildRecaptureRun(input: DiffInput): RecaptureRun {
  const prevByUrl = new Map(input.previous.map((s) => [s.url, s]));
  const latestByUrl = new Map(input.latest.map((s) => [s.url, s]));

  const newSources = input.latest.filter((s) => !prevByUrl.has(s.url)).map(toRef);
  const brokenSources = input.previous.filter((s) => !latestByUrl.has(s.url)).map(toRef);

  const contradictedClaims: RecaptureContradiction[] = [];
  for (const source of input.latest) {
    const prev = prevByUrl.get(source.url);
    if (!prev) continue;

    const prevSummary = prev.summary.trim().toLowerCase();
    const nextSummary = source.summary.trim().toLowerCase();
    if (!prevSummary || !nextSummary || prevSummary === nextSummary) continue;

    contradictedClaims.push({
      segmentHeading: 'Evidence change detected',
      claim: prev.summary,
      contradiction: source.summary,
      newSourceId: source.id,
      newSourceDomain: source.domain,
    });
  }

  return {
    id: `recap-${Date.now()}`,
    scheduleId: input.scheduleId,
    jobId: input.jobId,
    topic: input.topic,
    ranAt: new Date().toISOString(),
    newSources,
    brokenSources,
    contradictedClaims,
  };
}
