'use client';

import React, { useState } from 'react';
import AppLayout from '@/components/AppLayout';
import ChatTopBar from './components/ChatTopBar';
import MessagesArea from './components/MessagesArea';
import ChatInput from './components/ChatInput';
import { Message } from './components/MessageRow';

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleSend = () => {
    if (!inputValue.trim() || isGenerating) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue.trim(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsGenerating(true);

    // Simulate AI response
    setTimeout(() => {
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "I've started researching that for you. I'll search the web for the most relevant sources and synthesize them into a structured script.",
      };
      setMessages((prev) => [...prev, aiMessage]);
      setIsGenerating(false);
    }, 2000);
  };

  const handleSelectSuggestion = (topic: string) => {
    setInputValue(topic);
  };

  const handleNewChat = () => {
    setMessages([]);
    setInputValue('');
    setIsGenerating(false);
  };

  return (
    <AppLayout>
      <div className="flex flex-col h-[100dvh] bg-background">
        {/* Top Bar */}
        <ChatTopBar onNewChat={handleNewChat} />

        {/* Messages Area */}
        <MessagesArea 
          messages={messages} 
          onSelectSuggestion={handleSelectSuggestion}
          isGenerating={isGenerating}
        />

        {/* Input Zone */}
        <div className="flex-shrink-0 w-full px-4 pb-4 md:px-6 md:pb-6">
          <div className="max-w-[760px] mx-auto w-full">
            <ChatInput 
              value={inputValue} 
              onChange={setInputValue} 
              onSend={handleSend}
              isGenerating={isGenerating}
            />
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
