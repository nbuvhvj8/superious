'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { check, Update } from '@tauri-apps/plugin-updater';
import { relaunch } from '@tauri-apps/plugin-process';
import { HugeiconsIcon } from '@hugeicons/react';
import { Cancel01Icon, Download01Icon, RefreshIcon } from '@hugeicons/core-free-icons';

type UpdateStatus = 'idle' | 'available' | 'downloading' | 'installed' | 'error';

export default function UpdaterManager() {
  const [status, setStatus] = useState<UpdateStatus>('idle');
  const [update, setUpdate] = useState<Update | null>(null);
  const [isDismissed, setIsDismissed] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkForUpdates = useCallback(async () => {
    try {
      if (typeof window !== 'undefined' && (window as any).__TAURI_INTERNALS__) {
        const result = await check();
        if (result) {
          setUpdate(result);
          setStatus('available');
          console.log(`Update available: ${result.version}`);
        } else {
          setUpdate(null);
          setStatus('idle');
        }
      }
    } catch (err) {
      console.error('Failed to check for updates:', err);
      setError('Failed to check for updates');
    }
  }, []);

  useEffect(() => {
    // Check on startup
    checkForUpdates();

    // Check hourly
    const interval = setInterval(checkForUpdates, 1000 * 60 * 60);
    return () => clearInterval(interval);
  }, [checkForUpdates]);

  const handleUpdate = async () => {
    if (!update) return;

    try {
      setStatus('downloading');
      await update.downloadAndInstall((event) => {
        switch (event.event) {
          case 'Started':
            console.log('Update download started');
            break;
          case 'Progress':
            // Could add progress percentage here if needed
            break;
          case 'Finished':
            console.log('Update download finished');
            break;
        }
      });
      setStatus('installed');
      await relaunch();
    } catch (err) {
      console.error('Failed to install update:', err);
      setStatus('error');
      setError('Failed to install update');
    }
  };

  if (isDismissed || status === 'idle' || !update) {
    return null;
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-[1000] animate-in slide-in-from-top duration-300">
      <div className="mx-auto mt-2 max-w-[500px] bg-yellow-400 text-yellow-950 px-4 py-2 rounded-[8px] shadow-lg flex items-center justify-between gap-4 border border-yellow-500/20">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-full bg-yellow-500/20 flex items-center justify-center shrink-0">
            {status === 'downloading' ? (
              <HugeiconsIcon icon={RefreshIcon} size={16} className="animate-spin" />
            ) : (
              <HugeiconsIcon icon={Download01Icon} size={16} />
            )}
          </div>
          <div className="truncate">
            <p className="text-[13px] font-bold leading-tight">
              {status === 'downloading'
                ? 'Downloading Update...'
                : status === 'installed'
                  ? 'Update Installed!'
                  : `Version ${update.version} is available!`}
            </p>
            <p className="text-[11px] font-medium opacity-80 truncate">
              {status === 'downloading'
                ? 'Please wait while we prepare the latest version.'
                : status === 'installed'
                  ? 'Relaunching application...'
                  : 'A new version is ready to be installed.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {status === 'available' && (
            <>
              <button
                onClick={handleUpdate}
                className="bg-yellow-950 text-white px-3 py-1.5 rounded-[6px] text-[12px] font-bold hover:bg-yellow-900 transition-colors active:scale-[0.97]"
              >
                Update Now
              </button>
              <button
                onClick={() => setIsDismissed(true)}
                className="p-1.5 hover:bg-yellow-500/20 rounded-[6px] transition-colors text-yellow-950/60 hover:text-yellow-950"
                aria-label="Dismiss"
              >
                <HugeiconsIcon icon={Cancel01Icon} size={16} />
              </button>
            </>
          )}
          {(status === 'downloading' || status === 'installed') && (
            <div className="px-3 py-1.5 text-[12px] font-bold opacity-60">
              {status === 'downloading' ? 'Working...' : 'Ready'}
            </div>
          )}
          {status === 'error' && (
            <button
              onClick={() => setStatus('available')}
              className="bg-red-500 text-white px-3 py-1.5 rounded-[6px] text-[12px] font-bold"
            >
              Retry
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
