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
} from 'lucide-react';
import Modal from '@/components/ui/Modal';

export default function CronJobPage() {
  const [activeTab, setActiveTab] = useState<'all' | 'recapture' | 'research' | 'archive'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'recapture' | 'research' | 'archive'>('recapture');

  const openModal = (type: 'recapture' | 'research' | 'archive') => {
    setModalType(type);
    setIsModalOpen(true);
  };

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

        {/* Tab Navigation */}
        <div className="flex border-b border-border mb-8">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-3 text-sm font-bold transition-colors relative ${
              activeTab === 'all' ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            All Schedules
            {activeTab === 'all' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('recapture')}
            className={`px-4 py-3 text-sm font-bold transition-colors relative ${
              activeTab === 'recapture'
                ? 'text-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Competitive Intel
            {activeTab === 'recapture' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('research')}
            className={`px-4 py-3 text-sm font-bold transition-colors relative ${
              activeTab === 'research'
                ? 'text-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Automated Research
            {activeTab === 'research' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('archive')}
            className={`px-4 py-3 text-sm font-bold transition-colors relative ${
              activeTab === 'archive'
                ? 'text-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Archive Snapshots
            {activeTab === 'archive' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
            )}
          </button>
        </div>

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
              3 jobs running
            </div>
          </div>

          <div className="grid gap-4">
            {(activeTab === 'all' || activeTab === 'recapture') && (
              <JobCard
                title="Netflix Streaming Trends"
                type="Recapture"
                schedule="Every Monday at 9:00 AM"
                lastRun="2 days ago"
                status="active"
                nextRun="In 5 days"
                icon={<Zap size={18} className="text-blue-500" />}
              />
            )}

            {(activeTab === 'all' || activeTab === 'research') && (
              <JobCard
                title="Weekly Tech News Roundup"
                type="Automated Research"
                schedule="Every Friday at 5:00 PM"
                lastRun="5 days ago"
                status="active"
                nextRun="In 2 days"
                icon={<FileSearch size={18} className="text-purple-500" />}
              />
            )}

            {(activeTab === 'all' || activeTab === 'archive') && (
              <JobCard
                title="Source Archive: AI Ethics"
                type="Archive Snapshot"
                schedule="Monthly on the 1st"
                lastRun="28 days ago"
                status="paused"
                nextRun="Paused"
                icon={<Archive size={18} className="text-emerald-500" />}
              />
            )}
          </div>
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

function JobCard({
  title,
  type,
  schedule,
  lastRun,
  status,
  nextRun,
  icon,
}: {
  title: string;
  type: string;
  schedule: string;
  lastRun: string;
  status: 'active' | 'paused';
  nextRun: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="bg-card border border-border rounded-xl p-5 flex items-center gap-5 group hover:border-primary/50 transition-all hover:shadow-sm">
      <div className="w-12 h-12 bg-muted rounded-xl flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-3 mb-1">
          <h4 className="font-bold text-lg leading-tight truncate">{title}</h4>
          <span
            className={`text-[10px] px-2 py-0.5 rounded-full font-extrabold uppercase tracking-widest ${
              type === 'Recapture'
                ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                : type === 'Automated Research'
                  ? 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400'
                  : 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400'
            }`}
          >
            {type}
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
          <div className="flex items-center gap-1.5 font-medium">
            <Clock size={14} className="text-foreground/40" />
            {schedule}
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-1 h-1 rounded-full bg-border" />
            Last run: {lastRun}
          </div>
          <div className="flex items-center gap-1.5 text-primary/80 font-medium">
            <div className="w-1 h-1 rounded-full bg-primary/40" />
            Next: {nextRun}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-muted/50 rounded-lg mr-2 border border-transparent group-hover:border-border transition-colors">
          <div
            className={`w-2 h-2 rounded-full ${status === 'active' ? 'bg-green-500 animate-pulse' : 'bg-amber-500'}`}
          />
          <span className="text-xs font-bold capitalize">{status}</span>
        </div>

        <div className="flex items-center bg-muted/30 rounded-lg p-1">
          <button
            className="p-2 hover:bg-background hover:text-primary rounded-md text-muted-foreground transition-all"
            title="Run now"
          >
            <Play size={18} fill="currentColor" className="opacity-50" />
          </button>
          <button
            className="p-2 hover:bg-background hover:text-foreground rounded-md text-muted-foreground transition-all"
            title="More options"
          >
            <MoreVertical size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
