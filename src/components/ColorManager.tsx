"use client";


import { useEffect } from 'react';

export function ColorManager() {
  useEffect(() => {
    // Apply saved accent color
    const savedColor = localStorage.getItem('app_color');
    if (savedColor) {
      document.documentElement.style.setProperty('--primary', savedColor);
    }

    // Force light theme
    document.documentElement.setAttribute('data-theme', 'light');
  }, []);

  return null;
}
