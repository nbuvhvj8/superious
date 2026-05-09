'use client';

import React, { useRef, useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { Paperclip, Globe, Camera, Brain } from 'lucide-react';
import SendButton from './ChatInput/SendButton';

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  isGenerating?: boolean;
  webSearchEnabled?: boolean;
  onToggleWebSearch?: () => void;
}

export interface ChatInputHandle {
  focus: () => void;
}

const ChatInput = forwardRef<ChatInputHandle, ChatInputProps>(
  (
    { value, onChange, onSend, isGenerating = false, webSearchEnabled = true, onToggleWebSearch },
    ref
  ) => {
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const [isFocused, setIsFocused] = useState(false);

    useImperativeHandle(ref, () => ({
      focus: () => {
        textareaRef.current?.focus();
      },
    }));

    // Auto-grow logic
    useEffect(() => {
      const textarea = textareaRef.current;
      if (textarea) {
        textarea.style.height = 'auto';
        textarea.style.height = `${Math.min(textarea.scrollHeight, 180)}px`;
      }
    }, [value]);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        if (!isGenerating && value.trim()) {
          onSend();
        }
      }
    };

    const getCardStyles = () => {
      if (isGenerating) return 'border-border bg-white opacity-100';
      if (isFocused) return 'border-[#C5D0A8] shadow-[0_0_0_3px_rgba(138,154,107,0.12)] bg-white';
      return 'border-border bg-white';
    };

    return (
      <div className="w-full max-w-[720px] mx-auto">
        {/* Input Card */}
        <div
          className={`
            w-full rounded-[28px] border-[1.5px] transition-all duration-200
            ${getCardStyles()}
          `}
        >
          {/* Textarea Row */}
          <div className="px-[14px] pt-[12px] pb-[4px]">
            <textarea
              ref={textareaRef}
              placeholder="Message Superious..."
              value={value}
              onChange={(e) => onChange(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              onKeyDown={handleKeyDown}
              disabled={isGenerating}
              className={`
                w-full bg-transparent border-none outline-none resize-none
                text-[15px] leading-relaxed text-foreground placeholder:text-muted-foreground/60
                min-h-[44px] max-h-[180px] scrollbar-thin
                ${isGenerating ? 'opacity-60 pointer-events-none' : ''}
              `}
              rows={1}
              maxLength={1000}
            />
          </div>

          {/* Toolbar Row */}
          <div className="flex items-center justify-between px-[10px] pt-[6px] pb-[10px]">
            {/* Left Tools */}
            <div className="flex items-center gap-0.5">
              <button className="tool-btn flex items-center gap-1.5 px-2.5 h-[30px] rounded-lg text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-all">
                <Paperclip size={15} />
                <span className="text-[12px] font-medium hidden sm:inline">Attach</span>
              </button>

              <div className="w-[1px] h-[18px] bg-border mx-1" />

              <button
                type="button"
                onClick={onToggleWebSearch}
                aria-pressed={webSearchEnabled}
                className={`tool-btn flex items-center gap-1.5 px-2.5 h-[30px] rounded-lg transition-all ${
                  webSearchEnabled
                    ? 'bg-[rgba(138,154,107,0.12)] text-[#6B7A52]'
                    : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                }`}
                title={
                  webSearchEnabled
                    ? 'Web search on — click to disable'
                    : 'Web search off — click to enable'
                }
              >
                <Globe size={15} />
                <span className="text-[12px] font-medium hidden sm:inline">Search</span>
              </button>

              <button className="tool-btn flex items-center gap-1.5 px-2.5 h-[30px] rounded-lg text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-all">
                <Camera size={15} />
                <span className="text-[12px] font-medium hidden sm:inline">Screenshot</span>
              </button>

              <button className="tool-btn flex items-center gap-1.5 px-2.5 h-[30px] rounded-lg text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-all">
                <Brain size={15} />
                <span className="text-[12px] font-medium hidden sm:inline">Deep</span>
              </button>
            </div>

            {/* Right Tools & Send */}
            <div className="flex items-center gap-3">
              {value.length > 800 && (
                <span
                  className={`text-[11px] font-medium tabular-nums ${value.length > 950 ? 'text-amber-600' : 'text-muted-foreground'}`}
                >
                  {value.length}/1000
                </span>
              )}
              <SendButton
                state={isGenerating ? 'stop' : value.trim() ? 'ready' : 'empty'}
                onClick={onSend}
              />
            </div>
          </div>
        </div>

        {/* Disclaimer */}
        <p className="text-[11px] text-muted-foreground text-center mt-[7px] select-none">
          outlier can make mistakes. Review important sources before publishing.
        </p>
      </div>
    );
  }
);

ChatInput.displayName = 'ChatInput';

export default ChatInput;
