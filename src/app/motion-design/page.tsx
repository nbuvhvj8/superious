import React from 'react';
import AppLayout from '@/components/AppLayout';
import MotionDesignGallery from './components/MotionDesignGallery';

export default function MotionDesignPage() {
  return (
    <AppLayout>
      <div className="min-h-full px-6 lg:px-8 xl:px-10 2xl:px-14 py-8 max-w-screen-2xl mx-auto">
        <div className="space-y-1 mb-8">
          <h1 className="text-3xl font-bold text-foreground tracking-tight">
            Motion Design Studio
          </h1>
          <p className="text-base text-muted-foreground">
            Transform your captured assets into professional motion graphics with newspaper
            animations, film effects, and kinetic transitions.
          </p>
        </div>

        <MotionDesignGallery />
      </div>
    </AppLayout>
  );
}
