'use client';

import React, { useState } from 'react';
import {
  GitCommit,
  Plus,
  Link2Off,
  AlertOctagon,
  ExternalLink,
  ChevronRight,
  ChevronDown,
} from 'lucide-react';
import type { RecaptureRun } from '@/server/types';

/**
 * Per-schedule timeline showing what changed between Recapture runs.
 *
 * Recapture itself was already a feature; this surface is the actual
 * user-facing answer to "what changed?" — the thing that turns Recapture
 * from a re-run button into competitive intelligence.
 *
 * The component is purely presentational; the parent page owns the run
 * data. We keep the most recent run expanded by default so the user
 * always sees the latest delta on first paint.
 */
const MOCK_RUNS: RecaptureRun[] = [
  {
    id: 'rerun-3',
    scheduleId: 'cron-1',
    jobId: 'job-1c93be',
    topic: 'Netflix Streaming Trends',
    ranAt: '2026-05-06T09:00:00Z',
    newSources: [
      {
        id: 'src-new-301',
        url: 'https://variety.com/2026/streaming/netflix-q1-earnings',
        title: 'Netflix Q1 2026 Earnings: Subscriber Growth Hits New Plateau',
        domain: 'variety.com',
      },
      {
        id: 'src-new-302',
        url: 'https://www.theverge.com/2026/4/30/netflix-ad-tier-data',
        title: 'The Verge: Netflix Ad-Tier Has Quietly Doubled Since Last Year',
        domain: 'theverge.com',
      },
    ],
    brokenSources: [
      {
        id: 'src-broken-201',
        url: 'https://oldblog.example.com/streaming-stats-2024',
        title: 'Streaming Stats 2024 (now 404)',
        domain: 'oldblog.example.com',
      },
    ],
    contradictedClaims: [
      {
        segmentHeading: 'Subscriber Growth in 2025',
        claim: 'Netflix added 12M global subscribers in Q4 2025.',
        contradiction:
          'Variety Q1 2026 earnings reporting cites a revised Q4 2025 figure of 9.4M, attributing the gap to a previously-undisclosed account-sharing reclassification.',
        newSourceId: 'src-new-301',
        newSourceDomain: 'variety.com',
      },
    ],
  },
  {
    id: 'rerun-2',
    scheduleId: 'cron-1',
    jobId: 'job-1c93be',
    topic: 'Netflix Streaming Trends',
    ranAt: '2026-04-29T09:00:00Z',
    newSources: [
      {
        id: 'src-new-203',
        url: 'https://www.bloomberg.com/news/2026-04-25-streaming-wars',
        title: 'Bloomberg: Streaming Wars Enter the Bundling Phase',
        domain: 'bloomberg.com',
      },
    ],
    brokenSources: [],
    contradictedClaims: [],
  },
  {
    id: 'rerun-1',
    scheduleId: 'cron-1',
    jobId: 'job-1c93be',
    topic: 'Netflix Streaming Trends',
    ranAt: '2026-04-22T09:00:00Z',
    newSources: [
      {
        id: 'src-new-101',
        url: 'https://www.wsj.com/tech/netflix-international-2026',
        title: 'WSJ: Netflix Doubles Down on International Production',
        domain: 'wsj.com',
      },
      {
        id: 'src-new-102',
        url: 'https://www.theinformation.com/articles/netflix-cost-cutting',
        title: 'The Information: Netflix Cost-Cutting Reaches Original Programming',
        domain: 'theinformation.com',
      },
    ],
    brokenSources: [
      {
        id: 'src-broken-101',
        url: 'https://medium.example.com/streaming-2025-predictions',
        title: 'Streaming 2025 Predictions (now 404)',
        domain: 'medium.example.com',
      },
    ],
    contradictedClaims: [],
  },
];

interface Props {
  runs?: RecaptureRun[];
}

export default function RecaptureDiffTimeline({ runs = MOCK_RUNS }: Props) {
  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-bold">Recapture Timeline</h2>
          <span className="text-2xs font-bold uppercase tracking-widest text-primary bg-primary/10 px-2 py-0.5 rounded-full">
            New
          </span>
        </div>
        <p className="text-xs text-muted-foreground max-w-md">
          Per-run diffs showing what new sources, broken links, and contradicted claims surfaced
          since the previous Recapture.
        </p>
      </div>

      {runs.length === 0 ? (
        <div className="card p-10 text-center space-y-1">
          <p className="text-sm font-semibold text-foreground">No Recapture runs yet</p>
          <p className="text-xs text-muted-foreground">
            Schedule a Recapture above to start tracking source-level changes over time.
          </p>
        </div>
      ) : (
        <ol className="relative border-l border-border ml-3 space-y-4 pl-6">
          {runs.map((run, idx) => (
            <RunCard key={run.id} run={run} defaultExpanded={idx === 0} />
          ))}
        </ol>
      )}
    </section>
  );
}

