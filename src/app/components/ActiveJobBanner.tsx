'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, X } from 'lucide-react';
import JobStatusBar from '@/components/ui/JobStatusBar';
import type { JobStatus } from '@/components/ui/StatusBadge';

const MOCK_ACTIVE_JOB = {
  id: 'job-2847fa',
  prompt:
    'The rise and fall of Blockbuster Video — corporate decisions, Netflix rivalry, and lessons for modern media companies',
  status: 'screenshotting' as JobStatus,
  sourcesCaptures: 5,
  totalSources: 8,
  startedAt: '2 min ago',
};

export default function ActiveJobBanner() {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className="card border-secondary bg-secondary/10 p-5 space-y-4 animate-fade-in">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1 min-w-0">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-primary status-pulse" />
            <span className="text-xs font-bold text-primary uppercase tracking-widest">
              Active Job
            </span>
            <span className="font-mono text-2xs text-muted-foreground">{MOCK_ACTIVE_JOB.id}</span>
          </div>
          <p className="text-sm font-semibold text-foreground truncate max-w-xl">
            {MOCK_ACTIVE_JOB.prompt}
          </p>
          <p className="text-xs text-muted-foreground">
            Started {MOCK_ACTIVE_JOB.startedAt} &bull; {MOCK_ACTIVE_JOB.sourcesCaptures}/
            {MOCK_ACTIVE_JOB.totalSources} sources captured
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Link href="/job-detail" className="btn-secondary text-xs gap-1.5 py-1.5 px-3">
            View Live
            <ArrowRight size={12} strokeWidth={2.25} />
          </Link>
          <button
            onClick={() => setDismissed(true)}
            className="btn-ghost p-1.5"
            aria-label="Dismiss banner"
          >
            <X size={14} strokeWidth={2.25} />
          </button>
        </div>
      </div>

      <JobStatusBar status={MOCK_ACTIVE_JOB.status} />

      {/* Source capture progress */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-muted-foreground">Screenshot progress</span>
          <span className="font-mono text-xs tabular-nums text-foreground font-semibold">
            {MOCK_ACTIVE_JOB.sourcesCaptures}/{MOCK_ACTIVE_JOB.totalSources}
          </span>
        </div>
        <div className="h-1.5 w-full rounded-full bg-border overflow-hidden">
          <div
            className="h-full rounded-full bg-primary transition-all duration-700"
            style={{
              width: `${(MOCK_ACTIVE_JOB.sourcesCaptures / MOCK_ACTIVE_JOB.totalSources) * 100}%`,
            }}
          />
        </div>
      </div>
    </div>
  );
}
