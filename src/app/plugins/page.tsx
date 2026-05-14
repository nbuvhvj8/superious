'use client';

import AppLayout from '@/components/AppLayout';
import { ChevronLeft, ChevronRight, Puzzle, Star } from 'lucide-react';
import { useMemo, useState } from 'react';

const BANNERS = [
  {
    title: 'Build your AI tool stack',
    subtitle: 'Connect MCP servers, agent skills, and 3rd-party apps in one plugin marketplace.',
  },
  {
    title: 'Curated automation bundles',
    subtitle: 'Install ready-to-run packs for support, research, marketing, engineering, and ops.',
  },
  {
    title: 'Enterprise-ready connectors',
    subtitle: 'Gmail, Slack, WhatsApp, Telegram and many more with policy-aware controls.',
  },
  {
    title: 'Top rated this week',
    subtitle: 'Discover the highest-rated tools from teams shipping with autonomous agents.',
  },
];

const CATEGORIES = ['MCP', 'Agent Skills', 'Claude Code Plugins', 'Communication', 'Productivity'];
const BASE = [
  'Gmail',
  'WhatsApp',
  'Telegram',
  'Slack',
  'Notion',
  'Linear',
  'GitHub',
  'Jira',
  'Confluence',
  'Google Drive',
];

const PLUGINS = Array.from({ length: 100 }).map((_, i) => ({
  name: `${BASE[i % BASE.length]} ${Math.floor(i / BASE.length) + 1}`,
  category: CATEGORIES[i % CATEGORIES.length],
  rating: (4 + (i % 10) * 0.1).toFixed(1),
  installs: `${(i + 3) * 120}`,
}));

export default function PluginsPage() {
  const [banner, setBanner] = useState(0);
  const active = useMemo(() => BANNERS[banner], [banner]);

  return (
    <AppLayout>
      <div className="mx-auto w-full max-w-[1300px] px-8 py-8">
        <h1 className="text-[28px] font-bold tracking-tight">Plugins & Extensions</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Curated plugin library across MCP, agent skills, Claude code plugins, and 3rd-party
          connectors.
        </p>

        <section className="relative mt-5 h-[300px] w-full overflow-hidden rounded-[12px] border border-[#ebedf2] bg-gradient-to-br from-[#111827] to-[#374151] p-7 text-white">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.1em]">
            <Puzzle size={13} /> Plugin Spotlight
          </div>
          <h2 className="mt-4 max-w-[620px] text-3xl font-bold">{active.title}</h2>
          <p className="mt-3 max-w-[620px] text-sm text-white/85">{active.subtitle}</p>
          <div className="absolute bottom-4 right-4 flex items-center gap-2">
            <button
              onClick={() => setBanner((p) => (p - 1 + BANNERS.length) % BANNERS.length)}
              className="rounded-full bg-white/20 p-2 hover:bg-white/30"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={() => setBanner((p) => (p + 1) % BANNERS.length)}
              className="rounded-full bg-white/20 p-2 hover:bg-white/30"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </section>

        <section className="mt-6 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {PLUGINS.map((plugin) => (
            <article
              key={plugin.name}
              className="rounded-[10px] border border-[#ebedf2] bg-white p-4"
            >
              <div className="flex items-start justify-between gap-2">
                <h3 className="text-sm font-bold text-foreground">{plugin.name}</h3>
                <span className="rounded-full bg-[#f2f3f6] px-2 py-0.5 text-[10px] font-bold text-muted-foreground">
                  {plugin.category}
                </span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                Secure connector with scoped permissions and composable agent actions.
              </p>
              <div className="mt-3 flex items-center justify-between">
                <span className="inline-flex items-center gap-1 text-[12px] font-bold text-amber-600">
                  <Star size={13} className="fill-amber-400" />
                  {plugin.rating}
                </span>
                <span className="text-[11px] font-semibold text-muted-foreground">
                  {plugin.installs} installs
                </span>
              </div>
            </article>
          ))}
        </section>
      </div>
    </AppLayout>
  );
}
