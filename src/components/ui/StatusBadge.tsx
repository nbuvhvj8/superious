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
    className: 'bg-amber-500/10 text-[#f59e0b] border border-[#f59e0b]/20',
  },
  researching: {
    label: 'Researching',
    icon: <Search size={11} strokeWidth={2.25} className="status-pulse" />,
    className: 'bg-blue-500/10 text-blue-500 border border-blue-500/20',
  },
  screenshotting: {
    label: 'Capturing',
    icon: <Camera size={11} strokeWidth={2.25} className="status-pulse" />,
    className: 'bg-purple-500/10 text-purple-500 border border-purple-500/20',
  },
  writing: {
    label: 'Writing',
    icon: <PenLine size={11} strokeWidth={2.25} className="status-pulse" />,
    className: 'bg-indigo-500/10 text-indigo-500 border border-indigo-500/20',
  },
  done: {
    label: 'Done',
    icon: <CheckCircle2 size={11} strokeWidth={2.25} />,
    className: 'bg-[#22c55e]/10 text-[#22c55e] border border-[#22c55e]/20',
  },
  failed: {
    label: 'Failed',
    icon: <XCircle size={11} strokeWidth={2.25} />,
    className: 'bg-[#ef4444]/10 text-[#ef4444] border border-[#ef4444]/20',
  },
};

const SOURCE_STATUS_CONFIG: Record<SourceStatus, { label: string; className: string }> = {
  pending: {
    label: 'Pending',
    className: 'bg-[#f59e0b]/10 text-[#f59e0b] border border-[#f59e0b]/20',
  },
  done: {
    label: 'Captured',
    className: 'bg-[#22c55e]/10 text-[#22c55e] border border-[#22c55e]/20',
  },
  failed: {
    label: 'Failed',
    className: 'bg-[#ef4444]/10 text-[#ef4444] border border-[#ef4444]/20',
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
