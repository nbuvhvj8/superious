'use client';

import React from 'react';
import { Feather } from 'lucide-react';

export default function ThinkingIndicator() {
  return (
    <div className="flex items-start gap-3 mb-6 animate-fade-in">
      {/* AI Avatar with Feather Icon */}
      <div className="w-[30px] h-[30px] shrink-0 mt-1 flex items-center justify-center text-primary select-none">
        <Feather size={16} strokeWidth={2.5} />
      </div>

      {/* Shimmering Bubble */}
      <div className="relative overflow-hidden bg-white border border-border rounded-t-[16px] rounded-br-[16px] rounded-bl-[4px] px-4 py-3 shadow-sm min-w-[180px]">
        {/* Shimmer Effect */}
        <div className="absolute inset-0 z-0">
          <div className="h-full w-full bg-gradient-to-r from-transparent via-primary/5 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
        </div>
        
        <div className="relative z-10 flex items-center gap-2.5">
          {/* Pulsing Dots */}
          <div className="flex gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-primary/40 animate-pulse [animation-delay:-0.3s]" />
            <div className="w-1.5 h-1.5 rounded-full bg-primary/40 animate-pulse [animation-delay:-0.15s]" />
            <div className="w-1.5 h-1.5 rounded-full bg-primary/40 animate-pulse" />
          </div>
          
          <span className="text-[13px] font-medium text-muted-foreground/80 italic">
            Superious is thinking...
          </span>
        </div>
      </div>
    </div>
  );
}
