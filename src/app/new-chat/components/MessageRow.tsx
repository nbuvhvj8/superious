import React, { useState } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  ArrowDown01Icon,
  Copy01Icon,
  PencilEdit01Icon,
  RefreshIcon,
  ThumbsDownIcon,
  ThumbsUpIcon,
  Tick01Icon,
} from '@hugeicons/core-free-icons';
import StreamingText from './StreamingText';
import CommandResponseCard, { type CommandType } from './CommandResponseCard';
import ThinkingIndicator from './ThinkingIndicator';

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

  const parsedThinking = React.useMemo(() => {
    if (!isAI)
      return {
        responseText: message.content,
        thoughts: [] as string[],
        isThinking: false,
        toolCalls: [] as Array<{ tool: string; query: string }>,
      };

    const thinkingRegex = /<thinking>([\s\S]*?)(?:<\/thinking>|$)/gi;
    const thoughts: string[] = [];
    let match: RegExpExecArray | null;

    while ((match = thinkingRegex.exec(message.content)) !== null) {
      const value = match[1]?.trim();
      if (value) thoughts.push(value);
    }

    const openTagCount = (message.content.match(/<thinking>/gi) ?? []).length;
    const closeTagCount = (message.content.match(/<\/thinking>/gi) ?? []).length;

    const toolCalls: Array<{ tool: string; query: string }> = [];
    const toolTagRegex =
      /<tool(?:_call)?\s+[^>]*?(?:name|tool)=['"]([^'"]+)['"][^>]*?(?:query=['"]([^'"]*)['"])?[^>]*\/?>(?:([^<]*)<\/tool(?:_call)?>)?/gi;
    while ((match = toolTagRegex.exec(message.content)) !== null) {
      toolCalls.push({
        tool: match[1],
        query: (match[2] || match[3] || '').trim() || 'Running tool',
      });
    }

    const bracketToolRegex = /\[tool:([^\]]+)]\s*([^\n]*)/gi;
    while ((match = bracketToolRegex.exec(message.content)) !== null) {
      toolCalls.push({ tool: match[1].trim(), query: match[2].trim() || 'Running tool' });
    }

    let responseText = message.content.replace(/<thinking>[\s\S]*?<\/thinking>/gi, '');
    if (openTagCount > closeTagCount) {
      const lastOpenTagIndex = responseText.toLowerCase().lastIndexOf('<thinking>');
      if (lastOpenTagIndex >= 0) {
        responseText = responseText.slice(0, lastOpenTagIndex);
      }
    }
    responseText = responseText.trimStart();

    return {
      responseText,
      thoughts,
      isThinking: message.streaming === true && openTagCount > closeTagCount,
      toolCalls,
    };
  }, [isAI, message.content, message.streaming]);

  return (
    <div
      className={`group/msg w-full flex flex-col ${isAI ? 'items-start' : 'items-end'} mb-4 animate-fade-in px-4 md:px-0`}
    >
      <div
        className={`flex items-start w-full max-w-[720px] mx-auto gap-2 ${isAI ? 'justify-start' : 'justify-end'}`}
      >
        <div className={`flex-1 flex flex-col gap-1 min-w-0 ${isAI ? 'items-start' : 'items-end'}`}>
          {/* Bubble */}
          <div
            className={`
            relative w-fit text-[15px] leading-relaxed
            ${isAI ? 'text-foreground px-0 py-1' : 'bg-[#e5e7eb] text-foreground rounded-full px-4 py-2.5 max-w-[85%]'}
            ${!isAI && isLongMessage ? '!rounded-xl' : ''}
            ${!isAI && !isExpanded && isLongMessage ? 'max-h-[160px] overflow-hidden' : ''}
            transition-all duration-300
          `}
          >
            {isAI ? (
              message.commandType ? (
                <CommandResponseCard commandType={message.commandType as CommandType} />
              ) : message.streaming && !message.content.trim() ? (
                <div className="inline-flex items-center gap-2">
                  <span className="text-[12px] font-normal shimmer-text opacity-70">
                    Thinking...
                  </span>
                </div>
              ) : (
                <div className="space-y-1">
                  {(parsedThinking.thoughts.length > 0 ||
                    parsedThinking.isThinking ||
                    parsedThinking.toolCalls.length > 0) && (
                    <div className="flex justify-start w-full">
                      <ThinkingIndicator
                        thinkingSteps={parsedThinking.thoughts}
                        isThinking={parsedThinking.isThinking}
                        toolCalls={parsedThinking.toolCalls}
                      />
                    </div>
                  )}
                  <StreamingText
                    text={parsedThinking.responseText}
                    instant={message.instant ?? !message.streaming}
                    showCaret={message.streaming === true}
                  />

                  {/* AI Icons Below AI Text */}
                  {!message.streaming && (
                    <div className="flex items-center justify-start gap-1 mt-2 transition-opacity">
                      <button
                        onClick={handleCopy}
                        className="p-1.5 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-all"
                        title={copied ? 'Copied!' : 'Copy'}
                      >
                        {copied ? (
                          <HugeiconsIcon icon={Tick01Icon} size={14} className="text-primary" />
                        ) : (
                          <HugeiconsIcon icon={Copy01Icon} size={14} />
                        )}
                      </button>
                      <button
                        onClick={onRegenerate}
                        className="p-1.5 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-all"
                        title="Regenerate"
                      >
                        <HugeiconsIcon icon={RefreshIcon} size={14} />
                      </button>
                      <button
                        className="p-1.5 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-all"
                        title="Good Response"
                      >
                        <HugeiconsIcon icon={ThumbsUpIcon} size={14} />
                      </button>
                      <button
                        className="p-1.5 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-all"
                        title="Bad Response"
                      >
                        <HugeiconsIcon icon={ThumbsDownIcon} size={14} />
                      </button>
                    </div>
                  )}
                </div>
              )
            ) : (
              <div className="whitespace-pre-wrap break-words">{message.content}</div>
            )}

            {/* Expand Chevron for User Bubble */}
            {!isAI && isLongMessage && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className={`
                  absolute bottom-0 left-0 w-full h-10 flex items-center justify-center
                  bg-gradient-to-t from-[#e5e7eb] via-[#e5e7eb]/90 to-transparent pt-4
                  ${isExpanded ? 'relative bg-none h-6 mt-1' : ''}
                  hover:text-foreground/80 transition-colors z-10
                `}
              >
                <HugeiconsIcon
                  icon={ArrowDown01Icon}
                  size={14}
                  className={`transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}
                />
              </button>
            )}
          </div>

          {/* User Icons Below Bubble */}
          {!isAI && (
            <div className="flex items-center justify-end gap-1 mt-1 opacity-0 group-hover/msg:opacity-100 transition-opacity">
              <button
                onClick={onEdit}
                className="p-1 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-all"
                title="Edit"
              >
                <HugeiconsIcon icon={PencilEdit01Icon} size={13} />
              </button>
              <button
                onClick={handleCopy}
                className="p-1 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-all"
                title={copied ? 'Copied!' : 'Copy'}
              >
                {copied ? (
                  <HugeiconsIcon icon={Tick01Icon} size={13} className="text-primary" />
                ) : (
                  <HugeiconsIcon icon={Copy01Icon} size={13} />
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
