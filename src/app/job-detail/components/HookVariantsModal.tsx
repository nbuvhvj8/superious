'use client';

import React, { useEffect, useState } from 'react';
import { Loader2, Sparkles, Check, RefreshCw } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import type { HookAngle, HookVariant } from '@/server/types';

/**
 * Modal that fetches & displays alternative hooks for the current script.
 *
 * Implementation note: the API call to `/api/v1/scripts/:jobId/hook-variants`
 * is a small wrapper around the existing LLM provider — see the route
 * handler. When the call fails (or no LLM provider is configured) the
 * component falls back to a baked-in mock so the UX still demonstrates the
 * feature end-to-end.
 */
interface Props {
  open: boolean;
  jobId: string;
  currentHook: string;
  onClose: () => void;
  onApply: (variant: HookVariant) => void;
}

const ANGLE_LABELS: Record<HookAngle, { label: string; tagline: string; color: string }> = {
  'data-led': {
    label: 'Data-led',
    tagline: 'Lead with the most striking statistic',
    color: 'bg-blue-500/10 text-blue-600 border-blue-200',
  },
  contrarian: {
    label: 'Contrarian',
    tagline: 'Open with what the consensus gets wrong',
    color: 'bg-red-500/10 text-red-600 border-red-200',
  },
  narrative: {
    label: 'Narrative',
    tagline: 'Drop the viewer into a specific moment',
    color: 'bg-purple-500/10 text-purple-600 border-purple-200',
  },
  emotional: {
    label: 'Emotional',
    tagline: 'Anchor in human stakes',
    color: 'bg-pink-500/10 text-pink-600 border-pink-200',
  },
  'question-led': {
    label: 'Question-led',
    tagline: 'Open with the question viewers are searching',
    color: 'bg-emerald-500/10 text-emerald-600 border-emerald-200',
  },
};

const FALLBACK_VARIANTS: HookVariant[] = [
  {
    id: 'hook-var-data',
    angle: 'data-led',
    text: "Cancer patients receiving CRISPR-edited T-cells are showing response rates above 70% — in cancers that previously had a five-year survival rate below 12%. That's not iteration. That's a phase change.",
    sourceIds: ['src-001', 'src-005'],
    estimatedDurationS: 14,
  },
  {
    id: 'hook-var-contrarian',
    angle: 'contrarian',
    text: "Most people think CRISPR is a research tool that's still 10 years from your hospital. They are wrong. The first FDA-approved CRISPR therapy was prescribed last year — and oncology is next.",
    sourceIds: ['src-002', 'src-004'],
    estimatedDurationS: 13,
  },
  {
    id: 'hook-var-narrative',
    angle: 'narrative',
    text: 'In November 2023, a teenager with sickle cell disease walked out of a Boston hospital cancer-free for the first time in her life. Her treatment? A pair of molecular scissors that cost $2.2 million.',
    sourceIds: ['src-003', 'src-004'],
    estimatedDurationS: 15,
  },
  {
    id: 'hook-var-emotional',
    angle: 'emotional',
    text: 'For 60 years, "you have cancer" was a sentence that ended with chemotherapy. CRISPR is rewriting that sentence — and if you live long enough to need this technology, the version that saves you is being engineered right now.',
    sourceIds: ['src-001', 'src-005', 'src-008'],
    estimatedDurationS: 16,
  },
  {
    id: 'hook-var-question',
    angle: 'question-led',
    text: "What if curing cancer wasn't a discovery — but a software update for your DNA? That's what CRISPR oncology is becoming. And the ethical aftershocks are already hitting.",
    sourceIds: ['src-006', 'src-007'],
    estimatedDurationS: 12,
  },
];

