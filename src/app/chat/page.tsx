import React from 'react';
import AppLayout from '@/components/AppLayout';
import ChatInput from './components/ChatInput';
import GreetingMessage from './components/GreetingMessage';

export default function ChatPage() {
  return (
    <AppLayout>
      <div className="flex flex-col items-center justify-center min-h-full px-4 md:px-6 lg:px-8">
        <div className="w-full max-w-[800px] flex flex-col gap-4">
          <GreetingMessage />
          <ChatInput />
        </div>
      </div>
    </AppLayout>
  );
}
