import React from 'react';
import AppLayout from '@/components/AppLayout';

export const dynamic = 'force-static';

export default function ChatPage() {
  return (
    <AppLayout>
      <div className="p-8">
        <h1 className="text-2xl font-bold">Chat</h1>
        <p className="text-muted-foreground">Chat interface coming soon...</p>
      </div>
    </AppLayout>
  );
}
