'use client';

import React, { useEffect, useRef, useState } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { BarChartIcon, BookOpenTextIcon, Clock01Icon, Delete02Icon, File02Icon, MicroscopeIcon, PauseIcon, PlayIcon, RefreshIcon, Search01Icon, UploadIcon } from '@hugeicons/core-free-icons';

export interface SlashCommand {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  category: 'cron' | 'workspace' | 'job' | 'gdrive';
  action: string;
}

const SLASH_COMMANDS: SlashCommand[] = [
  // Cron Job commands
  {
    id: 'cron-list',
    label: '/cron list',
    description: 'List all active scheduled jobs',
    icon: <HugeiconsIcon icon={Clock01Icon} size={14} />,
    category: 'cron',
    action: 'cron_list',
  },
  {
    id: 'cron-run',
    label: '/cron run',
    description: 'Trigger a cron job to run immediately',
    icon: <HugeiconsIcon icon={PlayIcon} size={14} />,
    category: 'cron',
    action: 'cron_run',
  },
  {
    id: 'cron-pause',
    label: '/cron pause',
    description: 'Pause a running scheduled job',
    icon: <HugeiconsIcon icon={PauseIcon} size={14} />,
    category: 'cron',
    action: 'cron_pause',
  },
  {
    id: 'cron-delete',
    label: '/cron delete',
    description: 'Delete a scheduled job',
    icon: <HugeiconsIcon icon={Delete02Icon} size={14} />,
    category: 'cron',
    action: 'cron_delete',
  },
  // Workspace commands
  {
    id: 'workspace-search',
    label: '/workspace search',
    description: 'Search across all research collections',
    icon: <HugeiconsIcon icon={Search01Icon} size={14} />,
    category: 'workspace',
    action: 'workspace_search',
  },
  {
    id: 'workspace-recent',
    label: '/workspace recent',
    description: 'Show recently completed research jobs',
    icon: <HugeiconsIcon icon={MicroscopeIcon} size={14} />,
    category: 'workspace',
    action: 'workspace_recent',
  },
  {
    id: 'workspace-stats',
    label: '/workspace stats',
    description: 'View workspace analytics and usage stats',
    icon: <HugeiconsIcon icon={BarChartIcon} size={14} />,
    category: 'workspace',
    action: 'workspace_stats',
  },
  // Job Detail commands
  {
    id: 'job-status',
    label: '/job status',
    description: 'Get the current status of a running job',
    icon: <HugeiconsIcon icon={RefreshIcon} size={14} />,
    category: 'job',
    action: 'job_status',
  },
  {
    id: 'job-sources',
    label: '/job sources',
    description: 'List all captured sources for a job',
    icon: <HugeiconsIcon icon={BookOpenTextIcon} size={14} />,
    category: 'job',
    action: 'job_sources',
  },
  {
    id: 'job-script',
    label: '/job script',
    description: 'Retrieve the generated script for a job',
    icon: <HugeiconsIcon icon={File02Icon} size={14} />,
    category: 'job',
    action: 'job_script',
  },
  // Google Drive commands
  {
    id: 'gdrive-backup',
    label: '/backup gdrive',
    description: 'Upload a backup to Google Drive now',
    icon: <HugeiconsIcon icon={UploadIcon} size={14} />,
    category: 'gdrive',
    action: 'gdrive_backup',
  },
];

const CATEGORY_LABELS: Record<string, string> = {
  cron: 'Cron Jobs',
  workspace: 'Workspace',
  job: 'Job Details',
  gdrive: 'Google Drive',
};

const CATEGORY_COLORS: Record<string, string> = {
  cron: 'text-blue-500',
  workspace: 'text-purple-500',
  job: 'text-emerald-500',
  gdrive: 'text-amber-500',
};

interface SlashCommandMenuProps {
  query: string;
  visible: boolean;
  onSelect: (command: SlashCommand) => void;
  onClose: () => void;
}

export default function SlashCommandMenu({
  query,
  visible,
  onSelect,
  onClose,
}: SlashCommandMenuProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const menuRef = useRef<HTMLDivElement>(null);

  const filtered = SLASH_COMMANDS.filter(
    (cmd) =>
      cmd.label.toLowerCase().includes(query.toLowerCase()) ||
      cmd.description.toLowerCase().includes(query.toLowerCase())
  );

  const grouped = filtered.reduce(
    (acc, cmd) => {
      if (!acc[cmd.category]) acc[cmd.category] = [];
      acc[cmd.category].push(cmd);
      return acc;
    },
    {} as Record<string, SlashCommand[]>
  );

  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  useEffect(() => {
    if (!visible) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveIndex((prev) => Math.min(prev + 1, filtered.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveIndex((prev) => Math.max(prev - 1, 0));
      } else if (e.key === 'Enter' && filtered[activeIndex]) {
        e.preventDefault();
        onSelect(filtered[activeIndex]);
      } else if (e.key === 'Escape') {
        onClose();
      }
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [visible, activeIndex, filtered, onSelect, onClose]);

  useEffect(() => {
    if (menuRef.current) {
      const activeEl = menuRef.current.querySelector('[data-active="true"]');
      activeEl?.scrollIntoView({ block: 'nearest' });
    }
  }, [activeIndex]);

  if (!visible || filtered.length === 0) return null;

  let flatIndex = 0;

  return (
    <div
      ref={menuRef}
      className="absolute bottom-full left-0 right-0 mb-2 bg-white border border-border rounded-xl shadow-xl max-h-[320px] overflow-y-auto scrollbar-thin z-50 animate-slide-up"
    >
      <div className="px-3 py-2 border-b border-border">
        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
          Commands
        </span>
      </div>
      {Object.entries(grouped).map(([category, cmds]) => (
        <div key={category}>
          <div className="px-3 pt-2.5 pb-1">
            <span
              className={`text-[10px] font-extrabold uppercase tracking-widest ${CATEGORY_COLORS[category] ?? 'text-muted-foreground'}`}
            >
              {CATEGORY_LABELS[category] ?? category}
            </span>
          </div>
          {cmds.map((cmd) => {
            const idx = flatIndex++;
            const isActive = idx === activeIndex;
            return (
              <button
                key={cmd.id}
                data-active={isActive}
                onClick={() => onSelect(cmd)}
                onMouseEnter={() => setActiveIndex(idx)}
                className={`
                  w-full flex items-center gap-3 px-3 py-2 text-left transition-colors duration-75
                  ${isActive ? 'bg-primary/8' : 'hover:bg-muted/50'}
                `}
              >
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                    isActive ? 'bg-primary/15 text-primary' : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {cmd.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[13px] font-bold font-mono ${isActive ? 'text-primary' : 'text-foreground'}`}
                    >
                      {cmd.label}
                    </span>
                  </div>
                  <span className="text-[11px] text-muted-foreground leading-tight block truncate">
                    {cmd.description}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      ))}
      <div className="px-3 py-1.5 border-t border-border bg-muted/30">
        <span className="text-[10px] text-muted-foreground">
          <kbd className="px-1 py-0.5 bg-muted border border-border rounded text-[9px] font-mono">
            ↑↓
          </kbd>{' '}
          navigate{' '}
          <kbd className="px-1 py-0.5 bg-muted border border-border rounded text-[9px] font-mono">
            ↵
          </kbd>{' '}
          select{' '}
          <kbd className="px-1 py-0.5 bg-muted border border-border rounded text-[9px] font-mono">
            esc
          </kbd>{' '}
          close
        </span>
      </div>
    </div>
  );
}

export { SLASH_COMMANDS };
