'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AppLayout from '@/components/AppLayout';
import WorkspaceContent from './components/WorkspaceContent';

export default function ResearchWorkspacePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const isComplete = localStorage.getItem('onboarding_complete');
    if (!isComplete) {
      router.push('/onboarding');
    } else {
      setLoading(false);
    }
  }, [router]);

  if (loading) return null;

  return (
    <AppLayout>
      <WorkspaceContent />
    </AppLayout>
  );
}
