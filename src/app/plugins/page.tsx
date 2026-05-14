'use client';

import AppLayout from '@/components/AppLayout';

export default function PluginsPage() {
  return (
    <AppLayout>
      <div className="mx-auto w-full max-w-[1300px] px-8 py-8">
        <h1 className="text-[28px] font-bold tracking-tight">Plugins & Extensions</h1>
        <p className="mt-2 text-sm text-muted-foreground">Manage integrations and extensions from one place.</p>
      </div>
    </AppLayout>
  );
}
