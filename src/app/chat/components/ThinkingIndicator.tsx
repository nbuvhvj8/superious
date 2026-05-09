'use client';

import React from 'react';
import { ChevronDown } from 'lucide-react';

export default function ThinkingIndicator() {
  return (
    <div className="mb-6 animate-fade-in">
      <details className="group max-w-[85%]">
        <summary className="list-none cursor-pointer select-none inline-flex items-center gap-2 text-[13px] text-muted-foreground/90">
          <span className="relative pr-1">thinking</span>
          <ChevronDown size={14} className="transition-transform group-open:rotate-180" />
        </summary>
        <div className="mt-2 pl-1 text-[12px] text-muted-foreground/80 space-y-1.5">
          <p>1. thinking</p>
          <p>2. searching</p>
          <p>3. thinking</p>
          <p>4. tool call</p>
          <p>5. searching</p>
          <p>6. thinking</p>
        </div>
      </details>
    </div>
  );
}
