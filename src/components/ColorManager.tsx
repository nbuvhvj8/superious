'use client';

import { useEffect } from 'react';

export function ColorManager() {
  useEffect(() => {
    const savedColor = localStorage.getItem('app_color');
    if (savedColor) {
      document.documentElement.style.setProperty('--primary', savedColor);
    }
  }, []);

  return null;
}
