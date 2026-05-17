

import React from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { AlertCircleIcon, ArrowUpRight01Icon, BarChartIcon, BookOpenTextIcon, CheckmarkCircle01Icon, Clock01Icon, File02Icon, MicroscopeIcon, PauseIcon, PlayIcon, Search01Icon, UploadIcon } from '@hugeicons/core-free-icons';

export type CommandType =
  | 'cron_list'
  | 'cron_run'
  | 'cron_pause'
  | 'cron_delete'
  | 'workspace_search'
  | 'workspace_recent'
  | 'workspace_stats'
  | 'job_status'
  | 'job_sources'
  | 'job_script'
  | 'gdrive_backup';

interface CommandResponseCardProps {
  commandType: CommandType;
}

interface CronJobItem {
  id: string;
  title: string;
  type: string;
  status: 'active' | 'paused';
  nextRun: string;
  schedule: string;
}

interface WorkspaceJobItem {
  id: string;
  title: string;
  status: string;
  date: string;
  sources: number;
}

const MOCK_CRON_JOBS: CronJobItem[] = [
  {
    id: 'cron-1',
    title: 'Netflix Streaming Trends',
    type: 'Recapture',
    status: 'active',
    nextRun: 'In 5 days',
    schedule: 'Every Monday at 9:00 AM',
  },
  {
    id: 'cron-2',
    title: 'Weekly Tech News Roundup',
    type: 'Automated Research',
    status: 'active',
    nextRun: 'In 2 days',
    schedule: 'Every Friday at 5:00 PM',
  },
  {
    id: 'cron-3',
    title: 'Source Archive: AI Ethics',
    type: 'Archive Snapshot',
    status: 'paused',
    nextRun: 'Paused',
    schedule: 'Monthly on the 1st',
  },
];

const MOCK_RECENT_JOBS: WorkspaceJobItem[] = [
  {
    id: 'JOB-042',
    title: 'CRISPR Gene Editing Revolution',
    status: 'done',
    date: '2h ago',
    sources: 8,
  },
  {
    id: 'JOB-041',
    title: 'Netflix Q4 Subscriber Analysis',
    status: 'done',
    date: '5h ago',
    sources: 6,
  },
  {
    id: 'JOB-040',
    title: 'SpaceX Starship Progress 2025',
    status: 'done',
    date: 'Yesterday',
    sources: 7,
  },
];

function CronListCard() {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 mb-3">
        <HugeiconsIcon icon={Clock01Icon} size={14} className="text-primary" />
        <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
          Active Schedules
        </span>
        <span className="ml-auto text-[10px] font-bold text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
          {MOCK_CRON_JOBS.length} jobs
        </span>
      </div>
      {MOCK_CRON_JOBS.map((job) => (
        <div
          key={job.id}
          className="flex items-center gap-3 p-2.5 rounded-lg border border-border bg-card hover:border-primary/30 transition-colors group"
        >
          <div
            className={`w-2 h-2 rounded-full shrink-0 ${job.status === 'active' ? 'bg-green-500 animate-pulse' : 'bg-amber-500'}`}
          />
          <div className="flex-1 min-w-0">
            <p className="text-[12px] font-bold text-foreground truncate">{job.title}</p>
            <p className="text-[10px] text-muted-foreground">{job.schedule}</p>
          </div>
          <span className="text-[9px] px-1.5 py-0.5 rounded-full font-extrabold uppercase tracking-wider bg-muted text-muted-foreground">
            {job.type}
          </span>
        </div>
      ))}
      <a
        href="/cron-job"
        className="flex items-center gap-1.5 text-[11px] font-bold text-primary hover:underline mt-2"
      >
        Open Cron Jobs <HugeiconsIcon icon={ArrowUpRight01Icon} size={10} />
      </a>
    </div>
  );
}

function CronRunCard() {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 mb-1">
        <HugeiconsIcon icon={PlayIcon} size={14} className="text-green-500" fill="currentColor" />
        <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
          Job Triggered
        </span>
      </div>
      <div className="p-2.5 rounded-lg border border-border bg-card">
        <p className="text-[12px] font-bold text-foreground">Netflix Streaming Trends</p>
        <p className="text-[10px] text-muted-foreground mt-0.5">
          Recapture job triggered successfully. You will be notified when results are ready.
        </p>
      </div>
    </div>
  );
}

function CronPauseCard() {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 mb-1">
        <HugeiconsIcon icon={PauseIcon} size={14} className="text-amber-500" />
        <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
          Schedule Paused
        </span>
      </div>
      <div className="p-2.5 rounded-lg border border-border bg-card">
        <p className="text-[12px] font-bold text-foreground">Weekly Tech News Roundup</p>
        <p className="text-[10px] text-muted-foreground mt-0.5">
          This schedule has been paused. No further runs will execute until resumed.
        </p>
      </div>
    </div>
  );
}

