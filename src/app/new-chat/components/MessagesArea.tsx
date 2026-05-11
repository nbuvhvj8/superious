'use client';

import React, { useRef, useEffect } from 'react';
import GreetingMessage from './GreetingMessage';
import MessageRow, { Message } from './MessageRow';
import ThinkingIndicator from './ThinkingIndicator';

interface MessagesAreaProps {
  messages: Message[];
  isGenerating?: boolean;
  inputComponent?: React.ReactNode;
}

export default function MessagesArea({
  messages,
  isGenerating,
  inputComponent,
}: MessagesAreaProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const isEmpty = messages.length === 0;

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isGenerating]);

  return (
    <div
      ref={scrollRef}
      className="flex-1 overflow-y-auto scrollbar-thin px-4 py-4"
      role="log"
      aria-live="polite"
    >
      <div className="max-w-[760px] mx-auto w-full h-full flex flex-col">
        {isEmpty ? (
          <div className="flex-1 flex flex-col items-center justify-center animate-fade-in">
            <GreetingMessage />
            <div className="w-full mt-2">
              {inputComponent}
            </div>
          </div>
        ) : (
          <div className="flex flex-col">
            {messages.map((msg) => (
              <MessageRow key={msg.id} message={msg} />
            ))}

            {isGenerating && <ThinkingIndicator />}
          </div>
        )}
      </div>
    </div>
  );
}
