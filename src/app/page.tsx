'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    const onboarded = localStorage.getItem('onboarding_complete');
    if (onboarded === 'true') {
      router.replace('/workspace');
    } else {
      router.replace('/onboarding');
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="animate-pulse text-muted-foreground font-medium">Loading...</div>
    </div>
  );
}
