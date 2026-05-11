'use client';

import React, { useState } from 'react';
import { Trash2, AlertTriangle, ImageOff } from 'lucide-react';
import ConfirmModal from '@/components/ui/ConfirmModal';

export default function DangerZoneSection() {
  const [clearJobsOpen, setClearJobsOpen] = useState(false);
  const [purgeScreenshotsOpen, setPurgeScreenshotsOpen] = useState(false);
  const [clearingJobs, setClearingJobs] = useState(false);
  const [purgingScreenshots, setPurgingScreenshots] = useState(false);
  const [clearedJobs, setClearedJobs] = useState(false);
  const [purgedScreenshots, setPurgedScreenshots] = useState(false);

  async function handleClearJobs() {
    setClearingJobs(true);
    // TODO: Connect to DELETE /api/v1/jobs?all=true
    await new Promise((r) => setTimeout(r, 1200));
    setClearingJobs(false);
    setClearJobsOpen(false);
    setClearedJobs(true);
  }

  async function handlePurgeScreenshots() {
    setPurgingScreenshots(true);
    // TODO: Connect to DELETE /api/v1/storage/screenshots?purge=true
    await new Promise((r) => setTimeout(r, 1500));
    setPurgingScreenshots(false);
    setPurgeScreenshotsOpen(false);
    setPurgedScreenshots(true);
  }

  return (
    <>
      <section id="danger-zone" className="space-y-8">
        <div className="flex items-center gap-2.5 pb-1 border-b border-red-200/60">
          <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center">
            <AlertTriangle size={15} className="text-red-600" />
          </div>
          <div>
            <h2 className="text-base font-bold text-red-700">Danger Zone</h2>
            <p className="text-xs text-muted-foreground">
              Destructive actions — these cannot be undone.
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {/* Clear All Jobs */}
          <div className="flex items-start justify-between gap-4 p-4 rounded-xl border border-red-200 bg-red-50/50">
            <div className="space-y-0.5 min-w-0">
              <div className="flex items-center gap-2">
                <Trash2 size={14} className="text-red-600 shrink-0" />
                <p className="text-sm font-bold text-foreground">Delete All Jobs</p>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Permanently deletes all 24 jobs, their scripts, source records, and queued tasks.
                Screenshots are also removed from Supabase Storage.
              </p>
              {clearedJobs && (
                <p className="text-xs text-primary font-semibold mt-1">
                  All jobs deleted successfully.
                </p>
              )}
            </div>
            <button
              onClick={() => setClearJobsOpen(true)}
              className="btn-danger shrink-0 text-xs py-1.5 px-3"
              disabled={clearedJobs}
            >
              Delete All Jobs
            </button>
          </div>

          {/* Purge Screenshots */}
          <div className="flex items-start justify-between gap-4 p-4 rounded-xl border border-red-200 bg-red-50/50">
            <div className="space-y-0.5 min-w-0">
              <div className="flex items-center gap-2">
                <ImageOff size={14} className="text-red-600 shrink-0" />
                <p className="text-sm font-bold text-foreground">Purge All Screenshots</p>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Deletes all 340 MB of captured screenshots from Supabase Storage immediately. Job
                records and scripts are preserved, but source thumbnails will no longer load.
              </p>
              {purgedScreenshots && (
                <p className="text-xs text-primary font-semibold mt-1">
                  All screenshots purged successfully.
                </p>
              )}
            </div>
            <button
              onClick={() => setPurgeScreenshotsOpen(true)}
              className="btn-danger shrink-0 text-xs py-1.5 px-3"
              disabled={purgedScreenshots}
            >
              Purge Screenshots
            </button>
          </div>
        </div>
      </section>

      <ConfirmModal
        open={clearJobsOpen}
        onClose={() => setClearJobsOpen(false)}
        onConfirm={handleClearJobs}
        title="Delete All Jobs"
        description="This will permanently delete all 24 jobs, their scripts, source records, and all associated screenshots from Supabase Storage. This cannot be undone."
        confirmLabel="Delete All Jobs"
        loading={clearingJobs}
      />

      <ConfirmModal
        open={purgeScreenshotsOpen}
        onClose={() => setPurgeScreenshotsOpen(false)}
        onConfirm={handlePurgeScreenshots}
        title="Purge All Screenshots"
        description="This will immediately delete all 340 MB of captured screenshots from Supabase Storage. Job records and scripts are preserved, but source thumbnails will no longer be viewable. This cannot be undone."
        confirmLabel="Purge Screenshots"
        loading={purgingScreenshots}
      />
    </>
  );
}
