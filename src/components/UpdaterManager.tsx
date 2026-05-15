'use client';
import { useEffect } from 'react';
import { check } from '@tauri-apps/plugin-updater';

export default function UpdaterManager() {
  useEffect(() => {
    async function checkForUpdates() {
      try {
        const update = await check();
        if (update) {
          console.log(`Update available: ${update.version}`);
          // In a real app, you'd show a UI modal here to ask the user
          // to download and install:
          // await update.downloadAndInstall();
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
