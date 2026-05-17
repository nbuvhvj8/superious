"use client";

import { useZoom } from '@/lib/useZoom';

/**
 * ZoomManager component that initializes the custom zoom behavior.
 * This replaces the native WebView zoom with Tauri's setZoom API to prevent layout reflow.
 */
export default function ZoomManager() {
  useZoom();
  return null;
}
