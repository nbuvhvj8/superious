import React from 'react';
import { Clock, Search, Camera, PenLine, CheckCircle2, XCircle } from 'lucide-react';

export type JobStatus = 'queued' | 'researching' | 'screenshotting' | 'writing' | 'done' | 'failed';
export type SourceStatus = 'pending' | 'done' | 'failed';

const JOB_STATUS_CONFIG: Record<
  JobStatus,
  { label: string; icon: React.ReactNode; className: string }
> = {
  queued: {
    label: 'Queued',
    icon: <Clock size={11} strokeWidth={2.25} />,
    className: 'bg-amber-100 text-amber-700 border border-amber-200',
  },
  researching: {
    label: 'Researching',
    icon: <Search size={11} strokeWidth={2.25} className="status-pulse" />,
    className: 'bg-blue-100 text-blue-700 border border-blue-200',
  },
  screenshotting: {
    label: 'Capturing',
    icon: <Camera size={11} strokeWidth={2.25} className="status-pulse" />,
    className: 'bg-purple-100 text-purple-700 border border-purple-200',
  },
  writing: {
    label: 'Writing',
    icon: <PenLine size={11} strokeWidth={2.25} className="status-pulse" />,
    className: 'bg-secondary/60 text-blue-700 border border-secondary',
  },
  done: {
    label: 'Done',
    icon: <CheckCircle2 size={11} strokeWidth={2.25} />,
    className: 'bg-primary/10 text-primary border border-primary/20',
  },
  failed: {
    label: 'Failed',
    icon: <XCircle size={11} strokeWidth={2.25} />,
    className: 'bg-red-100 text-red-600 border border-red-200',
  },
};

const SOURCE_STATUS_CONFIG: Record<SourceStatus, { label: string; className: string }> = {
  pending: { label: 'Pending', className: 'bg-amber-100 text-amber-700 border border-amber-200' },
  done: { label: 'Captured', className: 'bg-primary/10 text-primary border border-primary/20' },
  failed: { label: 'Failed', className: 'bg-red-100 text-red-600 border border-red-200' },
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
