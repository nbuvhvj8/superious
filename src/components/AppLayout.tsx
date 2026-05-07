'use client';

import React, { useState } from 'react';
import Sidebar from './Sidebar';
import { Bell } from 'lucide-react';
import NotificationModal from './NotificationModal';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [showNotifications, setShowNotifications] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 relative">
        {/* Global Notification Icon */}
        <div className="absolute top-6 right-8 z-50">
          <button
            onClick={() => setShowNotifications(true)}
            className="p-2 text-foreground/70 hover:text-foreground hover:scale-110 active:scale-90 transition-all relative group"
          >
            <Bell size={18} strokeWidth={2} />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border border-background animate-pulse" />
          </button>
        </div>

        <NotificationModal open={showNotifications} onClose={() => setShowNotifications(false)} />

        <main className="flex-1 overflow-y-auto scrollbar-thin">{children}</main>
      </div>
    </div>
  );
}
