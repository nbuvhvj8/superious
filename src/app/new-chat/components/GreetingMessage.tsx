'use client';

import React from 'react';
import AppLogo from '@/components/ui/AppLogo';

export default function GreetingMessage() {
  return (
    <div className="flex flex-col items-center justify-center pt-8 pb-2">
      <div className="flex items-center gap-3 mb-2">
        <AppLogo size={64} />
        <h1 className="text-[30px] font-bold text-foreground text-center tracking-tight">
          What are you researching today?
        </h1>
      </div>
    </div>
  );
}
