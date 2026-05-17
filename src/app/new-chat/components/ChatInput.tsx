

import React, { useRef, useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { Plus, ChevronDown } from 'lucide-react';
import SendButton from './ChatInput/SendButton';
import { useChatModels } from '@/lib/use-chat-models';

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  selectedModel?: string;
  onModelChange?: (model: string) => void;
  isGenerating?: boolean;
  showDisclaimer?: boolean;
}

export interface ChatInputHandle {
  focus: () => void;
}

const ChatInput = forwardRef<ChatInputHandle, ChatInputProps>(
  ({ value, onChange, onSend, selectedModel: propSelectedModel, onModelChange, isGenerating = false, showDisclaimer = false }, ref) => {
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const [isFocused, setIsFocused] = useState(false);
    const [localSelectedModel, setLocalSelectedModel] = useState('Select Model');
    const [showModels, setShowModels] = useState(false);
    const availableModels = useChatModels();

    const currentModel = propSelectedModel || localSelectedModel;
    const setCurrentModel = (model: string) => {
      if (onModelChange) {
        onModelChange(model);
      } else {
        setLocalSelectedModel(model);
      }
    };

    useEffect(() => {
      if (availableModels.length > 0 && currentModel === 'Select Model') {
        setCurrentModel(availableModels[0]);
      }
    }, [availableModels, currentModel]);

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
      <div className="w-full max-w-[720px] mx-auto flex flex-col relative">
        {/* Main Input Area */}
        <div
          className={`
            w-full rounded-[12px] border border-border bg-white transition-all duration-200 relative z-10
            ${isFocused ? 'border-[#d8d8d8] shadow-[0_2px_4px_rgba(0,0,0,0.03)]' : 'border-[#e5e5e5] shadow-[0_1px_2px_rgba(0,0,0,0.02)]'}
            ${isGenerating ? 'opacity-90' : ''}
          `}
        >
          {/* Textarea Row */}
          <div className="px-[14px] pt-[12px] pb-[4px]">
            <textarea
              ref={textareaRef}
              placeholder="Ask anything or start a research..."
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
              <button
                type="button"
                className="flex items-center justify-center w-[32px] h-[32px] rounded-full text-foreground/70 hover:bg-[#0000000d] transition-all"
              >
                <Plus size={20} />
              </button>
            </div>

            {/* Right Tools & Send */}
            <div className="flex items-center gap-3">
              {showDisclaimer && (
                <div className="h-[24px] px-2 bg-[#f2f3f6] rounded-[6px] text-[11px] font-bold text-muted-foreground flex items-center justify-center">
                  <span className="leading-none">{currentModel}</span>
                </div>
              )}
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

        {/* Attachment Section (Slid below) - Only in empty state */}
        {!showDisclaimer && (
          <div
            className={`
              h-[45px] w-full bg-[#f9f9f9] border border-t-0 border-border rounded-b-[12px] 
              flex items-center justify-end px-3 transition-all duration-300 -mt-2 pt-2 relative z-0
              ${isFocused ? 'border-[#d8d8d8]' : 'border-[#e5e5e5]'}
            `}
          >
            {/* Model Selection Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowModels(!showModels)}
                className="
                  flex items-center gap-1.5 px-2.5 py-1 rounded-lg
                  text-[12px] font-bold text-muted-foreground/80 hover:bg-muted/80 hover:text-foreground
                  transition-all duration-150
                "
              >
                <span>{currentModel}</span>
                <ChevronDown
                  size={13}
                  className={`transition-transform duration-200 ${showModels ? 'rotate-180' : ''}`}
                />
              </button>

              {showModels && (
                <div className="absolute top-full right-0 mt-2 w-52 bg-white border border-border rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.2)] py-1.5 z-50 animate-slide-up max-h-[120px] overflow-y-auto scrollbar-thin">
                  {availableModels.length > 0 ? (
                    availableModels.map((model) => (
                      <button
                        key={model}
                        onClick={() => {
                          setCurrentModel(model);
                          setShowModels(false);
                        }}
                        className={`
                          w-full text-left px-3 py-2 text-xs flex items-center justify-between transition-colors
                          ${currentModel === model ? 'bg-primary/5 text-primary font-bold' : 'text-foreground hover:bg-muted'}
                        `}
                      >
                        {model}
                      </button>
                    ))
                  ) : (
                    <div className="px-3 py-2 text-[11px] text-muted-foreground italic">
                      No models selected in settings
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Disclaimer */}
        {showDisclaimer && (
          <p className="text-[11px] text-muted-foreground/60 text-center mt-[8px] select-none font-medium">
            outlier can make mistakes. Review important sources before publishing.
          </p>
        )}
      </div>
    );
  }
);

ChatInput.displayName = 'ChatInput';

export default ChatInput;
