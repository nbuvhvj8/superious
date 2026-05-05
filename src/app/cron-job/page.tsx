import React from 'react';
import AppLayout from '@/components/AppLayout';

export const dynamic = 'force-static';

export default function CronJobPage() {
  return (
    <AppLayout>
      <div className="p-8">
        <h1 className="text-2xl font-bold">Cron Jobs</h1>
        <p className="text-muted-foreground max-w-2xl">
          Set up automated background tasks to stay up to date on news, video topics, or daily
          ideas.
        </p>
      </div>
    </AppLayout>
  );
}
