'use client';

import React from 'react';
import { ChevronDown } from 'lucide-react';

interface ThinkingIndicatorProps {
  thinkingSteps?: string[];
  isThinking?: boolean;
}

export default function ThinkingIndicator({
  thinkingSteps = [],
  isThinking = false,
}: ThinkingIndicatorProps) {
  const hasSteps = thinkingSteps.length > 0;

  return (
    <div className="mb-6 animate-fade-in">
      <details className="group max-w-[85%]" open={isThinking || hasSteps}>
        <summary className="list-none cursor-pointer select-none inline-flex items-center gap-2 text-[14px] font-semibold tracking-tight">
          <span className={isThinking ? 'shimmer-text' : ''}>Thinking</span>
          <ChevronDown
            size={14}
            className="text-muted-foreground transition-transform group-open:rotate-180"
          />
        </summary>
        {hasSteps && (
          <div className="mt-2 pl-1 text-[12px] text-muted-foreground/80 space-y-1.5 whitespace-pre-wrap">
            {thinkingSteps.map((step, index) => (
              <p key={`${index}-${step.slice(0, 24)}`}>{step}</p>
            ))}
          </div>
        )}
      </details>
    </div>
  );
}
