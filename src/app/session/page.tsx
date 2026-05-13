'use client';

import React from 'react';
import AppLayout from '@/components/AppLayout';
import { Activity, CheckCircle2, Clock } from 'lucide-react';

const MOCK_LOGS = [
  { id: 'log-1', action: 'Web Search: "Netflix Q1 results"', status: 'success', time: '10:45:22 AM' },
  { id: 'log-2', action: 'Extracting Entities', status: 'success', time: '10:45:25 AM' },
  { id: 'log-3', action: 'Synthesizing Script', status: 'success', time: '10:45:30 AM' },
  { id: 'log-4', action: 'Generating Screenshots', status: 'success', time: '10:45:45 AM' },
];

export default function SessionPage() {
  return (
    <AppLayout>
      <div className="p-8 max-w-3xl mx-auto">
        <header className="mb-10">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Sessions</h1>
        </header>

        <div className="relative border-l-2 border-border ml-3 space-y-8">
          {MOCK_LOGS.map((log) => (
            <div key={log.id} className="relative pl-8">
              <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-background border-2 border-primary flex items-center justify-center">
                <CheckCircle2 size={10} className="text-primary fill-primary/10" />
              </div>
              <div className="flex items-center justify-between group">
                <div className="space-y-1">
                  <p className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">
                    {log.action}
                  </p>
                  <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground font-mono">
                    <Clock size={12} />
                    {log.time}
                  </div>
                </div>
                <div className="px-2 py-0.5 rounded-full bg-green-500/10 text-green-600 text-[10px] font-bold uppercase tracking-wider">
                  {log.status}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
