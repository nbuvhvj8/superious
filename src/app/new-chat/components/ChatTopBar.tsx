import React from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { PencilEdit01Icon } from '@hugeicons/core-free-icons';

interface ChatTopBarProps {
  onNewChat?: () => void;
  showNewChat?: boolean;
}

export default function ChatTopBar({ onNewChat, showNewChat = false }: ChatTopBarProps) {
  return (
    <header className="h-[56px] flex-shrink-0 flex items-center justify-between px-4 border-b border-white bg-background">
      {/* Left Group */}
      <div className="flex items-center gap-3">
        {showNewChat && (
          <button
            onClick={onNewChat}
            className="flex items-center gap-1 group hover:opacity-80 transition-opacity"
          >
            <HugeiconsIcon icon={PencilEdit01Icon} size={15} className="text-primary" />
            <span className="text-[12px] font-semibold text-primary">New research</span>
          </button>
        )}
      </div>

      {/* Right Group */}
      <div className="flex items-center gap-1"></div>
    </header>
  );
}
