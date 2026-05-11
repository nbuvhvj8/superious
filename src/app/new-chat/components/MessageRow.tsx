'use client';

import React, { useState } from 'react';
import { Copy, RefreshCw, ThumbsUp, ThumbsDown, Check, Feather, Edit3, ChevronDown, User } from 'lucide-react';
import StreamingText from './StreamingText';
import CommandResponseCard, { type CommandType } from './CommandResponseCard';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  /** Marks an assistant message as actively streaming so the typewriter caret renders. */
  streaming?: boolean;
  /**
   * Skip the typewriter animation. Used for messages restored from history,
   * the user's own bubble, and any UX where instant rendering is desired.
   */
  instant?: boolean;
  /** When set, renders a CommandResponseCard instead of regular text content. */
  commandType?: string;
}

interface MessageRowProps {
  message: Message;
  onRegenerate?: () => void;
  onEdit?: () => void;
}

export default function MessageRow({ message, onRegenerate, onEdit }: MessageRowProps) {
  const isAI = message.role === 'assistant';
  const [copied, setCopied] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  // Determine if content needs expansion
  const isLongMessage = !isAI && message.content.length > 300; 

  return (
    <div className={`group/msg w-full flex flex-col items-start ${isAI ? 'mb-8' : 'mb-1'} animate-fade-in px-4 md:px-0`}>
      <div className="flex items-start w-full max-w-[720px] mx-auto gap-2">
        <div className="flex-1 flex flex-col gap-1 min-w-0">
          {/* Bubble */}
          <div className={`
            relative w-full text-[15px] leading-relaxed
            ${isAI ? 'text-foreground px-0 py-1' : 'bg-[#f9f9f9] text-foreground rounded-[8px] px-4 py-3 max-w-[720px]'}
            ${!isAI && !isExpanded && isLongMessage ? 'max-h-[160px] overflow-hidden' : ''}
            transition-all duration-300
          `}>
            {isAI ? (
              message.commandType ? (
                <CommandResponseCard commandType={message.commandType as CommandType} />
              ) : message.streaming && !message.content.trim() ? (
                <div className="inline-flex items-center gap-2">
                  <span className="text-[14px] font-semibold shimmer-text">Thinking...</span>
                </div>
              ) : (
                <StreamingText
                  text={message.content}
                  instant={message.instant ?? !message.streaming}
                  showCaret={message.streaming === true}
                />
              )
            ) : (
              <div className="whitespace-pre-wrap max-w-[720px] w-full break-words">{message.content}</div>
            )}

            {/* Expand Chevron for User Bubble */}
            {!isAI && isLongMessage && (
              <button 
                onClick={() => setIsExpanded(!isExpanded)}
                className={`
                  absolute bottom-0 left-0 w-full h-10 flex items-center justify-center
                  bg-gradient-to-t from-[#f9f9f9] via-[#f9f9f9]/90 to-transparent pt-4
                  ${isExpanded ? 'relative bg-none h-6 mt-1' : ''}
                  hover:text-primary transition-colors z-10
                `}
              >
                <ChevronDown size={14} className={`transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
              </button>
            )}
          </div>

          {/* AI Icons Below Bubble */}
          {isAI && !message.streaming && (
            <div className="flex items-center gap-1 mt-2 transition-opacity">
                <button
                  onClick={handleCopy}
                  className="p-1.5 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-all"
                  title={copied ? 'Copied!' : 'Copy'}
                >
                  {copied ? <Check size={14} className="text-primary" /> : <Copy size={14} />}
                </button>
                <button
                  onClick={onRegenerate}
                  className="p-1.5 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-all"
                  title="Regenerate"
                >
                  <RefreshCw size={14} />
                </button>
                <button className="p-1.5 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-all" title="Good Response">
                  <ThumbsUp size={14} />
                </button>
                <button className="p-1.5 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-all" title="Bad Response">
                  <ThumbsDown size={14} />
                </button>
            </div>
          )}
        </div>

        {/* User Icons in behind bubble */}
        {!isAI && (
          <div className="flex flex-col gap-1 mt-3 opacity-0 group-hover/msg:opacity-100 transition-opacity shrink-0">
             <button
                onClick={onEdit}
                className="p-1 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-all"
                title="Edit"
              >
                <Edit3 size={13} />
              </button>
              <button
                onClick={handleCopy}
                className="p-1 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-all"
                title={copied ? 'Copied!' : 'Copy'}
              >
                {copied ? <Check size={13} className="text-primary" /> : <Copy size={13} />}
              </button>
          </div>
        )}
      </div>
    </div>
  );
}