function CronDeleteCard() {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 mb-1">
        <HugeiconsIcon icon={AlertCircleIcon} size={14} className="text-red-500" />
        <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
          Schedule Deleted
        </span>
      </div>
      <div className="p-2.5 rounded-lg border border-border bg-card">
        <p className="text-[12px] font-bold text-foreground">Source Archive: AI Ethics</p>
        <p className="text-[10px] text-muted-foreground mt-0.5">
          Schedule permanently removed. Historical run data has been retained.
        </p>
      </div>
    </div>
  );
}

function WorkspaceSearchCard() {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 mb-3">
        <HugeiconsIcon icon={Search01Icon} size={14} className="text-primary" />
        <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
          Search Results
        </span>
      </div>
      {MOCK_RECENT_JOBS.map((job) => (
        <div
          key={job.id}
          className="flex items-center gap-3 p-2.5 rounded-lg border border-border bg-card"
        >
          <div className="flex-1 min-w-0">
            <p className="text-[12px] font-bold text-foreground truncate">{job.title}</p>
            <p className="text-[10px] text-muted-foreground font-mono">{job.id}</p>
          </div>
          <span className="text-[10px] font-bold text-primary">{job.sources} sources</span>
        </div>
      ))}
      <a
        href="/workspace"
        className="flex items-center gap-1.5 text-[11px] font-bold text-primary hover:underline mt-2"
      >
        Open Workspace <HugeiconsIcon icon={ArrowUpRight01Icon} size={10} />
      </a>
    </div>
  );
}

function WorkspaceRecentCard() {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 mb-3">
        <HugeiconsIcon icon={MicroscopeIcon} size={14} className="text-primary" />
        <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
          Recent Research
        </span>
      </div>
      {MOCK_RECENT_JOBS.map((job) => (
        <div
          key={job.id}
          className="flex items-center gap-3 p-2.5 rounded-lg border border-border bg-card hover:border-primary/30 transition-colors"
        >
          <HugeiconsIcon icon={CheckmarkCircle01Icon} size={14} className="text-green-500 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-[12px] font-bold text-foreground truncate">{job.title}</p>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[10px] text-muted-foreground font-mono">{job.id}</span>
              <span className="text-[10px] text-muted-foreground">{job.date}</span>
            </div>
          </div>
          <span className="text-[10px] font-bold text-muted-foreground">{job.sources} sources</span>
        </div>
      ))}
      <a
        href="/workspace"
        className="flex items-center gap-1.5 text-[11px] font-bold text-primary hover:underline mt-2"
      >
        Open Workspace <HugeiconsIcon icon={ArrowUpRight01Icon} size={10} />
      </a>
    </div>
  );
}

function WorkspaceStatsCard() {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-1">
        <HugeiconsIcon icon={BarChartIcon} size={14} className="text-primary" />
        <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
          Workspace Stats
        </span>
      </div>
      <div className="grid grid-cols-3 gap-2">
        <div className="p-3 rounded-lg border border-border bg-card text-center">
          <p className="text-lg font-extrabold text-foreground">42</p>
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
            Total Jobs
          </p>
        </div>
        <div className="p-3 rounded-lg border border-border bg-card text-center">
          <p className="text-lg font-extrabold text-primary">284</p>
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
            Sources
          </p>
        </div>
        <div className="p-3 rounded-lg border border-border bg-card text-center">
          <p className="text-lg font-extrabold text-foreground">38</p>
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
            Scripts
          </p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className="p-3 rounded-lg border border-border bg-card text-center">
          <p className="text-lg font-extrabold text-foreground">5</p>
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
            Collections
          </p>
        </div>
        <div className="p-3 rounded-lg border border-border bg-card text-center">
          <p className="text-lg font-extrabold text-foreground">3</p>
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
            Active Crons
          </p>
        </div>
      </div>
    </div>
  );
}

function JobStatusCard() {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 mb-1">
        <HugeiconsIcon icon={BookOpenTextIcon} size={14} className="text-primary" />
        <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
          Job Status
        </span>
      </div>
      <div className="p-3 rounded-lg border border-border bg-card space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[12px] font-bold text-foreground">
            CRISPR Gene Editing Revolution
          </span>
          <span className="text-[9px] px-2 py-0.5 rounded-full font-extrabold uppercase bg-green-100 text-green-700">
            Done
          </span>
        </div>
        <div className="flex items-center gap-4 text-[10px] text-muted-foreground">
          <span className="font-mono">JOB-042</span>
          <span>8/8 sources captured</span>
          <span>2,840 words</span>
        </div>
        {/* Mini progress bar */}
        <div className="flex items-center gap-1">
          {['Queued', 'Researching', 'Capturing', 'Writing', 'Done'].map((step, i) => (
            <React.Fragment key={step}>
              <div className="w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                <HugeiconsIcon icon={CheckmarkCircle01Icon} size={8} className="text-white" />
              </div>
              {i < 4 && <div className="h-0.5 flex-1 bg-primary" />}
            </React.Fragment>
          ))}
        </div>
      </div>
      <a
        href="/job-detail"
        className="flex items-center gap-1.5 text-[11px] font-bold text-primary hover:underline mt-2"
      >
        Open Job Detail <HugeiconsIcon icon={ArrowUpRight01Icon} size={10} />
      </a>
    </div>
  );
}

