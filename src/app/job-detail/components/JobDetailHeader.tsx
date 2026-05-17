'use client';

import React from 'react';
import Link from 'next/link';
import { HugeiconsIcon } from '@hugeicons/react';
import { ArrowLeft01Icon, BookOpen01Icon, Clock01Icon, HashtagIcon } from '@hugeicons/core-free-icons';
import { JobStatusBadge } from '@/components/ui/StatusBadge';
import JobStatusBar from '@/components/ui/JobStatusBar';

export default function JobDetailHeader() {
  return (
    <div className="border-b border-border bg-background pt-6 pb-8 space-y-6 shrink-0">
      {/* Back Button - Aligned with the left vertical line */}
      <div>
        <Link
          href="/"
          className="btn-ghost px-2 py-1.5 shrink-0 -ml-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors inline-flex items-center gap-2 group"
          aria-label="Back to workspace"
        >
          <HugeiconsIcon icon={ArrowLeft01Icon}
            size={16}
            strokeWidth={2.5}
            className="group-hover:-translate-x-0.5 transition-transform" />
          <span className="text-xs font-bold uppercase tracking-widest">Back</span>
        </Link>
      </div>

      <div className="space-y-5">
        {/* Status and ID */}
        <div className="flex items-center gap-3">
          <JobStatusBadge status="done" />
          <span className="font-mono text-xs text-muted-foreground font-medium">job-1c93be</span>
        </div>

        {/* Title */}
        <h1 className="text-3xl font-extrabold text-foreground leading-tight tracking-tight max-w-4xl">
          How CRISPR gene editing is revolutionizing cancer treatment and what ethical frameworks
          are needed
        </h1>

        {/* Stats and Status Bar Group */}
        <div className="space-y-6">
          <div className="flex items-center gap-6 flex-wrap">
            <div className="flex items-center gap-2 text-sm text-foreground/80 font-semibold">
              <HugeiconsIcon icon={BookOpen01Icon} size={16} strokeWidth={2.25} className="text-primary" />
              <span className="tabular-nums">2,840</span>
              <span className="text-muted-foreground font-medium">words</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-foreground/80 font-semibold">
              <HugeiconsIcon icon={Clock01Icon} size={16} strokeWidth={2.25} className="text-primary" />
              <span>21m 50s</span>
              <span className="text-muted-foreground font-medium">est. read time</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-foreground/80 font-semibold">
              <HugeiconsIcon icon={HashtagIcon} size={16} strokeWidth={2.25} className="text-primary" />
              <span className="tabular-nums">8/8</span>
              <span className="text-muted-foreground font-medium">sources captured</span>
            </div>
          </div>

          <div className="pt-2 w-fit">
            <JobStatusBar status="done" variant="short" />
          </div>
        </div>
      </div>
    </div>
  );
}
