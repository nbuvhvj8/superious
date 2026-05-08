'use client';

import React from 'react';
import { ArrowUp, Plus } from 'lucide-react';

export default function ChatInput() {
  return (
    <div
      className="
        flex items-end gap-2 w-full min-h-[100px]
        rounded-[20px] bg-card border border-border/50
        shadow-[0_2px_12px_rgba(0,0,0,0.04),0_1px_4px_rgba(0,0,0,0.02)]
        p-3 transition-all duration-200
        focus-within:border-primary/40 focus-within:ring-[4px] focus-within:ring-primary/5
      "
    >
      {/* Plus icon wrapper */}
      <div className="flex items-center justify-center shrink-0 mb-1">
        <button
          className="
            p-2 text-muted-foreground/70 transition-all duration-200
            hover:text-foreground hover:bg-muted rounded-xl
          "
          aria-label="Add attachment"
        >
          <Plus size={22} strokeWidth={2} />
        </button>
      </div>

      {/* Input area */}
      <textarea
        placeholder="Type your message..."
        className="
          flex-1 bg-transparent text-foreground placeholder:text-muted-foreground/50
          resize-none outline-none text-[16px] leading-relaxed font-medium
          py-2.5 px-2 min-h-[44px] max-h-[400px]
        "
        rows={1}
        onInput={(e) => {
          const target = e.target as HTMLTextAreaElement;
          target.style.height = 'auto';
          target.style.height = `${target.scrollHeight}px`;
        }}
      />

      {/* Arrow up icon wrapper */}
      <div className="flex items-center justify-center shrink-0 mb-1">
        <button
          className="
            p-2.5 rounded-full bg-primary text-primary-foreground
            transition-all duration-200 hover:opacity-90 active:scale-95
            shadow-md shadow-primary/20
          "
          aria-label="Send message"
        >
          <ArrowUp size={20} strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
}
