import React from 'react';
import AppLayout from '@/components/AppLayout';
import JobDetailHeader from './components/JobDetailHeader';
import DualPaneView from './components/DualPaneView';

export const dynamic = 'force-static';

export default function JobDetailPage() {
  return (
    <AppLayout>
      <div className="flex flex-col h-full min-h-screen max-w-7xl mx-auto w-full px-6">
        <JobDetailHeader />
        <DualPaneView />
      </div>
    </AppLayout>
  );
}
