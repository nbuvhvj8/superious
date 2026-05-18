/**
 * Utility to check if the app is running in a Tauri environment.
 */
export const isTauri = (): boolean => {
  return typeof window !== 'undefined' && (window as any).__TAURI_INTERNALS__ !== undefined;
};
