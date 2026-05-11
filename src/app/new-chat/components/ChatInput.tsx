'use client';

import React, { useRef, useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { Paperclip, ChevronDown, Sparkles } from 'lucide-react';
import SendButton from './ChatInput/SendButton';

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  isGenerating?: boolean;
}

export interface ChatInputHandle {
  focus: () => void;
}

const ChatInput = forwardRef<ChatInputHandle, ChatInputProps>(
  (
    { value, onChange, onSend, isGenerating = false },
    ref
  ) => {
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const [isFocused, setIsFocused] = useState(false);
    const [selectedModel, setSelectedModel] = useState('Select Model');
    const [showModels, setShowModels] = useState(false);
    const [availableModels, setAvailableModels] = useState<string[]>([]);

    useEffect(() => {
      const stored = localStorage.getItem('chat_models');
      if (stored) {
        const models = JSON.parse(stored) as string[];
        setAvailableModels(models);
        if (models.length > 0 && selectedModel === 'Select Model') {
          setSelectedModel(models[0]);
        }
      }
    }, [selectedModel]);

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

    return (
      <div className="w-full max-w-[720px] mx-auto flex flex-col group/input">
        {/* Main Input Area */}
        <div
          className={`
            w-full rounded-t-[12px] border border-border bg-white transition-all duration-200
            ${isFocused ? 'border-[#d8d8d8] shadow-[0_1px_2px_rgba(0,0,0,0.03)]' : 'border-[#e5e5e5] shadow-[0_1px_2px_rgba(0,0,0,0.02)]'}
            ${isGenerating ? 'opacity-90' : ''}
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
                text-[15px] leading-relaxed text-foreground placeholder:text-muted-foreground/50
                min-h-[44px] max-h-[180px] scrollbar-thin
                ${isGenerating ? 'pointer-events-none' : ''}
              `}
              rows={1}
              maxLength={2000}
            />
          </div>

          {/* Toolbar Row */}
          <div className="flex items-center justify-between px-[10px] pt-[2px] pb-[8px]">
            {/* Left Tools */}
            <div className="flex items-center gap-1">
              <button className="flex items-center gap-1.5 px-2.5 h-[30px] rounded-lg text-muted-foreground hover:bg-muted/60 hover:text-foreground transition-all">
                <Paperclip size={15} />
                <span className="text-[12px] font-medium hidden sm:inline">Attach</span>
              </button>
            </div>

            {/* Right Tools & Send */}
            <div className="flex items-center gap-3">
              {value.length > 1500 && (
                <span
                  className={`text-[10px] font-medium tabular-nums ${value.length > 1800 ? 'text-amber-600' : 'text-muted-foreground'}`}
                >
                  {value.length}/2000
                </span>
              )}
              <SendButton
                state={isGenerating ? 'stop' : value.trim() ? 'ready' : 'empty'}
                onClick={onSend}
              />
            </div>
          </div>
        </div>

        {/* Gray Bottom Section */}
        <div 
          className={`
            h-[45px] w-full bg-[#f9f9f9] border border-t-0 border-border rounded-b-[12px] 
            flex items-center justify-end px-3 transition-colors duration-200
            ${isFocused ? 'border-[#d8d8d8]' : 'border-[#e5e5e5]'}
          `}
        >
          {/* Model Selection Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowModels(!showModels)}
              className="
                flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg
                text-[12px] font-semibold text-muted-foreground hover:bg-muted/80 hover:text-foreground
                transition-all duration-150
              "
            >
              <Sparkles size={13} className="text-primary/70" />
              <span>{selectedModel}</span>
              <ChevronDown size={13} className={`transition-transform duration-200 ${showModels ? 'rotate-180' : ''}`} />
            </button>

            {showModels && (
              <div className="absolute bottom-full right-0 mb-2 w-48 bg-white border border-border rounded-xl shadow-xl py-1.5 z-50 animate-slide-up">
                <div className="px-3 py-1.5 border-b border-border/50 mb-1">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Available Models</span>
                </div>
                {availableModels.length > 0 ? (
                  availableModels.map((model) => (
                    <button
                      key={model}
                      onClick={() => {
                        setSelectedModel(model);
                        setShowModels(false);
                      }}
                      className={`
                        w-full text-left px-3 py-2 text-sm transition-colors
                        ${selectedModel === model ? 'bg-primary/5 text-primary font-bold' : 'text-foreground hover:bg-muted'}
                      `}
                    >
                      {model}
                    </button>
                  ))
                ) : (
                  <div className="px-3 py-2 text-xs text-muted-foreground italic">No models detected</div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Disclaimer */}
        <p className="text-[11px] text-muted-foreground/60 text-center mt-[8px] select-none font-medium">
          outlier can make mistakes. Review important sources before publishing.
        </p>
      </div>
    );
  }
);

ChatInput.displayName = 'ChatInput';

export default ChatInput;
