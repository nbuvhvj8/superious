'use client';

import React, { useState } from 'react';
import AppLayout from '@/components/AppLayout';
import {
  Clock,
  Zap,
  FileSearch,
  Archive,
  Plus,
  Play,
  MoreVertical,
  Bell,
  Globe,
  History,
  Filter,
  Trash2,
  ExternalLink,
} from 'lucide-react';
import Modal from '@/components/ui/Modal';
import RecaptureDiffTimeline from './components/RecaptureDiffTimeline';

interface ScheduleJob {
  id: string;
  title: string;
  type: 'Recapture' | 'Automated Research' | 'Archive Snapshot';
  schedule: string;
  lastRun: string;
  status: 'active' | 'paused';
  nextRun: string;
}

const MOCK_SCHEDULES: ScheduleJob[] = [
  {
    id: 'cron-1',
    title: 'Netflix Streaming Trends',
    type: 'Recapture',
    schedule: 'Every Monday at 9:00 AM',
    lastRun: '2 days ago',
    status: 'active',
    nextRun: 'In 5 days',
  },
  {
    id: 'cron-2',
    title: 'Weekly Tech News Roundup',
    type: 'Automated Research',
    schedule: 'Every Friday at 5:00 PM',
    lastRun: '5 days ago',
    status: 'active',
    nextRun: 'In 2 days',
  },
  {
    id: 'cron-3',
    title: 'Source Archive: AI Ethics',
    type: 'Archive Snapshot',
    schedule: 'Monthly on the 1st',
    lastRun: '28 days ago',
    status: 'paused',
    nextRun: 'Paused',
  },
];

const TYPE_FILTERS: { key: string; label: string; value: string | 'all' }[] = [
  { key: 'filter-all', label: 'All', value: 'all' },
  { key: 'filter-recapture', label: 'Recapture', value: 'Recapture' },
  { key: 'filter-research', label: 'Research', value: 'Automated Research' },
  { key: 'filter-archive', label: 'Archive', value: 'Archive Snapshot' },
];

