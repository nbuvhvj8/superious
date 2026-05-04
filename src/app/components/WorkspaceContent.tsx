'use client';

import React, { useState } from 'react';
import PromptInputCard from './PromptInputCard';
import ActiveJobBanner from './ActiveJobBanner';
import JobHistoryTable from './JobHistoryTable';
import CollectionsPanel from './CollectionsPanel';

export default function WorkspaceContent() {
  const [selectedCollection, setSelectedCollection] = useState<string | null>(null);

  return (
    <div className="min-h-full px-6 lg:px-8 xl:px-10 2xl:px-14 py-8 max-w-screen-2xl mx-auto space-y-7">
      {/* Page Header */}
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-foreground tracking-tight">Research Workspace</h1>
        <p className="text-sm text-muted-foreground">
          Submit a research prompt and ScriptForge will autonomously generate a structured video script with source evidence.
        </p>
      </div>

      {/* Prompt Input */}
      <PromptInputCard />

      {/* Active Job Banner */}
      <ActiveJobBanner />

      {/* Job History + Collections */}
      <div className="flex gap-6 items-start">
        {/* Collections Sidebar */}
        <div className="w-52 shrink-0 sticky top-6">
          <CollectionsPanel
            selectedCollection={selectedCollection}
            onSelectCollection={setSelectedCollection}
          />
        </div>

        {/* Job History */}
        <section className="flex-1 min-w-0 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-foreground">Job History</h2>
            <span className="section-label">24 total jobs</span>
          </div>
          <JobHistoryTable />
        </section>
      </div>
    </div>
  );
}
