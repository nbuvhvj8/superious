

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

  const renderInline = (line: string) => {
    const nodes: React.ReactNode[] = [];
    const tokenRegex = /(\*\*[^*]+\*\*|\*[^*]+\*)/g;
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = tokenRegex.exec(line)) !== null) {
      if (match.index > lastIndex) nodes.push(line.slice(lastIndex, match.index));
      const token = match[0];
      if (token.startsWith('**') && token.endsWith('**')) {
        nodes.push(<strong key={`${match.index}-bold`}>{token.slice(2, -2)}</strong>);
      } else if (token.startsWith('*') && token.endsWith('*')) {
        nodes.push(<em key={`${match.index}-italic`}>{token.slice(1, -1)}</em>);
      }
      lastIndex = match.index + token.length;
    }
    if (lastIndex < line.length) nodes.push(line.slice(lastIndex));
    return nodes;
  };

  const renderedLines = displayed.split('\n').map((line, index) => {
    const headingMatch = line.match(/^(#{1,3})\s+(.+)$/);
    if (!headingMatch) return <p key={index}>{renderInline(line)}</p>;
    const level = headingMatch[1].length;
    const textValue = headingMatch[2];
    const headingClass = level === 1 ? 'text-[1.2em] font-semibold' : level === 2 ? 'text-[1.1em] font-semibold' : 'font-semibold';
    return (
      <p key={index} className={headingClass}>
        {renderInline(textValue)}
      </p>
    );
  });

  return (
    <span className={`whitespace-pre-wrap ${className}`}>
      {renderedLines}
      {showCaret && isTyping && (
        <span
          aria-hidden="true"
          className="inline-block w-[2px] h-[1em] align-[-0.15em] ml-[1px] bg-foreground/70 animate-pulse"
        />
      )}
    </span>
  );
}