function RunCard({ run, defaultExpanded }: { run: RecaptureRun; defaultExpanded: boolean }) {
  const [open, setOpen] = useState(defaultExpanded);
  const totalChanges =
    run.newSources.length + run.brokenSources.length + run.contradictedClaims.length;
  const hasContradictions = run.contradictedClaims.length > 0;

  return (
    <li className="relative">
      {/* Timeline dot */}
      <span
        className={`
          absolute -left-[34px] top-3 w-4 h-4 rounded-full border-2 border-background
          flex items-center justify-center
          ${hasContradictions ? 'bg-red-500' : 'bg-primary'}
        `}
      >
        <GitCommit size={9} className="text-white" strokeWidth={3} />
      </span>

      <div className="card overflow-hidden">
        <button
          onClick={() => setOpen(!open)}
          className="w-full flex items-center justify-between gap-3 px-4 py-3 hover:bg-muted/40 transition-colors text-left"
        >
          <div className="flex items-center gap-3 min-w-0">
            {open ? (
              <ChevronDown size={14} className="text-muted-foreground shrink-0" />
            ) : (
              <ChevronRight size={14} className="text-muted-foreground shrink-0" />
            )}
            <div className="min-w-0 space-y-0.5">
              <p className="text-sm font-bold text-foreground truncate">
                {run.topic}
                <span className="text-muted-foreground font-mono font-medium ml-2 text-2xs">
                  {run.id}
                </span>
              </p>
              <p className="text-2xs text-muted-foreground">{formatRunDate(run.ranAt)}</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            {run.newSources.length > 0 && (
              <Pill
                icon={<Plus size={10} />}
                label={`+${run.newSources.length} new`}
                tone="green"
              />
            )}
            {run.brokenSources.length > 0 && (
              <Pill
                icon={<Link2Off size={10} />}
                label={`${run.brokenSources.length} broken`}
                tone="amber"
              />
            )}
            {hasContradictions && (
              <Pill
                icon={<AlertOctagon size={10} />}
                label={`${run.contradictedClaims.length} conflict${run.contradictedClaims.length > 1 ? 's' : ''}`}
                tone="red"
              />
            )}
            {totalChanges === 0 && (
              <span className="text-2xs text-muted-foreground font-medium">No changes</span>
            )}
          </div>
        </button>

        {open && totalChanges > 0 && (
          <div className="border-t border-border divide-y divide-border">
            {run.contradictedClaims.length > 0 && (
              <ContradictionsBlock claims={run.contradictedClaims} />
            )}
            {run.newSources.length > 0 && (
              <SourcesBlock
                title="New sources"
                tone="green"
                icon={<Plus size={11} />}
                items={run.newSources}
              />
            )}
            {run.brokenSources.length > 0 && (
              <SourcesBlock
                title="Broken sources"
                tone="amber"
                icon={<Link2Off size={11} />}
                items={run.brokenSources}
              />
            )}
          </div>
        )}
      </div>
    </li>
  );
}

type Tone = 'green' | 'amber' | 'red';

const TONE_CLASSES: Record<Tone, { bg: string; text: string; border: string }> = {
  green: {
    bg: 'bg-emerald-500/10',
    text: 'text-emerald-600',
    border: 'border-emerald-500/30',
  },
  amber: {
    bg: 'bg-amber-500/10',
    text: 'text-amber-700',
    border: 'border-amber-500/30',
  },
  red: {
    bg: 'bg-red-500/10',
    text: 'text-red-600',
    border: 'border-red-500/30',
  },
};

function Pill({ icon, label, tone }: { icon: React.ReactNode; label: string; tone: Tone }) {
  const t = TONE_CLASSES[tone];
  return (
    <span
      className={`inline-flex items-center gap-1 text-2xs font-bold rounded-full border px-1.5 py-0.5 ${t.bg} ${t.text} ${t.border}`}
    >
      {icon}
      {label}
    </span>
  );
}

function SourcesBlock({
  title,
  tone,
  icon,
  items,
}: {
  title: string;
  tone: Tone;
  icon: React.ReactNode;
  items: { id: string; url: string; title: string; domain: string }[];
}) {
  const t = TONE_CLASSES[tone];
  return (
    <div className="px-4 py-3 space-y-2">
      <div
        className={`flex items-center gap-1.5 text-2xs font-bold uppercase tracking-widest ${t.text}`}
      >
        {icon}
        {title}
      </div>
      <ul className="space-y-1.5">
        {items.map((s) => (
          <li key={s.id} className="flex items-start gap-2 text-xs">
            <span className="font-mono text-2xs text-muted-foreground tabular-nums shrink-0 mt-0.5">
              {s.domain}
            </span>
            <a
              href={s.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex-1 inline-flex items-start gap-1 hover:underline font-medium ${
                tone === 'amber' ? 'line-through opacity-70' : 'text-foreground'
              }`}
            >
              {s.title}
              <ExternalLink size={10} className="mt-0.5 shrink-0 opacity-70" />
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ContradictionsBlock({ claims }: { claims: RecaptureRun['contradictedClaims'] }) {
  return (
    <div className="px-4 py-3 space-y-3 bg-red-500/5">
      <div className="flex items-center gap-1.5 text-2xs font-bold uppercase tracking-widest text-red-600">
        <AlertOctagon size={11} />
        Contradicted claims
      </div>
      <ul className="space-y-3">
        {claims.map((c, i) => (
          <li key={`contra-${i}`} className="space-y-1 text-xs">
            <p className="text-2xs font-bold text-foreground uppercase tracking-wider">
              {c.segmentHeading}
            </p>
            <p className="line-through text-muted-foreground leading-relaxed">{c.claim}</p>
            <p className="text-foreground leading-relaxed">
              <span className="font-bold text-red-600">Now: </span>
              {c.contradiction}
            </p>
            <p className="text-2xs text-muted-foreground font-mono">via {c.newSourceDomain}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

function formatRunDate(iso: string): string {
  const d = new Date(iso);
  const date = d.toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
  const time = d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
  return `${date} • ${time}`;
}