export default function HookVariantsModal({ open, jobId, currentHook, onClose, onApply }: Props) {
  const [variants, setVariants] = useState<HookVariant[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  async function fetchVariants(force = false) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/v1/scripts/${jobId}/hook-variants${force ? '?force=1' : ''}`);
      if (!res.ok) throw new Error(`Request failed (${res.status})`);
      const json = (await res.json()) as { variants: HookVariant[] };
      setVariants(json.variants);
    } catch (err) {
      // Fallback to mock so the user still sees the feature work.
      setError(err instanceof Error ? err.message : 'Failed to fetch variants');
      setVariants(FALLBACK_VARIANTS);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (open && variants === null && !loading) {
      void fetchVariants();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  return (
    <Modal open={open} onClose={onClose} title="Hook Variants" size="xl">
      <div className="p-5 space-y-5">
        <p className="text-xs text-muted-foreground leading-relaxed">
          Five alternative hooks generated from the same source manifest, each leaning into a
          different angle. Pick the one that fits the channel you&apos;re publishing to — your
          script stays intact, only the opening swaps.
        </p>

        <div className="flex items-center justify-between">
          <span className="section-label">Current Hook</span>
          <button
            onClick={() => fetchVariants(true)}
            className="btn-secondary gap-1.5 text-xs py-1.5 px-3"
            disabled={loading}
          >
            <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
            Regenerate
          </button>
        </div>
        <p className="text-xs text-muted-foreground italic line-clamp-3 px-3 py-2 rounded-lg bg-muted/40 border border-border">
          {currentHook}
        </p>

        {error && (
          <p className="text-2xs text-amber-600 font-medium">
            {error} — showing example variants instead.
          </p>
        )}

        {loading && variants === null ? (
          <div className="flex items-center justify-center py-12 text-muted-foreground gap-2">
            <Loader2 size={16} className="animate-spin" />
            <span className="text-sm font-medium">Generating five variants…</span>
          </div>
        ) : (
          <div className="space-y-3 max-h-[55vh] overflow-y-auto scrollbar-thin pr-1">
            {(variants ?? []).map((v) => {
              const meta = ANGLE_LABELS[v.angle];
              const isSelected = selectedId === v.id;
              return (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => setSelectedId(v.id)}
                  className={`
                    w-full text-left card p-4 space-y-2 transition-all duration-150
                    ${isSelected ? 'border-primary ring-2 ring-primary/20' : 'hover:border-primary/40'}
                  `}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-2xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${meta.color}`}
                      >
                        {meta.label}
                      </span>
                      <span className="text-2xs text-muted-foreground">{meta.tagline}</span>
                    </div>
                    <span className="font-mono text-2xs text-muted-foreground tabular-nums shrink-0">
                      ~{v.estimatedDurationS}s
                    </span>
                  </div>
                  <p className="text-sm text-foreground leading-relaxed">{v.text}</p>
                  {v.sourceIds.length > 0 && (
                    <div className="flex items-center gap-1.5 pt-1">
                      <span className="text-2xs text-muted-foreground font-semibold">Sources:</span>
                      {v.sourceIds.map((sid) => (
                        <span
                          key={`${v.id}-${sid}`}
                          className="text-2xs font-mono text-foreground bg-secondary/50 rounded-full px-1.5 py-0.5"
                        >
                          {sid.replace('src-', '')}
                        </span>
                      ))}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        )}

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
          <button onClick={onClose} className="btn-ghost text-xs py-1.5 px-3">
            Cancel
          </button>
          <button
            onClick={() => {
              const selected = (variants ?? []).find((v) => v.id === selectedId);
              if (selected) {
                onApply(selected);
                onClose();
              }
            }}
            disabled={!selectedId}
            className="btn-primary gap-1.5 text-xs py-1.5 px-4 disabled:opacity-40 disabled:pointer-events-none"
          >
            <Check size={12} />
            Use This Hook
          </button>
        </div>

        <p className="text-2xs text-muted-foreground flex items-center gap-1.5">
          <Sparkles size={11} className="text-primary" />
          Variants are grounded in the same captured sources — every claim stays cite-able.
        </p>
      </div>
    </Modal>
  );
}
