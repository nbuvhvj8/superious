import React from 'react';
import AppLayout from '@/components/AppLayout';
import JobDetailHeader from './components/JobDetailHeader';
import DualPaneView from './components/DualPaneView';

export default function JobDetailPage() {
  return (
    <AppLayout>
      <div className="flex flex-col h-full min-h-screen">
        <JobDetailHeader />
        <DualPaneView />
      </div>
    </AppLayout>
  );
}
