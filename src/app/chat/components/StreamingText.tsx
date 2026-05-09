'use client';

import React from 'react';
import { useTypewriter } from '@/lib/useTypewriter';

interface StreamingTextProps {
  text: string;
  /**
   * When true the typewriter is disabled and `text` is rendered immediately.
   * Use for the user's own messages and for AI messages restored from history.
   */
  instant?: boolean;
  /** Characters per second. Defaults to 65 — close to Claude's render cadence. */
  cps?: number;
  /** Show a blinking caret at the trailing edge while typing. */
  showCaret?: boolean;
  className?: string;
}

/**
 * Renders text with a Claude-style character-by-character typewriter effect.
 *
 * The component is robust to streaming sources — if `text` keeps growing
 * while typing is in flight, the rendered prefix simply continues forward
 * without restarting.
 */
export default function StreamingText({
  text,
  instant = false,
  cps = 65,
  showCaret = true,
  className = '',
}: StreamingTextProps) {
  const { displayed, isTyping } = useTypewriter(text, { cps, instant });
  return (
    <span className={`whitespace-pre-wrap ${className}`}>
      {displayed}
      {showCaret && isTyping && (
        <span
          aria-hidden="true"
          className="inline-block w-[2px] h-[1em] align-[-0.15em] ml-[1px] bg-foreground/70 animate-pulse"
        />
      )}
    </span>
  );
}
