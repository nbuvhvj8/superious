'use client';
import AppLayout from '@/components/AppLayout';
export default function SessionPage() {
  return (
    <AppLayout>
      <div className="p-8">
        <h1 className="text-2xl font-bold">Sessions</h1>
        <p className="text-muted-foreground font-medium">Inspect how the AI works and its process.</p>
      </div>
    </AppLayout>
  );
}
