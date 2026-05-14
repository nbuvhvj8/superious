'use client';

import React, { useMemo, useState } from 'react';
import AppLayout from '@/components/AppLayout';
import { Bell, Clock, ExternalLink, Filter, Plus, Trash2 } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import RecaptureDiffTimeline from './components/RecaptureDiffTimeline';

interface ScheduleJob {
  id: string;
  title: string;
  type: 'Recapture' | 'Automated Research' | 'Archive Snapshot';
  schedule: string;
  lastRun: string;
  status: 'active' | 'paused';
}

const MOCK_SCHEDULES: ScheduleJob[] = [
  {
    id: 'cron-1',
    title: 'Netflix Streaming Trends',
    type: 'Recapture',
    schedule: 'Every Monday at 9:00 AM',
    lastRun: '2 days ago',
    status: 'active',
  },
  {
    id: 'cron-2',
    title: 'Weekly Tech News Roundup',
    type: 'Automated Research',
    schedule: 'Every Friday at 5:00 PM',
    lastRun: '5 days ago',
    status: 'active',
  },
  {
    id: 'cron-3',
    title: 'Source Archive: AI Ethics',
    type: 'Archive Snapshot',
    schedule: 'Monthly on the 1st',
    lastRun: '28 days ago',
    status: 'paused',
  },
];

const TYPE_FILTERS = [
  { key: 'filter-all', label: 'All', value: 'all' },
  { key: 'filter-recapture', label: 'Recapture', value: 'Recapture' },
  { key: 'filter-research', label: 'Research', value: 'Automated Research' },
  { key: 'filter-archive', label: 'Archive', value: 'Archive Snapshot' },
] as const;

const OPENING_OPTIONS = [
  {
    title: 'Competitive Intel',
    description:
      'Rescan the web for your research topics. Get notified if major new sources or conflicting data are found.',
    action: 'Schedule Recapture',
    type: 'recapture' as const,
  },
  {
    title: 'Automated Research',
    description:
      'Schedule entire research jobs in advance. Perfect for recurring news or fixed posting schedules.',
    action: 'New Automated Job',
    type: 'research' as const,
  },
  {
    title: 'Archive Snapshots',
    description:
      'Create recurring snapshots of URL lists to ensure evidence remains accessible even if sites go down.',
    action: 'New Archive Job',
    type: 'archive' as const,
  },
];

export default function CronJobPage() {
  const [activeTab, setActiveTab] = useState<(typeof TYPE_FILTERS)[number]['value']>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'recapture' | 'research' | 'archive'>('recapture');

  const filtered = useMemo(
    () => MOCK_SCHEDULES.filter((j) => activeTab === 'all' || j.type === activeTab),
    [activeTab]
  );

  return (
    <AppLayout>
      <div className="mx-auto w-full max-w-[1300px] px-8 py-8">
        <div className="min-h-[600px] overflow-hidden rounded-[12px] border border-[#ebedf2] bg-white p-10 pt-6">
          <header className="mb-8 flex items-start justify-between gap-4">
            <div>
              <h1 className="text-[28px] font-bold tracking-tight text-foreground">Cron Jobs</h1>
              <p className="mt-2 max-w-[720px] text-sm text-muted-foreground">
                Schedule recurring jobs with the same settings/chat UI language: soft surfaces,
                compact controls, and clear status state.
              </p>
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-2 rounded-full border border-[#e2e5ec] bg-[#f2f3f6] px-4 py-2 text-[13px] font-bold text-foreground transition-colors hover:bg-[#e9ecf2]"
            >
              <Plus size={14} /> Create New
            </button>
          </header>

          <section className="mb-6 rounded-[10px] border border-[#ebedf2] bg-[#fafafa] p-5">
            <h2 className="text-[16px] font-bold">Create schedule templates</h2>
            <div className="mt-4 grid gap-4 md:grid-cols-3">
              {OPENING_OPTIONS.map((item) => (
                <article
                  key={item.title}
                  className="rounded-[8px] border border-[#ebedf2] bg-white p-4"
                >
                  <h3 className="text-sm font-semibold">{item.title}</h3>
                  <p className="mt-1 text-xs text-muted-foreground">{item.description}</p>
                  <button
                    onClick={() => {
                      setModalType(item.type);
                      setIsModalOpen(true);
                    }}
                    className="mt-3 inline-flex items-center gap-2 rounded-[8px] bg-[#f2f3f6] px-3 py-1.5 text-[12px] font-bold"
                  >
                    <Plus size={13} /> {item.action}
                  </button>
                </article>
              ))}
            </div>
          </section>

          <section className="overflow-hidden rounded-[10px] border border-[#ebedf2]">
            <div className="flex items-center justify-between border-b border-[#ebedf2] bg-[#fafafa] px-5 py-3 gap-3 flex-wrap">
              <div className="flex items-center gap-2">
                <Filter size={13} className="text-muted-foreground" />
                {TYPE_FILTERS.map((f) => (
                  <button
                    key={f.key}
                    onClick={() => setActiveTab(f.value)}
                    className={`rounded-full px-3 py-1 text-[11px] font-bold transition-colors ${
                      activeTab === f.value
                        ? 'bg-foreground text-background'
                        : 'bg-[#f2f3f6] text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
              <span className="rounded-full bg-[#f2f3f6] px-3 py-1 text-[11px] font-bold text-muted-foreground">
                {filtered.length} schedules
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#ebedf2] bg-[#fafafa] text-xs uppercase tracking-wider text-muted-foreground">
                    <th className="px-5 py-3 text-left">Schedule</th>
                    <th className="px-4 py-3 text-left">Type</th>
                    <th className="px-4 py-3 text-left">Timing</th>
                    <th className="px-4 py-3 text-left">Last Run</th>
                    <th className="px-4 py-3 text-left">Status</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((job, i) => (
                    <tr
                      key={job.id}
                      className={`border-b border-[#ebedf2] ${i % 2 ? 'bg-[#fcfcfc]' : ''}`}
                    >
                      <td className="px-5 py-3">
                        <p className="font-semibold">{job.title}</p>
                        <p className="font-mono text-[10px] text-muted-foreground">{job.id}</p>
                      </td>
                      <td className="px-4 py-3 text-xs font-semibold">{job.type}</td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-1.5 text-xs">
                          <Clock size={13} />
                          {job.schedule}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">{job.lastRun}</td>
                      <td className="px-4 py-3 text-xs font-semibold capitalize">{job.status}</td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-1">
                          <button className="rounded-[6px] p-1.5 hover:bg-[#f2f3f6]">
                            <Bell size={14} />
                          </button>
                          <button className="rounded-[6px] p-1.5 hover:bg-[#f2f3f6]">
                            <ExternalLink size={14} />
                          </button>
                          <button className="rounded-[6px] p-1.5 text-red-500 hover:bg-red-50">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <div className="mt-8">
            <RecaptureDiffTimeline />
          </div>
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={
          modalType === 'recapture'
            ? 'Schedule Competitive Intel'
            : modalType === 'research'
              ? 'Schedule Automated Research'
              : 'Schedule Archive Snapshot'
        }
      >
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Quick setup is ready. In the next step, choose cadence, channels, and notification
            endpoints.
          </p>
          <button className="rounded-[8px] bg-foreground px-4 py-2 text-sm font-semibold text-background">
            Continue
          </button>
        </div>
      </Modal>
    </AppLayout>
  );
}
