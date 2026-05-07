'use client';

import React from 'react';
import { ArrowUp, Plus } from 'lucide-react';

export default function ChatInput() {
  return (
    <div className="relative rounded-[12px] bg-gray-100 p-3" style={{ width: '800px', height: '120px' }}>
      {/* Input area */}
      <textarea
        placeholder="Type your message..."
        className="w-full h-full bg-transparent text-foreground placeholder:text-muted-foreground resize-none outline-none text-base font-medium pr-16"
      />

      {/* Plus icon - left bottom */}
      <button
        className="absolute bottom-3 left-3 p-1 text-muted-foreground transition-colors duration-150 hover:text-foreground"
        aria-label="Add attachment"
      >
        <Plus size={16} strokeWidth={2.25} />
      </button>

      {/* Arrow up icon - right bottom - circular */}
      <button
        className="absolute bottom-3 right-3 p-2 rounded-full bg-primary text-primary-foreground transition-opacity duration-150 hover:opacity-90"
        aria-label="Send message"
      >
        <ArrowUp size={16} strokeWidth={2.25} />
      </button>
    </div>
  );
}
