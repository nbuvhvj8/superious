'use client';

import Link from 'next/link';
import AppLayout from '@/components/AppLayout';

export default function ResearchHubPage() {
  return (
    <AppLayout>
      <div className="mx-auto w-full max-w-[1300px] px-8 py-8">
        <h1 className="text-[28px] font-bold tracking-tight">Research & Job Details</h1>
        <p className="mt-2 text-sm text-muted-foreground">A unified entry point for workspace research and job-level details.</p>
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <Link href="/workspace" className="rounded-[10px] border border-[#ebedf2] bg-white p-5 hover:bg-[#f9f9f9]">
            <h2 className="text-base font-semibold">Research Workspace</h2>
            <p className="mt-1 text-xs text-muted-foreground">Run web research and collect findings.</p>
          </Link>
          <Link href="/job-detail" className="rounded-[10px] border border-[#ebedf2] bg-white p-5 hover:bg-[#f9f9f9]">
            <h2 className="text-base font-semibold">Job Details</h2>
            <p className="mt-1 text-xs text-muted-foreground">Inspect scripts, assets, and verification details for jobs.</p>
          </Link>
        </div>
      </div>
    </AppLayout>
  );
}
