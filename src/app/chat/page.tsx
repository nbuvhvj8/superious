import React from 'react';
import AppLayout from '@/components/AppLayout';
import ChatInput from './components/ChatInput';
import GreetingMessage from './components/GreetingMessage';

export default function ChatPage() {
  return (
    <AppLayout>
      <div className="flex flex-col items-start justify-start" style={{ paddingTop: '52px', paddingLeft: '16px' }}>
        {/* Greeting - aligned left with box */}
        <div className="mb-6" style={{ width: '800px' }}>
          <GreetingMessage />
        </div>
        {/* Chat input box */}
        <div className="flex justify-center w-full">
          <ChatInput />
        </div>
      </div>
    </AppLayout>
  );
}
