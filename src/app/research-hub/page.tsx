'use client';

import AppLayout from '@/components/AppLayout';
import { BriefcaseBusiness, FileText, SearchCheck, Sparkles } from 'lucide-react';

const WORKSTREAMS = [
  {
    title: 'Research Pipeline',
    description: 'Query planning, source discovery, ranking, and evidence capture in one flow.',
    points: ['Unified search queue', 'Citations + screenshot tracking', 'Signal confidence scoring'],
    icon: <SearchCheck size={16} className="text-foreground" />,
  },
  {
    title: 'Job Execution',
    description: 'Script generation, revisions, and run-level audit details in the same workspace.',
    points: ['Timeline by run', 'Draft and hook variants', 'Delivery status + logs'],
    icon: <FileText size={16} className="text-foreground" />,
  },
  {
    title: 'Operator Controls',
    description: 'Settings-aware controls for provider keys, model routing, and safety rules.',
    points: ['Profile-linked configs', 'Policy guardrails', 'One-click mode switching'],
    icon: <Sparkles size={16} className="text-foreground" />,
  },
];

export default function ResearchHubPage() {
  return (
    <AppLayout>
      <div className="mx-auto w-full max-w-[1300px] px-8 py-8">
        <div className="min-h-[600px] overflow-hidden rounded-[12px] border border-[#ebedf2] bg-white p-10 pt-6">
          <header className="mb-8">
            <div className="inline-flex items-center gap-2 rounded-[8px] bg-[#f2f3f6] px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
              <BriefcaseBusiness size={14} />
              Operations Hub
            </div>
            <h1 className="mt-4 text-[28px] font-bold tracking-tight text-foreground">One-page research + job control center</h1>
            <p className="mt-2 max-w-[760px] text-sm text-muted-foreground">
              Consolidated workspace designed from the settings/chat pattern language: soft surfaces, compact controls, and unified execution context.
            </p>
          </header>

          <section className="grid gap-4 md:grid-cols-3">
            {WORKSTREAMS.map((item) => (
              <article key={item.title} className="rounded-[10px] border border-[#ebedf2] bg-[#fafafa] p-5">
                <div className="mb-3 inline-flex h-8 w-8 items-center justify-center rounded-[8px] bg-white border border-[#ebedf2]">{item.icon}</div>
                <h2 className="text-base font-semibold text-foreground">{item.title}</h2>
                <p className="mt-1 text-xs text-muted-foreground">{item.description}</p>
                <ul className="mt-4 space-y-1.5">
                  {item.points.map((point) => (
                    <li key={point} className="text-xs text-foreground">• {point}</li>
                  ))}
                </ul>
              </article>
            ))}
          </section>
        </div>
      </div>
    </AppLayout>
  );
}
