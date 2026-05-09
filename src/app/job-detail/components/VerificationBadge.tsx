'use client';

import React from 'react';
import { ShieldCheck, ShieldAlert, ShieldQuestion, ShieldX } from 'lucide-react';
import type { SegmentVerification, VerificationStatus } from '@/server/types';

/**
 * Compact pill that surfaces the fact-check verdict for a script segment.
 *
 * The status comes from the post-`script_writer` verification pass, which
 * cross-references each claim against the captured source manifest. The
 * badge is keyboard-focusable so reviewers can tab through every claim and
 * read the rationale without reaching for a mouse.
 */
interface Props {
  verification: SegmentVerification;
  size?: 'sm' | 'md';
  className?: string;
}

export function VerificationBadge({ verification, size = 'md', className = '' }: Props) {
  const meta = STATUS_META[verification.status];
  const Icon = meta.icon;
  const isSmall = size === 'sm';

  const tooltipParts = [meta.label, `${Math.round(verification.confidence * 100)}% confidence`];
  if (verification.supportingSourceIds.length > 0) {
    tooltipParts.push(`${verification.supportingSourceIds.length} supporting`);
  }
  if (verification.contradictingSourceIds.length > 0) {
    tooltipParts.push(`${verification.contradictingSourceIds.length} contradicting`);
  }
  if (verification.notes) {
    tooltipParts.push(verification.notes);
  }
  const tooltip = tooltipParts.join(' — ');

  return (
    <span
      className={`
        inline-flex items-center gap-1 rounded-full font-bold whitespace-nowrap
        border ${meta.classes}
        ${isSmall ? 'text-[9px] px-1.5 py-0.5 tracking-wide uppercase' : 'text-2xs px-2 py-0.5'}
        ${className}
      `}
      title={tooltip}
      aria-label={tooltip}
    >
      <Icon size={isSmall ? 9 : 11} strokeWidth={2.5} />
      {meta.label}
      {verification.status !== 'unverified' && (
        <span className="font-mono tabular-nums opacity-70">
          {Math.round(verification.confidence * 100)}%
        </span>
      )}
    </span>
  );
}

const STATUS_META: Record<
  VerificationStatus,
  {
    label: string;
    icon: typeof ShieldCheck;
    classes: string;
  }
> = {
  supported: {
    label: 'Verified',
    icon: ShieldCheck,
    classes: 'bg-primary/10 text-primary border-primary/30',
  },
  'single-source': {
    label: '1 Source',
    icon: ShieldAlert,
    classes: 'bg-amber-50 text-amber-700 border-amber-300',
  },
  contradicted: {
    label: 'Conflict',
    icon: ShieldX,
    classes: 'bg-red-50 text-red-600 border-red-300',
  },
  unverified: {
    label: 'Unverified',
    icon: ShieldQuestion,
    classes: 'bg-muted text-muted-foreground border-border',
  },
};

/**
 * Aggregate-counts strip shown in the script header so reviewers can see
 * the verification distribution across all segments at a glance.
 */
export function VerificationLegend({ counts }: { counts: Record<VerificationStatus, number> }) {
  const entries: VerificationStatus[] = [
    'supported',
    'single-source',
    'contradicted',
    'unverified',
  ];
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {entries.map((status) => {
        const meta = STATUS_META[status];
        const count = counts[status] ?? 0;
        if (count === 0) return null;
        const Icon = meta.icon;
        return (
          <span
            key={`legend-${status}`}
            className={`
              inline-flex items-center gap-1 rounded-full text-2xs font-bold px-2 py-0.5 border
              ${meta.classes}
            `}
            title={`${count} ${meta.label.toLowerCase()}`}
          >
            <Icon size={10} strokeWidth={2.5} />
            <span>{meta.label}</span>
            <span className="font-mono tabular-nums opacity-70">{count}</span>
          </span>
        );
      })}
    </div>
  );
}
