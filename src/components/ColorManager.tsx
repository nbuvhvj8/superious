'use client';

import React, { useEffect } from 'react';
import { PROVIDERS } from '@/lib/providers';

export function ColorManager() {
  useEffect(() => {
    // App Color
    const savedColor = localStorage.getItem('app_color');
    if (savedColor) {
      document.documentElement.style.setProperty('--primary', savedColor);
    }

    // Model Cleanup
    const stored = localStorage.getItem('chat_models');
    if (stored) {
      try {
        const currentModels = JSON.parse(stored) as string[];
        const allValidModels = PROVIDERS.flatMap(p => p.models || []);
        const filtered = currentModels.filter(m => allValidModels.includes(m));

        if (filtered.length !== currentModels.length) {
          localStorage.setItem('chat_models', JSON.stringify(filtered));
          // Broadcast update so ChatInput picks up the filtered list
          window.dispatchEvent(new CustomEvent('superious:chat-models-update'));
        }
      } catch (_e) {
        // ignore
      }
    }
  }, []);

  return null;
}
