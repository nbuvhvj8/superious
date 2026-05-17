import React from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { Camera01Icon, CancelCircleIcon, CheckmarkCircle01Icon, Clock01Icon, PenTool01Icon, Search01Icon } from '@hugeicons/core-free-icons';

export type JobStatus = 'queued' | 'researching' | 'screenshotting' | 'writing' | 'done' | 'failed';
export type SourceStatus = 'pending' | 'done' | 'failed';

const JOB_STATUS_CONFIG: Record<
  JobStatus,
  { label: string; icon: React.ReactNode; className: string }
> = {
  queued: {
    label: 'Queued',
    icon: <HugeiconsIcon icon={Clock01Icon} size={11} strokeWidth={2.25} />,
    className: 'bg-amber-500/10 text-amber-600 border border-amber-500/20',
  },
  researching: {
    label: 'Researching',
    icon: <HugeiconsIcon icon={Search01Icon} size={11} strokeWidth={2.25} className="status-pulse" />,
    className: 'bg-primary/10 text-primary border border-primary/20',
  },
  screenshotting: {
    label: 'Capturing',
    icon: <HugeiconsIcon icon={Camera01Icon} size={11} strokeWidth={2.25} className="status-pulse" />,
    className: 'bg-violet-500/10 text-violet-600 border border-violet-500/20',
  },
  writing: {
    label: 'Writing',
    icon: <HugeiconsIcon icon={PenTool01Icon} size={11} strokeWidth={2.25} className="status-pulse" />,
    className: 'bg-blue-500/10 text-blue-600 border border-blue-500/20',
  },
  done: {
    label: 'Done',
    icon: <HugeiconsIcon icon={CheckmarkCircle01Icon} size={11} strokeWidth={2.25} />,
    className: 'bg-green-500/10 text-green-700 border border-green-500/20',
  },
  failed: {
    label: 'Failed',
    icon: <HugeiconsIcon icon={CancelCircleIcon} size={11} strokeWidth={2.25} />,
    className: 'bg-red-500/10 text-red-600 border border-red-500/20',
  },
};

const SOURCE_STATUS_CONFIG: Record<SourceStatus, { label: string; className: string }> = {
  pending: {
    label: 'Pending',
    className: 'bg-amber-500/10 text-amber-600 border border-amber-500/20',
  },
  done: {
    label: 'Captured',
    className: 'bg-green-500/10 text-green-700 border border-green-500/20',
  },
  failed: {
    label: 'Failed',
    className: 'bg-red-500/10 text-red-600 border border-red-500/20',
  },
};

export function JobStatusBadge({ status }: { status: JobStatus }) {
  const config = JOB_STATUS_CONFIG[status];
  return (
    <span className={`status-badge ${config.className}`}>
      {config.icon}
      {config.label}
    </span>
  );
}

export function SourceStatusBadge({ status }: { status: SourceStatus }) {
  const config = SOURCE_STATUS_CONFIG[status];
  return <span className={`status-badge ${config.className}`}>{config.label}</span>;
}