function JobSourcesCard() {
  const sources = [
    { id: 's1', title: 'Nature: CRISPR Cancer Trials 2025', domain: 'nature.com', status: 'done' },
    { id: 's2', title: 'NIH: Gene Therapy Progress Report', domain: 'nih.gov', status: 'done' },
    {
      id: 's3',
      title: 'Science: Ethical Frameworks for Genome Editing',
      domain: 'science.org',
      status: 'done',
    },
    { id: 's4', title: 'WHO: Global Gene Therapy Guidelines', domain: 'who.int', status: 'done' },
  ];
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 mb-3">
        <HugeiconsIcon icon={BookOpenTextIcon} size={14} className="text-primary" />
        <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
          Job Sources
        </span>
        <span className="ml-auto text-[10px] font-bold text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
          {sources.length} of 8
        </span>
      </div>
      {sources.map((src) => (
        <div
          key={src.id}
          className="flex items-center gap-2.5 p-2 rounded-lg border border-border bg-card"
        >
          <HugeiconsIcon icon={CheckmarkCircle01Icon} size={12} className="text-green-500 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-bold text-foreground truncate">{src.title}</p>
            <p className="text-[10px] text-muted-foreground">{src.domain}</p>
          </div>
        </div>
      ))}
      <a
        href="/job-detail"
        className="flex items-center gap-1.5 text-[11px] font-bold text-primary hover:underline mt-2"
      >
        View All Sources <HugeiconsIcon icon={ArrowUpRight01Icon} size={10} />
      </a>
    </div>
  );
}

function JobScriptCard() {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 mb-1">
        <HugeiconsIcon icon={File02Icon} size={14} className="text-primary" />
        <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
          Script Preview
        </span>
      </div>
      <div className="p-3 rounded-lg border border-border bg-card space-y-2">
        <p className="text-[13px] font-bold text-foreground">
          CRISPR & Cancer: The Gene Editing Revolution
        </p>
        <div className="text-[11px] text-muted-foreground leading-relaxed line-clamp-4">
          Imagine being told you have cancer — and then, six months later, doctors use a molecular
          pair of scissors to snip the disease out of your DNA. This isn&apos;t science fiction. It
          happened...
        </div>
        <div className="flex items-center gap-3 pt-1 text-[10px] text-muted-foreground">
          <span>7 segments</span>
          <span>2,840 words</span>
          <span>~21m read</span>
        </div>
      </div>
      <a
        href="/job-detail"
        className="flex items-center gap-1.5 text-[11px] font-bold text-primary hover:underline mt-2"
      >
        Open Full Script <HugeiconsIcon icon={ArrowUpRight01Icon} size={10} />
      </a>
    </div>
  );
}

function GDriveBackupCard() {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 mb-1">
        <HugeiconsIcon icon={UploadIcon} size={14} className="text-primary" />
        <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
          Backup to Google Drive
        </span>
      </div>
      <div className="p-3 rounded-lg border border-border bg-card space-y-2">
        <div className="flex items-center gap-2">
          <HugeiconsIcon icon={CheckmarkCircle01Icon} size={14} className="text-green-500" />
          <span className="text-[12px] font-bold text-foreground">Backup initiated</span>
        </div>
        <p className="text-[10px] text-muted-foreground">
          Uploading research data, scripts, and sources to Google Drive. You can manage backup
          settings in the Storages page.
        </p>
        <div className="flex items-center gap-3 pt-1">
          <span className="text-[10px] font-bold text-muted-foreground">3 jobs selected</span>
          <span className="text-[10px] font-bold text-muted-foreground">~2.4 MB</span>
        </div>
      </div>
      <a
        href="/storages"
        className="flex items-center gap-1.5 text-[11px] font-bold text-primary hover:underline mt-2"
      >
        Open Storages <HugeiconsIcon icon={ArrowUpRight01Icon} size={10} />
      </a>
    </div>
  );
}

const CARD_MAP: Record<CommandType, React.FC> = {
  cron_list: CronListCard,
  cron_run: CronRunCard,
  cron_pause: CronPauseCard,
  cron_delete: CronDeleteCard,
  workspace_search: WorkspaceSearchCard,
  workspace_recent: WorkspaceRecentCard,
  workspace_stats: WorkspaceStatsCard,
  job_status: JobStatusCard,
  job_sources: JobSourcesCard,
  job_script: JobScriptCard,
  gdrive_backup: GDriveBackupCard,
};

export default function CommandResponseCard({ commandType }: CommandResponseCardProps) {
  const CardComponent = CARD_MAP[commandType];
  if (!CardComponent) return null;

  return (
    <div className="my-2 p-3 rounded-xl border border-border bg-card/50 max-w-[480px]">
      <CardComponent />
    </div>
  );
}
