'use client';
import { useEffect } from 'react';

export default function ZoomManager() {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check for Ctrl/Cmd + Plus/Minus or = (often used as + on keyboards)
      if ((e.ctrlKey || e.metaKey) && (e.key === '+' || e.key === '-' || e.key === '=')) {
        e.preventDefault();
        
        const zoomStep = 0.1;
        const currentZoom = parseFloat(document.body.style.zoom || '1');
        
        let newZoom = currentZoom;
        if (e.key === '+' || e.key === '=') newZoom += zoomStep;
        if (e.key === '-') newZoom -= zoomStep;
        
        // Clamp zoom between 0.5 and 3.0
        newZoom = Math.max(0.5, Math.min(newZoom, 3.0));
        document.body.style.zoom = newZoom.toString();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return null;
}
