'use client';

import { useEffect, useRef, useState } from 'react';

interface TypewriterOptions {
  /** Characters per second. Defaults to 60 — close to Claude's render cadence. */
  cps?: number;
  /** Skip the animation entirely and render the full text immediately. */
  instant?: boolean;
}

/**
 * Animates a string in character by character — Claude-style.
 *
 * Robust to the source `text` growing while the animation is in flight (which
 * is the common case when the underlying transport is a streaming SSE
 * response): the typed prefix is kept in `displayed` and we keep ticking from
 * wherever we left off, never restarting from zero.
 */
export function useTypewriter(text: string, { cps = 60, instant = false }: TypewriterOptions = {}) {
  const [displayed, setDisplayed] = useState('');
  const indexRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    // If the source shrinks (e.g. message swap / new turn) reset position.
    if (indexRef.current > text.length) {
      indexRef.current = 0;
      setDisplayed('');
    }

    if (instant) {
      indexRef.current = text.length;
      setDisplayed(text);
      return;
    }

    // Already caught up.
    if (indexRef.current >= text.length) {
      if (displayed !== text) setDisplayed(text);
      return;
    }

    const intervalMs = Math.max(8, Math.round(1000 / cps));
    timerRef.current = setInterval(() => {
      const next = indexRef.current + 1;
      if (next >= text.length) {
        indexRef.current = text.length;
        setDisplayed(text);
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
        return;
      }
      indexRef.current = next;
      setDisplayed(text.slice(0, next));
    }, intervalMs);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
    // We intentionally exclude `displayed` from deps — it's purely an output.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, cps, instant]);

  const isTyping = indexRef.current < text.length;
  return { displayed, isTyping };
}
