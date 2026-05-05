import React from 'react';
import AppLayout from '@/components/AppLayout';

export default function StoragesPage() {
  return (
    <AppLayout>
      <div className="p-8">
        <h1 className="text-2xl font-bold">Storages</h1>
        <p className="text-muted-foreground">Manage your storage locations and exports.</p>
      </div>
    </AppLayout>
  );
}
