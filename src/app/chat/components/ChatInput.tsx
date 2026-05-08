'use client';

import React from 'react';
import { ArrowUp, Plus } from 'lucide-react';

export default function ChatInput() {
  return (
    <div
      className="flex items-end gap-3 rounded-[12px] bg-input border border-border p-3 transition-all duration-200 focus-within:ring-2 focus-within:ring-ring focus-within:border-transparent"
      style={{ width: '800px' }}
    >
      {/* Plus icon - left bottom */}
      <button
        className="mb-1 p-1 text-muted-foreground transition-colors duration-150 hover:text-foreground shrink-0"
        aria-label="Add attachment"
      >
        <Plus size={16} strokeWidth={2.25} />
      </button>

      {/* Input area */}
      <textarea
        placeholder="Type your message..."
        className="flex-1 bg-transparent text-foreground placeholder:text-[#94a3b8] resize-none outline-none text-base font-medium h-[120px]"
      />

      {/* Arrow up icon - right bottom - circular */}
      <button
        className="mb-1 p-2 rounded-full bg-primary text-primary-foreground transition-opacity duration-150 hover:opacity-90 shrink-0"
        aria-label="Send message"
      >
        <ArrowUp size={16} strokeWidth={2.25} />
      </button>
    </div>
  );
}
