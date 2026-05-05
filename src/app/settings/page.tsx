import React from 'react';
import AppLayout from '@/components/AppLayout';
import SettingsNav from './components/SettingsNav';
import ApiConfigSection from './components/ApiConfigSection';
import ResearchPreferencesSection from './components/ResearchPreferencesSection';
import ExportStorageSection from './components/ExportStorageSection';
import DangerZoneSection from './components/DangerZoneSection';
import GoogleDocsIntegrationSection from './components/GoogleDocsIntegrationSection';

export default function SettingsPage() {
  return (
    <AppLayout>
      <div className="min-h-full px-6 lg:px-8 xl:px-10 2xl:px-14 py-8 max-w-screen-2xl mx-auto">
        <div className="space-y-1 mb-7">
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Settings</h1>
          <p className="text-sm text-muted-foreground">
            Configure API keys, research parameters, export preferences, and storage policies.
          </p>
        </div>

        <div className="flex gap-8 items-start">
          {/* Settings Nav */}
          <div className="w-52 shrink-0 sticky top-8">
            <SettingsNav />
          </div>

          {/* Settings Content */}
          <div className="flex-1 min-w-0 space-y-7">
            <ApiConfigSection />
            <GoogleDocsIntegrationSection />
            <ResearchPreferencesSection />
            <ExportStorageSection />
            <DangerZoneSection />
          </div>
        </div>
      </div>
    </AppLayout>
  );
}