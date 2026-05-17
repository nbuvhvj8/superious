

import React from 'react';
import { Clock, Search, Camera, PenLine, CheckCircle2, XCircle } from 'lucide-react';
import type { JobStatus } from './StatusBadge';

interface JobStatusBarProps {
  status: JobStatus;
  className?: string;
  variant?: 'full' | 'short';
}

const STAGES: { key: JobStatus; label: string; icon: React.ReactNode }[] = [
  { key: 'queued', label: 'Queued', icon: <Clock size={11} strokeWidth={2.25} /> },
  { key: 'researching', label: 'Researching', icon: <Search size={11} strokeWidth={2.25} /> },
  {
    key: 'screenshotting',
    label: 'Capturing Sources',
    icon: <Camera size={11} strokeWidth={2.25} />,
  },
  { key: 'writing', label: 'Writing Script', icon: <PenLine size={11} strokeWidth={2.25} /> },
  { key: 'done', label: 'Done', icon: <CheckCircle2 size={11} strokeWidth={2.25} /> },
];

const STAGE_ORDER: Record<JobStatus, number> = {
  queued: 0,
  researching: 1,
  screenshotting: 2,
  writing: 3,
  done: 4,
  failed: 4,
};

export default function JobStatusBar({
  status,
  className = '',
  variant = 'full',
}: JobStatusBarProps) {
  const currentIdx = STAGE_ORDER[status];
  const isFailed = status === 'failed';

  return (
    <div
      className={`flex items-start gap-0 ${variant === 'short' ? 'w-fit' : 'w-full'} ${className}`}
    >
      {STAGES.map((stage, i) => {
        const isCompleted = !isFailed && i < currentIdx;
        const isActive = !isFailed && i === currentIdx;
        const isFuture = !isFailed && i > currentIdx;
        const isFailedStage = isFailed && i === currentIdx;

        return (
          <React.Fragment key={`stage-${stage.key}`}>
            <div className="flex flex-col items-center shrink-0 w-6">
              <div
                className={`
                w-6 h-6 rounded-full flex items-center justify-center border-2 shrink-0
                transition-all duration-300
                ${isCompleted ? 'bg-primary border-primary text-primary-foreground' : ''}
                ${isActive ? 'bg-primary/10 border-primary text-primary status-pulse' : ''}
                ${isFuture ? 'bg-muted border-border text-muted-foreground' : ''}
                ${isFailedStage ? 'bg-red-100 border-red-400 text-red-500' : ''}
              `}
              >
                {isFailed && i === currentIdx ? (
                  <XCircle size={11} strokeWidth={2.25} />
                ) : (
                  stage.icon
                )}
              </div>
              <div className="mt-2 w-0 flex justify-center">
                <span
                  className={`
                  text-[10px] font-semibold whitespace-nowrap
                  ${isCompleted ? 'text-primary' : ''}
                  ${isActive ? 'text-primary' : ''}
                  ${isFuture ? 'text-muted-foreground' : ''}
                  ${isFailedStage ? 'text-red-500' : ''}
                `}
                >
                  {isFailed && i === currentIdx ? 'Failed' : stage.label}
                </span>
              </div>
            </div>
            {i < STAGES.length - 1 && (
              <div
                className={`
                h-0.5 mt-3 transition-all duration-500
                ${variant === 'short' ? 'w-20' : 'flex-1'}
                ${i < currentIdx && !isFailed ? 'bg-primary' : 'bg-border'}
              `}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}
