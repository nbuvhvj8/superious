'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Clock, BookOpen, Hash } from 'lucide-react';
import { JobStatusBadge } from '@/components/ui/StatusBadge';
import JobStatusBar from '@/components/ui/JobStatusBar';

export default function JobDetailHeader() {
  return (
    <div className="border-b border-border bg-card px-6 lg:px-8 xl:px-10 2xl:px-14 py-5 space-y-4 shrink-0">
      <div className="flex items-start gap-4">
        <Link
          href="/"
          className="btn-ghost p-1.5 mt-0.5 shrink-0 -ml-1.5 text-foreground"
          aria-label="Back to workspace"
        >
          <ArrowLeft size={16} strokeWidth={2.25} />
        </Link>
        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <JobStatusBadge status="done" />
            <span className="font-mono text-2xs text-foreground">job-1c93be</span>
          </div>
          <h1 className="text-xl font-extrabold text-foreground leading-snug line-clamp-2 max-w-4xl">
            How CRISPR gene editing is revolutionizing cancer treatment and what ethical frameworks
            are needed
          </h1>
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-1.5 text-xs text-foreground font-semibold">
              <BookOpen size={12} strokeWidth={2.25} />
              <span className="font-semibold tabular-nums">2,840</span>
              <span>words</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-foreground font-semibold">
              <Clock size={12} strokeWidth={2.25} />
              <span className="font-semibold">21m 50s</span>
              <span>est. read time</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-foreground font-semibold">
              <Hash size={12} strokeWidth={2.25} />
              <span className="font-semibold tabular-nums">8/8</span>
              <span>sources captured</span>
            </div>
          </div>
        </div>
      </div>
      <JobStatusBar status="done" />
    </div>
  );
}
