'use client';

import React from 'react';
import AppLayout from '@/components/AppLayout';
import { FileText, Clock, ChevronRight } from 'lucide-react';

const MOCK_ARTIFACTS = [
  { id: 'art-1', title: 'Netflix Streaming Trends 2024', type: 'Script Draft', date: '2024-03-20' },
  { id: 'art-2', title: 'AI Chip Architecture Analysis', type: 'Research PDF', date: '2024-03-19' },
  { id: 'art-3', title: 'SpaceX Starship Progress Report', type: 'Data Table', date: '2024-03-18' },
];

export default function ArtifactPage() {
  return (
    <AppLayout>
      <div className="p-8 max-w-5xl mx-auto">
        <header className="mb-10">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Artifacts</h1>
        </header>

        <div className="grid gap-4">
          {MOCK_ARTIFACTS.map((artifact) => (
            <div
              key={artifact.id}
              className="group flex items-center justify-between p-4 bg-card border border-border rounded-xl hover:border-primary/50 transition-all cursor-pointer"
            >
              <div className="flex items-center gap-4">
                <div className="p-2 bg-muted rounded-lg text-muted-foreground group-hover:text-primary transition-colors">
                  <FileText size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-foreground">{artifact.title}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-muted-foreground">{artifact.type}</span>
                    <span className="text-[10px] text-border">•</span>
                    <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                      <Clock size={12} />
                      {artifact.date}
                    </div>
                  </div>
                </div>
              </div>
              <ChevronRight size={18} className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-all" />
            </div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
