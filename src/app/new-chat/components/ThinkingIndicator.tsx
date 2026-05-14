'use client';

import React from 'react';
import { ChevronRight, Wrench } from 'lucide-react';

interface ThinkingIndicatorProps {
  thinkingSteps?: string[];
  isThinking?: boolean;
  toolCalls?: Array<{ tool: string; query: string }>;
}

export default function ThinkingIndicator({
  thinkingSteps = [],
  isThinking = false,
  toolCalls = [],
}: ThinkingIndicatorProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const hasSteps = thinkingSteps.length > 0;
  const hasToolCalls = toolCalls.length > 0;

  return (
    <div className="mb-2 animate-fade-in inline-block rounded-[8px] bg-[#f2f3f6] px-2.5 py-2">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="inline-flex items-center gap-1 text-[12px] font-normal tracking-tight text-muted-foreground"
      >
        <ChevronRight
          size={14}
          className={`text-muted-foreground transition-transform ${isOpen ? 'rotate-90' : ''}`}
        />
        <span className={isThinking ? 'shimmer-text opacity-70' : ''}>Thinking</span>
      </button>
      {isOpen && (hasSteps || hasToolCalls) && (
        <div className="mt-1.5 pl-1 text-[12px] text-muted-foreground/80 space-y-1.5 whitespace-pre-wrap">
          {hasToolCalls && (
            <div className="space-y-1">
              {toolCalls.map((call, index) => (
                <div key={`${call.tool}-${index}`} className="flex items-start gap-1.5">
                  <Wrench size={12} className="mt-0.5 shrink-0" />
                  <p>
                    <span className="font-medium">{call.tool}:</span> {call.query}
                  </p>
                </div>
              ))}
            </div>
          )}
          {hasSteps &&
            thinkingSteps.map((step, index) => <p key={`${index}-${step.slice(0, 24)}`}>{step}</p>)}
        </div>
      )}
    </div>
  );
}
