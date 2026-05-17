"use client";


import React, { useState } from 'react';
import AppLayout from '@/components/AppLayout';
import SettingsNav, { type SettingsTabKey } from './components/SettingsNav';
import ApiConfigSection from './components/ApiConfigSection';
import ResearchPreferencesSection from './components/ResearchPreferencesSection';
import ExportStorageSection from './components/ExportStorageSection';
import DangerZoneSection from './components/DangerZoneSection';
import GoogleDocsIntegrationSection from './components/GoogleDocsIntegrationSection';
import GeneralSection from './components/GeneralSection';
import AccountSection from './components/AccountSection';
import PrivacySection from './components/PrivacySection';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTabKey>('general');

  return (
    <AppLayout>
      <div className="h-[calc(100vh-64px)] overflow-y-auto scrollbar-thin bg-background">
        <div className="max-w-[1300px] mx-auto px-6 lg:px-8 w-full">
          {/* Header Section */}
          <div className="pt-24 pb-6">
            <h1 className="text-3xl font-bold text-foreground tracking-tight">Settings</h1>
          </div>

          {/* Settings Container (Borderless) */}
          <div className="flex bg-background relative z-0 mb-48 overflow-hidden min-h-[600px]">
            {/* Left Sidebar Nav */}
            <div className="w-64 shrink-0 py-2">
              <SettingsNav activeTab={activeTab} onTabChange={setActiveTab} />
            </div>

            {/* Right Content Area */}
            <div className="flex-1 p-10 pt-2">
              <div className="animate-fade-in transition-all duration-300">
                {activeTab === 'general' && <GeneralSection />}
                {activeTab === 'account' && <AccountSection />}
                {activeTab === 'api' && <ApiConfigSection />}
                {activeTab === 'integrations' && <GoogleDocsIntegrationSection />}
                {activeTab === 'research' && <ResearchPreferencesSection />}
                {activeTab === 'export' && <ExportStorageSection />}
                {activeTab === 'privacy' && <PrivacySection />}
                {activeTab === 'danger' && <DangerZoneSection />}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
