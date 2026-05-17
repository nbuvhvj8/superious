import React from 'react';
import AppLogo from '@/components/ui/AppLogo';

export default function GreetingMessage() {
  return (
    <div className="flex flex-col items-center justify-center pt-24 pb-10 px-6">
      <div className="flex flex-col items-center gap-6 max-w-[500px] text-center">
        <AppLogo size={80} />
        <div className="space-y-2">
          <h1 className="text-[32px] font-bold text-foreground tracking-tight">
            Hello, ready to research?
          </h1>
          <p className="text-[16px] text-muted-foreground leading-relaxed">
            I&apos;m your autonomous research partner. Give me a topic, and I&apos;ll explore
            sources, structure insights, and draft professional video scripts for you.
          </p>
        </div>
      </div>
    </div>
  );
}
