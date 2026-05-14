'use client';

import { useEffect } from 'react';

export function ColorManager() {
  useEffect(() => {
    // Apply saved accent color
    const savedColor = localStorage.getItem('app_color');
    if (savedColor) {
      document.documentElement.style.setProperty('--primary', savedColor);
    }

    // Apply saved theme
    const savedTheme = localStorage.getItem('appearance') || 'system';
    applyTheme(savedTheme);
  }, []);

  const applyTheme = (theme: string) => {
    if (theme === 'system') {
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
    } else {
      document.documentElement.setAttribute('data-theme', theme === 'dark' ? 'dark' : 'light');
    }
  };

  return null;
}
