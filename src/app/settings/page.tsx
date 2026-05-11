'use client';

import React, { useState } from 'react';
import AppLayout from '@/components/AppLayout';
import SettingsNav, { type SettingsTabKey } from './components/SettingsNav';
import ApiConfigSection from './components/ApiConfigSection';
import ResearchPreferencesSection from './components/ResearchPreferencesSection';
import ExportStorageSection from './components/ExportStorageSection';
import DangerZoneSection from './components/DangerZoneSection';
import GoogleDocsIntegrationSection from './components/GoogleDocsIntegrationSection';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTabKey>('api');

  return (
    <AppLayout>
      <div className="h-[calc(100vh-64px)] flex flex-col overflow-hidden">
        {/* Sticky Header */}
        <div className="shrink-0 bg-background/80 backdrop-blur-md border-b border-border px-6 lg:px-8 xl:px-10 2xl:px-14 py-6">
          <div className="max-w-screen-2xl mx-auto space-y-1">
            <h1 className="text-2xl font-bold text-foreground tracking-tight">Settings</h1>
            <p className="text-sm text-muted-foreground font-medium">
              Configure API keys, research parameters, export preferences, and storage policies.
            </p>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 px-6 lg:px-8 xl:px-10 2xl:px-14 max-w-screen-2xl mx-auto w-full overflow-hidden">
          <div className="flex gap-10 items-start h-full py-8">
            {/* Settings Nav */}
            <div className="w-56 shrink-0 h-full overflow-y-auto scrollbar-thin pr-2">
              <SettingsNav activeTab={activeTab} onTabChange={setActiveTab} />
            </div>

            {/* Settings Content - Only show active tab */}
            <div className="flex-1 h-full overflow-y-auto scrollbar-thin pb-20 pr-2">
              <div className="animate-fade-in transition-all duration-300 h-full">
                {activeTab === 'api' && <ApiConfigSection />}
                {activeTab === 'integrations' && <GoogleDocsIntegrationSection />}
                {activeTab === 'research' && <ResearchPreferencesSection />}
                {activeTab === 'export' && <ExportStorageSection />}
                {activeTab === 'danger' && <DangerZoneSection />}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
