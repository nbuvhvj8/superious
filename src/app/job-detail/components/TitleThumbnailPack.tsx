'use client';

import React, { useState } from 'react';
import { Type, Image as ImageIcon, Copy, CheckCircle2, Sparkles, RefreshCw } from 'lucide-react';
import type { TitleThumbnailPack, TitleVariant, ThumbnailConcept } from '@/server/types';

/**
 * Right-pane tab that surfaces YouTube-ready packaging for the script:
 * five title variants and three thumbnail concept briefs. Image generation
 * is intentionally out of scope (per the v1.0 PRD non-goals); we ship
 * actionable art-direction text instead.
 */
const MOCK_PACK: TitleThumbnailPack = {
  jobId: 'job-1c93be',
  generatedAt: '2026-05-04T18:50:00Z',
  titles: [
    {
      id: 'title-1',
      text: "CRISPR Just Cured Cancer (Almost) — Here's What Comes Next",
      rationale: 'Curiosity-gap with parenthetical hedge; performs well in tech/health niches.',
      charCount: 56,
    },
    {
      id: 'title-2',
      text: 'The $2.2 Million Pill That Edits Your DNA',
      rationale: 'Money-led headline; the price tag is the most clickable single fact.',
      charCount: 41,
    },
    {
      id: 'title-3',
      text: 'How CRISPR Is Quietly Rewriting Cancer Treatment in 2026',
      rationale: 'Dated + topic + evergreen; strong for evergreen search traffic.',
      charCount: 56,
    },
    {
      id: 'title-4',
      text: "We're Editing DNA to Cure Cancer. The Side Effects Are Wild.",
      rationale: 'First-person plural + curiosity tease about consequences.',
      charCount: 60,
    },
    {
      id: 'title-5',
      text: 'CRISPR vs. Cancer: The Tech Nobody Saw Coming',
      rationale: 'Vs.-format + counter-narrative framing; high CTR in tech audiences.',
      charCount: 46,
    },
  ],
  thumbnails: [
    {
      id: 'thumb-1',
      subject: 'Glowing strand of DNA being snipped by oversized molecular scissors',
      framing:
        'Centered hero composition; scissors cropped from upper-right entering frame. Macro-style, shallow depth of field.',
      textOverlay: '$2.2M PILL',
      mood: 'High-contrast cyan / amber. Lab-tech feel — clinical but cinematic.',
    },
    {
      id: 'thumb-2',
      subject: 'Split-screen: hospital room (left) vs. computer-rendered DNA helix (right)',
      framing:
        'Vertical split at 50/50. Subject on the left looks toward the helix on the right; eyeline directs viewer attention across the cut.',
      textOverlay: 'CURED?',
      mood: 'Warm hospital tones contrasted with cold neon-blue DNA. Saturation pushed +20.',
    },
    {
      id: 'thumb-3',
      subject: 'Scientist in protective gear holding a single illuminated petri dish',
      framing:
        "Three-quarter portrait, subject's hands and dish in sharp focus, face slightly soft. Negative space top-right for title overlay.",
      textOverlay: 'CRISPR vs. CANCER',
      mood: 'Documentary realism — desaturated greys with a single warm light source.',
    },
  ],
};

interface Props {
  pack?: TitleThumbnailPack;
  onRegenerate?: () => void;
}

export default function TitleThumbnailPack({ pack = MOCK_PACK, onRegenerate }: Props) {
  return (
    <div className="px-4 py-5 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-foreground">Pack</h3>
          {onRegenerate && (
            <button onClick={onRegenerate} className="btn-secondary gap-1 text-2xs py-1 px-2">
              <RefreshCw size={11} />
              Regenerate
            </button>
          )}
        </div>
        <p className="text-2xs text-muted-foreground leading-relaxed">
          YouTube-ready packaging derived from your hook and top sources — five title variants and
          three thumbnail concept briefs.
        </p>
      </div>

      {/* Titles */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="section-label flex items-center gap-1.5">
            <Type size={11} />
            Title Variants
          </span>
          <span className="font-mono text-2xs text-muted-foreground tabular-nums">
            {pack.titles.length}
          </span>
        </div>
        <ul className="space-y-2">
          {pack.titles.map((t) => (
            <TitleRow key={t.id} title={t} />
          ))}
        </ul>
      </section>

      {/* Thumbnails */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="section-label flex items-center gap-1.5">
            <ImageIcon size={11} />
            Thumbnail Concepts
          </span>
          <span className="font-mono text-2xs text-muted-foreground tabular-nums">
            {pack.thumbnails.length}
          </span>
        </div>
        <ul className="space-y-3">
          {pack.thumbnails.map((c, idx) => (
            <ThumbnailCard key={c.id} concept={c} index={idx + 1} />
          ))}
        </ul>
      </section>

      <p className="text-2xs text-muted-foreground flex items-center gap-1.5 pt-2 border-t border-border">
        <Sparkles size={11} className="text-primary" />
        Concepts are art-direction briefs, not generated images — pass them to your designer or
        thumbnail tool of choice.
      </p>
    </div>
  );
}

function TitleRow({ title }: { title: TitleVariant }) {
  const [copied, setCopied] = useState(false);
  function handleCopy() {
    void navigator.clipboard
      .writeText(title.text)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      })
      .catch(() => {
        /* clipboard blocked — silently no-op */
      });
  }
  return (
    <li className="card p-3 space-y-2 group hover:border-primary/40 transition-colors">
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs font-bold text-foreground leading-snug">{title.text}</p>
        <button
          onClick={handleCopy}
          className="btn-ghost p-1 text-muted-foreground hover:text-primary shrink-0"
          aria-label="Copy title"
          title="Copy title"
        >
          {copied ? <CheckCircle2 size={12} className="text-primary" /> : <Copy size={12} />}
        </button>
      </div>
      <p className="text-2xs text-muted-foreground leading-relaxed">{title.rationale}</p>
      <div className="flex items-center gap-2 text-2xs">
        <span
          className={`font-mono tabular-nums font-semibold ${
            title.charCount > 60 ? 'text-amber-600' : 'text-muted-foreground'
          }`}
        >
          {title.charCount} chars
        </span>
        {title.charCount > 60 && (
          <span className="text-amber-600 font-medium">May truncate on mobile (60-char limit)</span>
        )}
      </div>
    </li>
  );
}

function ThumbnailCard({ concept, index }: { concept: ThumbnailConcept; index: number }) {
  return (
    <li className="card p-3 space-y-2.5">
      <div className="flex items-center gap-2">
        <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-2xs font-bold flex items-center justify-center shrink-0">
          {index}
        </span>
        <span className="text-2xs font-bold text-foreground uppercase tracking-wider">
          Concept {index}
        </span>
      </div>
      <div className="space-y-2 text-2xs leading-relaxed">
        <Field label="Subject" value={concept.subject} />
        <Field label="Framing" value={concept.framing} />
        {concept.textOverlay && <Field label="On-image text" value={concept.textOverlay} mono />}
        <Field label="Mood" value={concept.mood} />
      </div>
    </li>
  );
}

function Field({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="space-y-0.5">
      <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">
        {label}
      </span>
      <p
        className={`text-2xs text-foreground leading-relaxed ${
          mono ? 'font-mono font-semibold' : ''
        }`}
      >
        {value}
      </p>
    </div>
  );
}
