'use client';

import { useEffect, useRef } from 'react';
import { isTauri } from './tauri';

// Electron-matched zoom steps
const ZOOM_LEVELS = [0.33, 0.5, 0.67, 0.75, 0.8, 0.9, 1.0, 1.1, 1.25, 1.5, 1.75, 2.0];
const ZOOM_DEFAULT = 1.0;
const STORE_PATH = 'settings.json';
const ZOOM_KEY = 'zoom-level';

/**
 * Custom hook to manage Tauri webview zoom level with persistence and layout compensation.
 */
export function useZoom() {
  const currentLevelIndex = useRef(ZOOM_LEVELS.indexOf(ZOOM_DEFAULT));
  const storeRef = useRef<{
    set: (key: string, value: number) => Promise<void>;
    save: () => Promise<void>;
    get: (key: string) => Promise<unknown>;
  } | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const applyLayoutCompensation = (zoom: number) => {
      if (!isTauri()) return;

      const html = document.documentElement;

      if (zoom < 1.0) {
        const factor = (100 / zoom).toFixed(4) + '%';
        html.style.width = factor;
        html.style.height = factor;
      } else {
        html.style.width = '';
        html.style.height = '';
      }
    };

    const initZoom = async () => {
      let savedZoom: number | null = null;

      if (isTauri()) {
        try {
          const { getCurrentWebviewWindow } = await import('@tauri-apps/api/webviewWindow');
          const { load } = await import('@tauri-apps/plugin-store');
          const appWindow = getCurrentWebviewWindow();

          const store = await load(STORE_PATH);
          storeRef.current = store;

          const zoomValue = (await store.get(ZOOM_KEY)) as number | null;
          if (zoomValue !== null) {
            savedZoom = zoomValue;
          }
        } catch (error) {
          console.warn('Tauri zoom initialization failed, falling back to localStorage:', error);
        }
      }

      // Fallback to localStorage if Tauri store failed or not in Tauri
      if (savedZoom === null) {
        const localValue = localStorage.getItem(ZOOM_KEY);
        if (localValue) {
          savedZoom = parseFloat(localValue);
        }
      }

      if (savedZoom !== null) {
        // Find closest discrete level
        const closest = ZOOM_LEVELS.reduce((prev, curr) =>
          Math.abs(curr - savedZoom!) < Math.abs(prev - savedZoom!) ? curr : prev
        );
        currentLevelIndex.current = ZOOM_LEVELS.indexOf(closest);
        const zoomValue = ZOOM_LEVELS[currentLevelIndex.current];

        if (isTauri()) {
          try {
            const { getCurrentWebviewWindow } = await import('@tauri-apps/api/webviewWindow');
            const appWindow = getCurrentWebviewWindow();
            await appWindow.setZoom(zoomValue);
            applyLayoutCompensation(zoomValue);
          } catch (err) {
            console.error('Failed to set initial zoom:', err);
          }
        }
      }
    };

    const handleKeyDown = async (e: KeyboardEvent) => {
      // Intercept Ctrl (Windows/Linux) or Cmd (Mac)
      if (!(e.ctrlKey || e.metaKey)) return;

      // Only handle and preventDefault if in Tauri to avoid breaking browser zoom
      if (!isTauri()) return;

      const key = e.key;
      let changed = false;

      if (key === '=' || key === '+') {
        e.preventDefault();
        if (currentLevelIndex.current < ZOOM_LEVELS.length - 1) {
          currentLevelIndex.current++;
          changed = true;
        }
      } else if (key === '-') {
        e.preventDefault();
        if (currentLevelIndex.current > 0) {
          currentLevelIndex.current--;
          changed = true;
        }
      } else if (key === '0') {
        e.preventDefault();
        currentLevelIndex.current = ZOOM_LEVELS.indexOf(ZOOM_DEFAULT);
        changed = true;
      }

      if (changed) {
        try {
          const zoomValue = ZOOM_LEVELS[currentLevelIndex.current];

          const { getCurrentWebviewWindow } = await import('@tauri-apps/api/webviewWindow');
          const appWindow = getCurrentWebviewWindow();
          await appWindow.setZoom(zoomValue);
          applyLayoutCompensation(zoomValue);

          if (storeRef.current) {
            await storeRef.current.set(ZOOM_KEY, zoomValue);
            await storeRef.current.save();
          }
          // Always update localStorage as well for robustness
          localStorage.setItem(ZOOM_KEY, zoomValue.toString());
        } catch (err) {
          console.error('Failed to apply zoom:', err);
        }
      }
    };

    initZoom();
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);
}
