'use client';

import { useState, useEffect, useCallback } from 'react';

/**
 * Custom event name for broadcasting chat model updates across the app.
 */
const CHAT_MODELS_UPDATE_EVENT = 'superious:chat-models-update';

/**
 * Hook to reactively track and manage the list of available chat models.
 * Listens for local changes and cross-tab storage events.
 */
export function useChatModels() {
  const [models, setModels] = useState<string[]>([]);

  const loadModels = useCallback(() => {
    const stored = localStorage.getItem('chat_models');
    if (stored) {
      try {
        setModels(JSON.parse(stored) as string[]);
      } catch (_e) {
        console.error('Failed to parse chat models from storage', _e);
        setModels([]);
      }
    } else {
      setModels([]);
    }
  }, []);

  useEffect(() => {
    // Initial load
    loadModels();

    // Listen for custom broadcast event (same-tab updates)
    const handleUpdate = () => loadModels();
    window.addEventListener(CHAT_MODELS_UPDATE_EVENT, handleUpdate);

    // Listen for storage event (cross-tab updates)
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'chat_models') loadModels();
    };
    window.addEventListener('storage', handleStorage);

    return () => {
      window.removeEventListener(CHAT_MODELS_UPDATE_EVENT, handleUpdate);
      window.removeEventListener('storage', handleStorage);
    };
  }, [loadModels]);

  return models;
}

/**
 * Broadcasts an update to all listeners that the chat models list has changed.
 * Use this after modifying 'chat_models' in localStorage.
 */
export function broadcastModelsUpdate() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(CHAT_MODELS_UPDATE_EVENT));
  }
}

/**
 * Safely adds a list of models to the global chat_models list and broadcasts the change.
 */
export function syncModelsToStorage(newModels: string[]) {
  if (typeof window === 'undefined') return;

  const stored = localStorage.getItem('chat_models') || '[]';
  try {
    const currentModels = JSON.parse(stored) as string[];
    let changed = false;

    newModels.forEach((m) => {
      if (!currentModels.includes(m)) {
        currentModels.push(m);
        changed = true;
      }
    });

    if (changed) {
      localStorage.setItem('chat_models', JSON.stringify(currentModels));
      broadcastModelsUpdate();
    }
  } catch (_e) {
    localStorage.setItem('chat_models', JSON.stringify(newModels));
    broadcastModelsUpdate();
  }
}
