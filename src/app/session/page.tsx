'use client';

import React from 'react';
import AppLayout from '@/components/AppLayout';
import { Bot, CheckCircle2, Clock3, Filter, Search } from 'lucide-react';

const MOCK_LOGS = [
  {
    id: 'log-1',
    action: 'Web Search: "Netflix Q1 results"',
    status: 'Complete',
    time: '10:45:22 AM',
    detail: 'Collected 14 sources and ranked by relevance score.',
  },
  {
    id: 'log-2',
    action: 'Entity extraction',
    status: 'Complete',
    time: '10:45:25 AM',
    detail: 'Tagged companies, dates, and metrics for timeline synthesis.',
  },
  {
    id: 'log-3',
    action: 'Script synthesis',
    status: 'Complete',
    time: '10:45:30 AM',
    detail: 'Generated first outline and confidence scored each claim.',
  },
];

export default function SessionPage() {
  return (
    <AppLayout>
      <div className="mx-auto w-full max-w-[1300px] px-8 py-8">
        <div className="grid min-h-[600px] grid-cols-1 overflow-hidden rounded-[12px] border border-[#ebedf2] bg-white lg:grid-cols-[16rem_1fr]">
          <aside className="border-b border-[#ebedf2] bg-[#fafafa] p-3 lg:border-b-0 lg:border-r">
            <div className="mb-2 px-2 text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">
              Session tools
            </div>
            <div className="space-y-1">
              {['Activity feed', 'Sources', 'Timeline'].map((tab, idx) => (
                <button
                  key={tab}
                  className={`flex w-full items-center gap-2 rounded-[6px] px-3 py-2 text-sm font-medium transition-all duration-150 active:scale-[0.98] ${idx === 0 ? 'bg-[#f2f3f6] text-foreground' : 'text-muted-foreground hover:bg-[#f9f9f9]/60 hover:text-foreground'}`}
                >
                  <Bot size={14} />
                  {tab}
                </button>
              ))}
            </div>
          </aside>

          <section className="flex-1 p-10 pt-6">
            <header className="mb-8 flex items-end justify-between gap-4">
              <div>
                <h1 className="text-[28px] font-bold tracking-tight text-foreground">
                  Session inspector
                </h1>
                <p className="mt-1 text-xs text-muted-foreground">
                  Inspect what the assistant did and how decisions were made.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button className="inline-flex h-9 items-center gap-2 rounded-[8px] bg-[#f2f3f6] px-3 text-[12px] font-semibold text-foreground transition-colors hover:bg-[#e8eaf0]">
                  <Filter size={14} />
                  Filters
                </button>
                <button className="inline-flex h-9 items-center gap-2 rounded-[8px] bg-[#f2f3f6] px-3 text-[12px] font-semibold text-foreground transition-colors hover:bg-[#e8eaf0]">
                  <Search size={14} />
                  Search
                </button>
              </div>
            </header>

            <div className="space-y-4 border-l border-[#dfe3ea] pl-6">
              {MOCK_LOGS.map((log) => (
                <div key={log.id} className="relative rounded-[8px] bg-[#f9f9f9] px-4 py-3">
                  <div className="absolute -left-[30px] top-4 flex h-4 w-4 items-center justify-center rounded-full border border-[#dfe3ea] bg-white">
                    <CheckCircle2 size={12} className="text-emerald-500" />
                  </div>
                  <div className="mb-1 flex items-center justify-between gap-3">
                    <h3 className="text-sm font-semibold text-foreground">{log.action}</h3>
                    <span className="rounded-[6px] bg-[#eef7ef] px-2 py-1 text-[11px] font-semibold text-emerald-700">
                      {log.status}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">{log.detail}</p>
                  <div className="mt-2 inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground">
                    <Clock3 size={12} />
                    {log.time}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </AppLayout>
  );
}
