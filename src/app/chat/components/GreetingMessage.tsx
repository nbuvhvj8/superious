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
    // Select a random greeting on component mount
    const randomGreeting = GREETINGS[Math.floor(Math.random() * GREETINGS.length)];
    setGreeting(randomGreeting);
  }, []);

  return (
    <div className="flex flex-col gap-4">
      {/* Greeting message */}
      <p className="text-lg font-semibold text-foreground">{greeting}</p>
    </div>
  );
}
