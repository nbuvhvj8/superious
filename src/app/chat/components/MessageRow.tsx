'use client';

import React, { useState } from 'react';
import { Copy, RefreshCw, ThumbsUp, ThumbsDown, Check, Feather, Edit3 } from 'lucide-react';
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

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div
      className={`group/msg w-full flex flex-col ${isAI ? 'items-start' : 'items-end'} mb-6 animate-fade-in`}
    >
      <div
        className={`flex items-start gap-3 max-w-[85%] ${isAI ? 'flex-row' : 'flex-row-reverse'}`}
      >
        {/* Avatar - Only for AI */}
        {isAI && (
          <div className="w-[30px] h-[30px] shrink-0 mt-1 flex items-center justify-center text-primary select-none">
            <Feather size={16} strokeWidth={2.5} />
          </div>
        )}

        {/* Bubble / Content */}
        <div
          className={`
          flex flex-col gap-2
          ${isAI ? 'items-start' : 'items-end'}
        `}
        >
          <div
            className={`
            text-[14px] leading-[1.65] 
            ${
              isAI
                ? 'text-foreground pt-1'
                : 'bg-muted text-foreground px-5 py-2.5 rounded-2xl border border-border'
            }
          `}
          >
            {isAI ? (
              message.commandType ? (
                <CommandResponseCard commandType={message.commandType as CommandType} />
              ) : (
                <StreamingText
                  text={message.content}
                  instant={message.instant ?? !message.streaming}
                  showCaret={message.streaming === true}
                />
              )
            ) : (
              message.content
            )}
          </div>

          {/* Actions - visible on hover */}
          <div className="flex items-center gap-0.5 mt-1 opacity-0 group-hover/msg:opacity-100 transition-opacity duration-150">
            {isAI ? (
              <>
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

                <button
                  className="p-1.5 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-all"
                  title="Thumbs Up"
                >
                  <ThumbsUp size={14} />
                </button>

                <button
                  className="p-1.5 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-all"
                  title="Thumbs Down"
                >
                  <ThumbsDown size={14} />
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={onEdit}
                  className="p-1.5 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-all"
                  title="Edit"
                >
                  <Edit3 size={14} />
                </button>
                <button
                  onClick={handleCopy}
                  className="p-1.5 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-all"
                  title={copied ? 'Copied!' : 'Copy'}
                >
                  {copied ? <Check size={14} className="text-primary" /> : <Copy size={14} />}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
