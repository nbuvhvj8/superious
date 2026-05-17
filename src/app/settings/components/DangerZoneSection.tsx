'use client';

import React, { useState } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { Alert01Icon, Delete02Icon, ImageNotFound01Icon } from '@hugeicons/core-free-icons';
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
      <section id="danger-zone" className="space-y-12">
        <div className="flex items-center gap-2.5 pb-1 border-b border-red-100">
          <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center">
            <HugeiconsIcon icon={Alert01Icon} size={15} className="text-red-600" />
          </div>
          <div>
            <h2 className="text-base font-bold text-red-600">Danger Zone</h2>
          </div>
        </div>

        <div className="space-y-8">
          {/* Clear All Jobs */}
          <div className="flex items-start justify-between gap-8">
            <div className="space-y-1 flex-1">
              <div className="flex items-center gap-2 text-red-600">
                <HugeiconsIcon icon={Delete02Icon} size={14} />
                <h3 className="text-sm font-medium">Delete All Jobs</h3>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed max-w-md">
                Permanently deletes all 24 jobs, their scripts, source records, and queued tasks.
                This action cannot be undone.
              </p>
              {clearedJobs && (
                <p className="text-[11px] text-primary font-bold uppercase tracking-wider mt-2">
                  All jobs deleted successfully.
                </p>
              )}
            </div>
            <button
              onClick={() => setClearJobsOpen(true)}
              disabled={clearedJobs}
              className="h-9 px-4 bg-red-50 rounded-[8px] text-[12px] font-bold text-red-600 hover:bg-red-100 transition-all disabled:opacity-50 shrink-0"
            >
              Delete All Jobs
            </button>
          </div>

          {/* Purge Screenshots */}
          <div className="flex items-start justify-between gap-8">
            <div className="space-y-1 flex-1">
              <div className="flex items-center gap-2 text-red-600">
                <HugeiconsIcon icon={ImageNotFound01Icon} size={14} />
                <h3 className="text-sm font-medium">Purge All Screenshots</h3>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed max-w-md">
                Deletes all 340 MB of captured screenshots. Job records and scripts are preserved,
                but source thumbnails will no longer load.
              </p>
              {purgedScreenshots && (
                <p className="text-[11px] text-primary font-bold uppercase tracking-wider mt-2">
                  All screenshots purged successfully.
                </p>
              )}
            </div>
            <button
              onClick={() => setPurgeScreenshotsOpen(true)}
              disabled={purgedScreenshots}
              className="h-9 px-4 bg-red-50 rounded-[8px] text-[12px] font-bold text-red-600 hover:bg-red-100 transition-all disabled:opacity-50 shrink-0"
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
