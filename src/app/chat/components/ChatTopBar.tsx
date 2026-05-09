'use client';

import React from 'react';
import {
  Edit3,
  ChevronDown,
  Share2,
  History,
  MoreHorizontal,
  Brain,
  HardDrive,
} from 'lucide-react';

interface ChatTopBarProps {
  model?: string;
  onNewChat?: () => void;
  onToggleActivity?: () => void;
  onOpenBackup?: () => void;
}

export default function ChatTopBar({
  model = 'claude-sonnet',
  onNewChat,
  onToggleActivity,
  onOpenBackup,
}: ChatTopBarProps) {
  const getModelDotColor = (m: string) => {
    switch (m) {
      case 'claude-sonnet':
        return '#8A9A6B';
      case 'claude-haiku':
        return '#7BAFC7';
      case 'gemini-flash':
        return '#9B8EC4';
      case 'gpt-4o':
        return '#74B07A';
      default:
        return '#8A9A6B';
    }
  };

  const getModelLabel = (m: string) => {
    switch (m) {
      case 'claude-sonnet':
        return 'Claude 3.5 Sonnet';
      case 'claude-haiku':
        return 'Claude 3 Haiku';
      case 'gemini-flash':
        return 'Gemini 1.5 Flash';
      case 'gpt-4o':
        return 'GPT-4o';
      default:
        return m;
    }
  };

  return (
    <header className="h-[56px] flex-shrink-0 flex items-center justify-between px-4 border-b border-border/40 bg-background">
      {/* Left Group */}
      <div className="flex items-center gap-3">
        <button
          onClick={onNewChat}
          className="flex items-center gap-1 group hover:opacity-80 transition-opacity"
        >
          <Edit3 size={15} className="text-primary" />
          <span className="text-[12px] font-semibold text-primary">New research</span>
        </button>

        <button className="h-[30px] rounded-full border border-border px-2 flex items-center gap-1.5 hover:bg-muted/50 transition-colors">
          <span
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: getModelDotColor(model) }}
          />
          <span className="text-[12.5px] font-medium text-foreground">{getModelLabel(model)}</span>
          <ChevronDown size={14} className="text-muted-foreground" />
        </button>
      </div>

      {/* Right Group */}
      <div className="flex items-center gap-1">
        <button
          onClick={onToggleActivity}
          className="h-8 px-2.5 flex items-center gap-1.5 rounded-lg text-muted-foreground hover:bg-primary/10 hover:text-primary transition-all"
          title="Agent Activity"
        >
          <Brain size={15} />
          <span className="text-[11px] font-semibold hidden sm:inline">Activity</span>
        </button>
        <button
          onClick={onOpenBackup}
          className="h-8 px-2.5 flex items-center gap-1.5 rounded-lg text-muted-foreground hover:bg-primary/10 hover:text-primary transition-all"
          title="Backup to Google Drive"
        >
          <HardDrive size={15} />
          <span className="text-[11px] font-semibold hidden sm:inline">Backup</span>
        </button>
        <div className="w-px h-5 bg-border/60 mx-1" />
        <button className="w-8 h-8 flex items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-all">
          <Share2 size={16} />
        </button>
        <button className="w-8 h-8 flex items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-all">
          <History size={16} />
        </button>
        <button className="w-8 h-8 flex items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-all">
          <MoreHorizontal size={16} />
        </button>
      </div>
    </header>
  );
}
