'use client';

import AppLayout from '@/components/AppLayout';
import { HugeiconsIcon } from '@hugeicons/react';
import { ArrowLeft01Icon, ArrowRight01Icon, CircleSlashTwoIcon, Download01Icon, PuzzleIcon, StarIcon } from '@hugeicons/core-free-icons';
import { useMemo, useState } from 'react';

const BANNERS = [
  {
    title: 'Install every plugin in one click',
    subtitle:
      'This demo marketplace shows how each plugin can be installed and exposed as a /command in the chat page.',
  },
  {
    title: 'Slash-command ready tools',
    subtitle:
      'After installation, tools appear as /commands so your team can run actions directly while chatting.',
  },
  {
    title: 'Organized catalog for fast discovery',
    subtitle:
      'Browse by category and sort by rating, installs, or name to keep your plugin hub clean and focused.',
  },
  {
    title: 'Secure connectors and agent skills',
    subtitle:
      'MCP servers, Claude Code plugins, and communication apps wrapped in a simple install-ready demo experience.',
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

const PLUGINS = Array.from({ length: 60 }).map((_, i) => ({
  name: `${BASE[i % BASE.length]} ${Math.floor(i / BASE.length) + 1}`,
  category: CATEGORIES[i % CATEGORIES.length],
  rating: Number((4 + (i % 10) * 0.1).toFixed(1)),
  installs: (i + 3) * 120,
  command: `/${BASE[i % BASE.length].toLowerCase().replace(/\s+/g, '-')}-${Math.floor(i / BASE.length) + 1}`,
}));

type SortKey = 'rating' | 'installs' | 'name';

export default function PluginsPage() {
  const [banner, setBanner] = useState(0);
  const [sortBy, setSortBy] = useState<SortKey>('rating');
  const active = useMemo(() => BANNERS[banner], [banner]);

  const organizedPlugins = useMemo(() => {
    const sorted = [...PLUGINS].sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      return b[sortBy] - a[sortBy];
    });

    return CATEGORIES.map((category) => ({
      category,
      plugins: sorted.filter((plugin) => plugin.category === category),
    }));
  }, [sortBy]);

  return (
    <AppLayout>
      <div className="mx-auto w-full max-w-[1300px] px-8 py-8">
        <style jsx>{`
          @keyframes wobbleFloat {
            0% {
              transform: translate(0, 0) scale(1);
            }
            33% {
              transform: translate(18px, -10px) scale(1.05);
            }
            66% {
              transform: translate(-12px, 15px) scale(0.98);
            }
            100% {
              transform: translate(0, 0) scale(1);
            }
          }
        `}</style>

        <h1 className="text-[28px] font-bold tracking-tight">Plugins & Extensions</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Demo plugin library where each item can be installed and then used as a /command in the
          chat page.
        </p>

        <section className="relative mt-5 h-[300px] w-full overflow-hidden rounded-[12px] border border-white/30 bg-[#0f172a] p-7 text-white">
          <div className="pointer-events-none absolute inset-0 opacity-80">
            <div
              className="absolute -left-10 -top-8 h-48 w-48 rounded-full blur-2xl"
              style={{ background: '#22c55e80', animation: 'wobbleFloat 8s ease-in-out infinite' }}
            />
            <div
              className="absolute left-1/3 top-6 h-52 w-52 rounded-full blur-2xl"
              style={{ background: '#eab30880', animation: 'wobbleFloat 9s ease-in-out infinite' }}
            />
            <div
              className="absolute right-10 top-2 h-44 w-44 rounded-full blur-2xl"
              style={{ background: '#ef444480', animation: 'wobbleFloat 7s ease-in-out infinite' }}
            />
            <div
              className="absolute bottom-0 right-1/4 h-48 w-48 rounded-full blur-2xl"
              style={{ background: '#3b82f680', animation: 'wobbleFloat 10s ease-in-out infinite' }}
            />
            <div className="absolute inset-0 bg-white/10 backdrop-blur-md" />
          </div>

          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.1em]">
              <HugeiconsIcon icon={PuzzleIcon} size={13} /> Plugin Spotlight
            </div>
            <h2 className="mt-4 max-w-[640px] text-3xl font-bold">{active.title}</h2>
            <p className="mt-3 max-w-[640px] text-sm text-white/90">{active.subtitle}</p>
          </div>

          <div className="absolute bottom-4 right-4 z-10 flex items-center gap-2">
            <button
              onClick={() => setBanner((p) => (p - 1 + BANNERS.length) % BANNERS.length)}
              className="rounded-full bg-white/20 p-2 hover:bg-white/30"
            >
              <HugeiconsIcon icon={ArrowLeft01Icon} size={16} />
            </button>
            <button
              onClick={() => setBanner((p) => (p + 1) % BANNERS.length)}
              className="rounded-full bg-white/20 p-2 hover:bg-white/30"
            >
              <HugeiconsIcon icon={ArrowRight01Icon} size={16} />
            </button>
          </div>
        </section>

        <section className="mt-6 flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-muted-foreground">Sort plugins by:</span>
          {(['rating', 'installs', 'name'] as SortKey[]).map((key) => (
            <button
              key={key}
              onClick={() => setSortBy(key)}
              className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                sortBy === key
                  ? 'bg-foreground text-background'
                  : 'bg-[#f2f3f6] text-muted-foreground hover:bg-[#e6e8ef]'
              }`}
            >
              {key[0].toUpperCase() + key.slice(1)}
            </button>
          ))}
        </section>

        <section className="mt-5 space-y-5">
          {organizedPlugins.map(({ category, plugins }) => (
            <div key={category} className="rounded-xl border border-[#ebedf2] bg-[#fafbff] p-4">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-bold text-foreground">{category}</h3>
                <span className="text-xs font-semibold text-muted-foreground">
                  {plugins.length} plugins
                </span>
              </div>

              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                {plugins.map((plugin) => (
                  <article
                    key={plugin.name}
                    className="rounded-[10px] border border-[#ebedf2] bg-white p-4 shadow-[0_1px_0_rgba(15,23,42,0.03)]"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-sm font-bold text-foreground">{plugin.name}</h4>
                      <span className="rounded-full bg-[#f2f3f6] px-2 py-0.5 text-[10px] font-bold text-muted-foreground">
                        {plugin.category}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Install this plugin, then trigger it from chat using{' '}
                      <span className="font-semibold text-foreground">{plugin.command}</span>.
                    </p>
                    <div className="mt-3 flex items-center justify-between gap-2">
                      <span className="inline-flex items-center gap-1 text-[12px] font-bold text-amber-600">
                        <HugeiconsIcon icon={StarIcon} size={13} className="fill-amber-400" />
                        {plugin.rating.toFixed(1)}
                      </span>
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-muted-foreground">
                        <HugeiconsIcon icon={Download01Icon} size={12} />
                        {plugin.installs.toLocaleString()} installs
                      </span>
                    </div>
                    <button className="mt-3 inline-flex items-center gap-1 rounded-md border border-[#dce0eb] px-2.5 py-1.5 text-[11px] font-semibold text-foreground hover:bg-[#f5f7fb]">
                      <HugeiconsIcon icon={CircleSlashTwoIcon} size={12} /> Add to chat commands
                    </button>
                  </article>
                ))}
              </div>
            </div>
          ))}
        </section>
      </div>
    </AppLayout>
  );
}
