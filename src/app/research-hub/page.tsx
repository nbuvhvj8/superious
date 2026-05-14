'use client';

import AppLayout from '@/components/AppLayout';
import { ArrowUpDown, Clock3, Search, Sparkles } from 'lucide-react';

const SESSIONS = [
  {
    id: 'chat-2026-031',
    title: 'AI chips weekly watch',
    updated: '5 minutes ago',
    tags: ['Market', 'Fast moving'],
  },
  {
    id: 'chat-2026-018',
    title: 'Healthcare policy monitoring',
    updated: '32 minutes ago',
    tags: ['Policy', 'Long-term'],
  },
  {
    id: 'chat-2026-011',
    title: 'Competitor launch claims audit',
    updated: '2 hours ago',
    tags: ['Verification', 'Sources'],
  },
  {
    id: 'chat-2025-122',
    title: 'Creator economy trendline',
    updated: 'Yesterday',
    tags: ['Signals', 'Content'],
  },
];

export default function ResearchHubPage() {
  return (
    <AppLayout>
      <div className="mx-auto w-full max-w-[1300px] px-8 py-8">
        <div className="min-h-[600px] overflow-hidden rounded-[12px] border border-[#ebedf2] bg-white p-10 pt-6">
          <header className="mb-8">
            <h1 className="text-[28px] font-bold tracking-tight text-foreground">
              Unified session search
            </h1>
            <p className="mt-2 max-w-[760px] text-sm text-muted-foreground">
              Search, sort, and continue any chat session from one index view.
            </p>
          </header>

          <section className="mb-6 flex flex-wrap items-center gap-3">
            <div className="flex h-10 min-w-[320px] flex-1 items-center gap-2 rounded-[8px] bg-[#f2f3f6] px-3">
              <Search size={15} className="text-muted-foreground" />
              <input
                placeholder="Search sessions, topics, tags, or source URLs..."
                className="h-full w-full bg-transparent text-sm outline-none"
              />
            </div>
            <button className="inline-flex h-10 items-center gap-2 rounded-[8px] bg-[#f2f3f6] px-3 text-[13px] font-semibold">
              <ArrowUpDown size={14} /> Sort by recent activity
            </button>
          </section>

          <section className="space-y-3">
            {SESSIONS.map((session) => (
              <article
                key={session.id}
                className="group rounded-[10px] border border-[#ebedf2] bg-[#fafafa] p-4 transition-colors hover:bg-white"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-sm font-bold text-foreground">{session.title}</h2>
                    <p className="mt-1 font-mono text-[11px] text-muted-foreground">{session.id}</p>
                  </div>
                  <div className="inline-flex items-center gap-1 rounded-full bg-white px-2 py-1 text-[11px] font-semibold text-muted-foreground">
                    <Clock3 size={12} />
                    {session.updated}
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {session.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-white px-2 py-1 text-[11px] font-semibold"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <button className="mt-3 inline-flex items-center gap-2 text-[12px] font-bold text-muted-foreground group-hover:text-foreground">
                  <Sparkles size={13} /> Resume session
                </button>
              </article>
            ))}
          </section>
        </div>
      </div>
    </AppLayout>
  );
}
