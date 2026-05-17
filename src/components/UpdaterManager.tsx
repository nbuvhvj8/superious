
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
            console.log('Downloading and installing update...');
            await update.downloadAndInstall((event) => {
              switch (event.event) {
                case 'Started':
                  console.log(`Update download started. Content length: ${event.data.contentLength}`);
                  break;
                case 'Progress':
                  console.log(`Update download progress: ${event.data.chunkLength} bytes received`);
                  break;
                case 'Finished':
                  console.log('Update download finished.');
                  break;
              }
            });
            console.log('Update installed successfully. Please restart the app.');
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
