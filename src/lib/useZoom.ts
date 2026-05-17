'use client';

import { useEffect, useRef } from 'react';

const ZOOM_MIN = 0.5;
const ZOOM_MAX = 2.0;
const ZOOM_STEP = 0.1;
const ZOOM_DEFAULT = 1.0;
const STORE_PATH = 'settings.json';
const ZOOM_KEY = 'zoom-level';

/**
 * Custom hook to manage Tauri webview zoom level with persistence.
 * Intercepts Ctrl+, Ctrl- and Ctrl0 to scale the UI visually.
 */
export function useZoom() {
  const zoomLevel = useRef(ZOOM_DEFAULT);
  const storeRef = useRef<{
    set: (key: string, value: number) => Promise<void>;
    save: () => Promise<void>;
  } | null>(null);

  useEffect(() => {
    // Only run in browser/Tauri environment
    if (typeof window === 'undefined') return;

    // Dynamically import Tauri APIs to avoid errors in non-Tauri environments (like browsers or playwright)
    let appWindow: { setZoom: (zoom: number) => Promise<void> } | null = null;
    let load:
      | ((path: string) => Promise<{
          get: (key: string) => Promise<unknown>;
          set: (key: string, value: number) => Promise<void>;
          save: () => Promise<void>;
        }>)
      | null = null;

    const initZoom = async () => {
      try {
        // Try to import Tauri APIs
        const webviewWindow = await import('@tauri-apps/api/webviewWindow');
        const storePlugin = await import('@tauri-apps/plugin-store');

        appWindow = webviewWindow.getCurrentWebviewWindow();
        load = storePlugin.load;

        // Initialize Tauri store for persistence
        if (!load) return;
        const store = await load(STORE_PATH);
        storeRef.current = store;

        // Load saved zoom level
        const savedZoom = await store.get(ZOOM_KEY);
        if (savedZoom !== null && typeof savedZoom === 'number') {
          // Clamp saved value just in case
          zoomLevel.current = Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, savedZoom));
          await appWindow.setZoom(zoomLevel.current);
        }
      } catch (error) {
        // Fallback or log if plugin is not configured or not in Tauri
        console.warn('Tauri APIs not available, zoom management may be limited:', error);
      }
    };

    const handleKeyDown = async (e: KeyboardEvent) => {
      // Intercept Ctrl (Windows/Linux) or Cmd (Mac)
      if (!(e.ctrlKey || e.metaKey)) return;

      let changed = false;

      if (e.key === '=' || e.key === '+') {
        // Ctrl + Plus (or Ctrl + =)
        e.preventDefault();
        zoomLevel.current = Math.min(ZOOM_MAX, zoomLevel.current + ZOOM_STEP);
        changed = true;
      } else if (e.key === '-') {
        // Ctrl + Minus
        e.preventDefault();
        zoomLevel.current = Math.max(ZOOM_MIN, zoomLevel.current - ZOOM_STEP);
        changed = true;
      } else if (e.key === '0') {
        // Ctrl + 0 (Reset)
        e.preventDefault();
        zoomLevel.current = ZOOM_DEFAULT;
        changed = true;
      }

      if (changed && appWindow) {
        try {
          // Apply zoom via Tauri API for pixel-perfect scaling without reflow
          await appWindow.setZoom(zoomLevel.current);

          // Persist the new zoom level
          if (storeRef.current) {
            await storeRef.current.set(ZOOM_KEY, zoomLevel.current);
            await storeRef.current.save();
          }
        } catch (err) {
          console.error('Failed to apply or save zoom level:', err);
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
