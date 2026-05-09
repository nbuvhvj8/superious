'use client';

import React, { useEffect, useState } from 'react';
import { Palette, Check } from 'lucide-react';

type ThemeId = 'default' | 'theme-slate-indigo' | 'theme-stone-mocha';

interface ThemeOption {
  id: ThemeId;
  label: string;
  description: string;
  swatches: string[];
}

const THEMES: ThemeOption[] = [
  {
    id: 'default',
    label: 'Current',
    description: 'Cream + sage (existing)',
    swatches: ['#f4f6f9', '#8a9a6b', '#bfd7e2'],
  },
  {
    id: 'theme-slate-indigo',
    label: 'Option A — Slate & Indigo',
    description: 'Linear / Vercel — cool, minimal',
    swatches: ['#ffffff', '#4f46e5', '#f1f5f9'],
  },
  {
    id: 'theme-stone-mocha',
    label: 'Option B — Warm Paper & Mocha',
    description: 'Anthropic / Stripe — warm, editorial',
    swatches: ['#fafaf9', '#7c2d12', '#fef3c7'],
  },
];

const STORAGE_KEY = 'outlier-preview-theme';

function applyTheme(id: ThemeId) {
  const html = document.documentElement;
  html.classList.remove('theme-slate-indigo', 'theme-stone-mocha');
  if (id !== 'default') {
    html.classList.add(id);
  }
}

export default function ThemeSwitcher() {
  const [active, setActive] = useState<ThemeId>('default');
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const stored = (localStorage.getItem(STORAGE_KEY) as ThemeId | null) ?? 'default';
    setActive(stored);
    applyTheme(stored);
  }, []);

  const handleSelect = (id: ThemeId) => {
    setActive(id);
    applyTheme(id);
    localStorage.setItem(STORAGE_KEY, id);
  };

  return (
    <div className="fixed bottom-4 right-4 z-[60] font-sans">
      {open && (
        <div className="mb-2 w-[300px] rounded-xl border border-border bg-card shadow-2xl overflow-hidden">
          <div className="px-3 py-2 border-b border-border bg-muted/40">
            <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
              Theme Preview
            </p>
            <p className="text-[10px] text-muted-foreground mt-0.5">
              Live preview only — not yet applied to production
            </p>
          </div>
          <div className="p-2 space-y-1">
            {THEMES.map((t) => {
              const isActive = active === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => handleSelect(t.id)}
                  className={`w-full flex items-center gap-3 p-2 rounded-lg text-left transition-all duration-150 ${
                    isActive ? 'bg-primary/10 ring-1 ring-primary/30' : 'hover:bg-muted'
                  }`}
                >
                  <div className="flex -space-x-1 shrink-0">
                    {t.swatches.map((c, i) => (
                      <span
                        key={i}
                        className="w-5 h-5 rounded-full border-2 border-card"
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-bold text-foreground truncate">{t.label}</p>
                    <p className="text-[10px] text-muted-foreground truncate">{t.description}</p>
                  </div>
                  {isActive && (
                    <Check size={14} className="text-primary shrink-0" strokeWidth={2.5} />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 px-3 h-10 rounded-full bg-foreground text-background shadow-lg hover:opacity-90 active:scale-95 transition-all"
        aria-label="Theme preview switcher"
      >
        <Palette size={15} />
        <span className="text-[12px] font-semibold">
          {THEMES.find((t) => t.id === active)?.label.split(' — ')[0] ?? 'Theme'}
        </span>
      </button>
    </div>
  );
}
