'use client';
import AppLayout from '@/components/AppLayout';
export default function ArtifactPage() {
  return (
    <AppLayout>
      <div className="p-8">
        <h1 className="text-2xl font-bold">Artifacts</h1>
        <p className="text-muted-foreground">View and manage generated artifacts.</p>
      </div>
    </AppLayout>
  );
}
