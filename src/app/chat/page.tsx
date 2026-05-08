import React from 'react';
import AppLayout from '@/components/AppLayout';
import ChatInput from './components/ChatInput';
import GreetingMessage from './components/GreetingMessage';

export default function ChatPage() {
  return (
    <AppLayout>
      <div className="flex flex-col items-start justify-start pt-14 px-4 md:px-6 lg:px-8">
        <div className="mb-6 w-full max-w-4xl">
          <GreetingMessage />
        </div>

        <div className="flex justify-center w-full">
          <ChatInput />
        </div>
      </div>
    </AppLayout>
  );
}
