'use client';

import React, { useState, useEffect } from 'react';

const GREETINGS = [
  "Hey there! What's on your mind?",
  "Welcome back! Let's create something great.",
  "Ready to brainstorm? I'm listening.",
  'What can I help you research today?',
  "Let's dive into it. What do you need?",
  'Curious about something? Ask away!',
  'Your next big idea starts here.',
  'What would you like to explore?',
  "Let's turn your thoughts into action.",
  'Ready to get started? Tell me more.',
  "What's your next topic?",
  "I'm here to help. What's next?",
];

export default function GreetingMessage() {
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    const randomGreeting = GREETINGS[Math.floor(Math.random() * GREETINGS.length)];
    setGreeting(randomGreeting);
  }, []);

  if (!greeting) return <div className="h-[88px]" />; // Prevent layout shift by reserving space

  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        New chat
      </p>
      <h1 className="text-xl md:text-2xl font-semibold text-foreground">{greeting}</h1>
      <p className="text-sm text-muted-foreground">
        Ask a question, draft content, or explore an idea.
      </p>
    </div>
  );
}
