'use client';

import React from 'react';

export default function GreetingMessage() {
  return (
    <div className="flex flex-col items-center justify-center pt-8 pb-6">
      {/* Logo box: 52x52, r14, primary bg, italic "o" */}
      <div className="w-[52px] h-[52px] rounded-[14px] bg-primary flex items-center justify-center mb-6 shadow-sm">
        <span className="text-white text-[22px] font-bold italic select-none">o</span>
      </div>

      {/* Title */}
      <h1 className="text-[20px] font-bold text-foreground text-center tracking-tight mb-2">
        What are you researching today?
      </h1>

      {/* Subtitle */}
      <p className="text-[13px] text-muted-foreground text-center max-w-[360px] leading-relaxed">
        I&apos;ll search the web, capture sources and write a structured video script.
      </p>
    </div>
  );
}