export default function CronJobPage() {
  const [activeTab, setActiveTab] = useState<string | 'all'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'recapture' | 'research' | 'archive'>('recapture');

  const openModal = (type: 'recapture' | 'research' | 'archive') => {
    setModalType(type);
    setIsModalOpen(true);
  };

  const filtered = MOCK_SCHEDULES.filter((j) => activeTab === 'all' || j.type === activeTab);

  return (
    <AppLayout>
      <div className="p-8 max-w-7xl mx-auto">
        <header className="mb-10">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 bg-primary/10 rounded-lg text-primary">
              <Clock size={20} />
            </div>
            <span className="text-sm font-bold text-primary uppercase tracking-widest">
              Automation
            </span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Cron Jobs</h1>
          <p className="text-muted-foreground mt-2 text-lg max-w-2xl">
            Automate your research workflow with scheduled tasks, competitive intelligence, and
            archival snapshots.
          </p>
        </header>

        {/* Quick Actions / Options Sections */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {/* Option 1: Competitive Intelligence */}
          <div className="bg-card border border-border rounded-xl p-6 shadow-sm hover:shadow-md transition-all group border-l-4 border-l-blue-500">
            <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center mb-4 text-blue-500">
              <Zap size={24} />
            </div>
            <h3 className="text-lg font-bold mb-2">Competitive Intel</h3>
            <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
              Rescan the web for your research topics. Get notified if major new sources or
              conflicting data are found.
            </p>
            <button
              onClick={() => openModal('recapture')}
              className="w-full py-2.5 px-4 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-2"
            >
              <Plus size={16} /> Schedule Recapture
            </button>
          </div>

          {/* Option 2: Automated Research */}
          <div className="bg-card border border-border rounded-xl p-6 shadow-sm hover:shadow-md transition-all group border-l-4 border-l-purple-500">
            <div className="w-12 h-12 bg-purple-500/10 rounded-lg flex items-center justify-center mb-4 text-purple-500">
              <FileSearch size={24} />
            </div>
            <h3 className="text-lg font-bold mb-2">Automated Research</h3>
            <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
              Schedule entire research jobs in advance. Perfect for recurring news or fixed posting
              schedules.
            </p>
            <button
              onClick={() => openModal('research')}
              className="w-full py-2.5 px-4 bg-purple-500 hover:bg-purple-600 text-white rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-2"
            >
              <Plus size={16} /> New Automated Job
            </button>
          </div>

          {/* Option 3: Archive Snapshots */}
          <div className="bg-card border border-border rounded-xl p-6 shadow-sm hover:shadow-md transition-all group border-l-4 border-l-emerald-500">
            <div className="w-12 h-12 bg-emerald-500/10 rounded-lg flex items-center justify-center mb-4 text-emerald-500">
              <Archive size={24} />
            </div>
            <h3 className="text-lg font-bold mb-2">Archive Snapshots</h3>
            <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
              Create recurring snapshots of URL lists to ensure evidence remains accessible even if
              sites go down.
            </p>
            <button
              onClick={() => openModal('archive')}
              className="w-full py-2.5 px-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-2"
            >
              <Plus size={16} /> New Archive Job
            </button>
          </div>
        </div>

        {/* Jobs List Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">Active Schedules</h2>
            <div className="text-sm font-semibold text-muted-foreground bg-muted px-3 py-1 rounded-full">
              {filtered.length} jobs running
            </div>
          </div>

          <div className="card overflow-hidden">
            {/* Table Toolbar */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-border gap-3 flex-wrap">
              <div className="flex items-center gap-1.5">
                <Filter size={13} className="text-muted-foreground" />
                <span className="text-xs font-semibold text-muted-foreground mr-2">Type</span>
                {TYPE_FILTERS.map((f) => (
                  <button
                    key={f.key}
                    onClick={() => {
                      setActiveTab(f.value);
                    }}
                    className={`
                      text-xs px-3 py-1 rounded-full font-semibold border transition-all duration-150
                      ${
                        activeTab === f.value
                          ? 'bg-primary text-primary-foreground border-primary'
                          : 'bg-muted text-muted-foreground border-border hover:border-primary hover:text-primary'
                      }
                    `}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/40">
                    <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider w-[30%]">
                      Schedule Name
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Type
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Schedule
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Last Run
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Status
                    </th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-5 py-14 text-center">
                        <div className="space-y-2">
                          <p className="text-sm font-semibold text-foreground">
                            No schedules found
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Try a different filter or create a new scheduled job.
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filtered.map((job, i) => (
                      <tr
                        key={job.id}
                        className={`
                          border-b border-border last:border-0 group
                          hover:bg-muted/40 transition-colors duration-100
                          ${i % 2 === 0 ? '' : 'bg-muted/20'}
                        `}
                      >
                        <td className="px-5 py-3.5">
                          <div>
                            <p className="text-sm font-semibold text-foreground leading-snug">
                              {job.title}
                            </p>
                            <span className="font-mono text-2xs text-muted-foreground block mt-0.5">
                              {job.id}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3.5">
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded-full font-extrabold uppercase tracking-widest ${
                              job.type === 'Recapture'
                                ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                                : job.type === 'Automated Research'
                                  ? 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400'
                                  : 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400'
                            }`}
                          >
                            {job.type}
                          </span>
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-1.5 font-medium text-foreground">
                            <Clock size={14} className="text-muted-foreground" />
                            <span className="text-xs">{job.schedule}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3.5">
                          <span className="text-xs text-muted-foreground">{job.lastRun}</span>
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-2">
                            <div
                              className={`w-2 h-2 rounded-full ${job.status === 'active' ? 'bg-green-500 animate-pulse' : 'bg-amber-500'}`}
                            />
                            <span className="text-xs font-bold capitalize">{job.status}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3.5 text-right">
                          <div className="flex items-center gap-1 justify-end opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                            <button
                              className="btn-ghost p-1.5 text-foreground hover:text-primary relative group/btn"
                              aria-label="Run now"
                            >
                              <Play size={14} fill="currentColor" className="opacity-50" />
                              <span className="absolute bottom-full mb-1.5 left-1/2 -translate-x-1/2 px-2 py-1 rounded bg-foreground text-background text-2xs font-medium whitespace-nowrap opacity-0 group-hover/btn:opacity-100 pointer-events-none transition-opacity duration-150 z-10">
                                Run now
                              </span>
                            </button>
                            <button
                              className="btn-ghost p-1.5 text-foreground relative group/btn"
                              aria-label="Edit"
                            >
                              <ExternalLink size={14} strokeWidth={2.25} />
                              <span className="absolute bottom-full mb-1.5 left-1/2 -translate-x-1/2 px-2 py-1 rounded bg-foreground text-background text-2xs font-medium whitespace-nowrap opacity-0 group-hover/btn:opacity-100 pointer-events-none transition-opacity duration-150 z-10">
                                Edit schedule
                              </span>
                            </button>
                            <button
                              className="btn-ghost p-1.5 text-foreground hover:text-red-500 relative group/btn"
                              aria-label="Delete"
                            >
                              <Trash2 size={14} strokeWidth={2.25} />
                              <span className="absolute bottom-full mb-1.5 left-1/2 -translate-x-1/2 px-2 py-1 rounded bg-foreground text-background text-2xs font-medium whitespace-nowrap opacity-0 group-hover/btn:opacity-100 pointer-events-none transition-opacity duration-150 z-10">
                                Delete
                              </span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="mt-12">
          <RecaptureDiffTimeline />
        </div>
      </div>

      {/* Configuration Modals */}
      <Modal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={
          modalType === 'recapture'
            ? 'Schedule Competitive Intel'
            : modalType === 'research'
              ? 'Schedule Automated Research'
              : 'Schedule Archive Snapshot'
        }
        size="lg"
      >
        <div className="p-6">
          {modalType === 'recapture' && (
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-foreground">Select Research Topic</label>
                <select className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500/20 outline-none">
                  <option>Netflix Streaming Trends</option>
                  <option>E-car Market 2024</option>
                  <option>SpaceX Starship Progress</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-foreground">Frequency</label>
                  <select className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm">
                    <option>Daily</option>
                    <option>Weekly</option>
                    <option>Bi-weekly</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-foreground">Time (UTC)</label>
                  <input
                    type="time"
                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm"
                    defaultValue="09:00"
                  />
                </div>
              </div>
              <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 flex gap-3 dark:bg-blue-900/10 dark:border-blue-900/20">
                <Bell size={18} className="text-blue-500 shrink-0 mt-0.5" />
                <div className="text-sm text-blue-700 dark:text-blue-300">
                  You will be notified in the <strong>Notification Modal</strong> if new sources or
                  conflicting data are found.
                </div>
              </div>
            </div>
          )}

          {modalType === 'research' && (
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-foreground">Job Name / Query</label>
                <input
                  placeholder="e.g. Current Trending Tech Topics"
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500/20 outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-foreground">Collection / Workspace</label>
                <select className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm">
                  <option>Agency Client A</option>
                  <option>YouTube Channel Tasks</option>
                  <option>Personal Research</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-foreground">Schedule Day</label>
                  <select className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm">
                    <option>Every Monday</option>
                    <option>Every Friday</option>
                    <option>Every Day</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-foreground">Ready By (Local Time)</label>
                  <input
                    type="time"
                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm"
                    defaultValue="12:00"
                  />
                </div>
              </div>
              <div className="bg-purple-50 border border-purple-100 rounded-lg p-4 flex gap-3 dark:bg-purple-900/10 dark:border-purple-900/20">
                <Globe size={18} className="text-purple-500 shrink-0 mt-0.5" />
                <div className="text-sm text-purple-700 dark:text-purple-300">
                  Ideal for &quot;Enterprise Research&quot;. This job will run automatically and
                  have a script draft ready by the deadline.
                </div>
              </div>
            </div>
          )}

          {modalType === 'archive' && (
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-foreground">URL List Source</label>
                <select className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm">
                  <option>Specific Research Job: AI Ethics</option>
                  <option>Manual URL List</option>
                  <option>Everything in &quot;Knowledge Base&quot;</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-foreground">Snapshots Retention</label>
                <select className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm">
                  <option>Keep all versions</option>
                  <option>Last 3 months</option>
                  <option>Last 5 versions</option>
                </select>
              </div>
              <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-4 flex gap-3 dark:bg-emerald-900/10 dark:border-emerald-900/20">
                <History size={18} className="text-emerald-500 shrink-0 mt-0.5" />
                <div className="text-sm text-emerald-700 dark:text-emerald-300">
                  Creates a &quot;Wayback Machine&quot; for your specific research. Evidence will
                  remain accessible even if the original site goes down.
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-border">
            <button
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-sm font-bold text-muted-foreground hover:text-foreground transition-colors"
            >
              Cancel
            </button>
            <button
              className={`px-6 py-2 rounded-lg text-white text-sm font-bold transition-all shadow-lg ${
                modalType === 'recapture'
                  ? 'bg-blue-500 hover:bg-blue-600 shadow-blue-500/20'
                  : modalType === 'research'
                    ? 'bg-purple-500 hover:bg-purple-600 shadow-purple-500/20'
                    : 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/20'
              }`}
            >
              Create{' '}
              {modalType === 'recapture'
                ? 'Recapture'
                : modalType === 'research'
                  ? 'Automated'
                  : 'Archive'}{' '}
              Job
            </button>
          </div>
        </div>
      </Modal>
    </AppLayout>
  );
}
