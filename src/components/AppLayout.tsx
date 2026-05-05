import React from 'react';
import Sidebar from './Sidebar';
import { Bell } from 'lucide-react';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 relative">
        {/* Global Notification Icon */}
        <div className="absolute top-4 right-6 z-50">
          <button className="p-2 rounded-full bg-card border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-all shadow-sm relative">
            <Bell size={18} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-card" />
          </button>
        </div>
        <main className="flex-1 overflow-y-auto scrollbar-thin">{children}</main>
      </div>
    </div>
  );
}
