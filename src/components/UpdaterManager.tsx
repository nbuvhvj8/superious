'use client';
import { useEffect } from 'react';
import { check } from '@tauri-apps/plugin-updater';

export default function UpdaterManager() {
  useEffect(() => {
    async function checkForUpdates() {
      try {
        // Only run if we are inside the Tauri desktop shell
        if (typeof window !== 'undefined' && window.__TAURI_INTERNALS__) {
          const update = await check();
          if (update) {
            console.log(`Update available: ${update.version}`);
          }
        }
      } catch (err) {
        console.error('Failed to check for updates:', err);
      }
    }

    // Check on startup
    checkForUpdates();
  }, []);

  return null;
}
