'use client';

import React, { useState, useRef } from 'react';
import { Sparkles, SendHorizonal, Lightbulb, ChevronDown, FileVideo, Mic, Film, PlayCircle } from 'lucide-react';

const TOPIC_SUGGESTIONS = [
  'The history of solar energy in Africa',
  'How CRISPR gene editing is changing medicine',
  'The rise and fall of Blockbuster Video',
  'Why the Roman Empire really collapsed',
  'The science behind why we dream',
  'How TikTok\'s algorithm actually works',
  'The future of lab-grown meat',
  'Nuclear fusion: how close are we really?',
];

interface ScriptTemplate {
  id: string;
  label: string;
  icon: React.ReactNode;
  description: string;
  hookLength: string;
  sections: number;
  targetLength: string;
}

const SCRIPT_TEMPLATES: ScriptTemplate[] = [
  {
    id: 'youtube-longform',
    label: 'YouTube Long-form',
    icon: <PlayCircle size={14} />,
    description: 'Deep-dive format with strong hook, multiple sections, and CTA',
    hookLength: '30–60s',
    sections: 6,
    targetLength: '10–20 min',
  },
  {
    id: 'short-reel',
    label: 'Short / Reel',
    icon: <Film size={14} />,
    description: 'Fast-paced vertical video — hook in 3s, single key insight',
    hookLength: '3s',
    sections: 2,
    targetLength: '30–90s',
  },
  {
    id: 'podcast-intro',
    label: 'Podcast Intro',
    icon: <Mic size={14} />,
    description: 'Conversational tone, episode framing, guest intro if applicable',
    hookLength: '15–30s',
    sections: 3,
    targetLength: '3–5 min',
  },
  {
    id: 'documentary',
    label: 'Documentary-style',
    icon: <FileVideo size={14} />,
    description: 'Narrative arc, B-roll heavy, authoritative voice, no direct CTA',
    hookLength: '45–90s',
    sections: 8,
    targetLength: '20–40 min',
  },
];

const MIN_CHARS = 10;
const MAX_CHARS = 1000;

export default function PromptInputCard() {
  const [prompt, setPrompt] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('youtube-longform');
  const [templateOpen, setTemplateOpen] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const charCount = prompt.length;
  const isValid = charCount >= MIN_CHARS && charCount <= MAX_CHARS;
  const isOverLimit = charCount > MAX_CHARS;
  const activeTemplate = SCRIPT_TEMPLATES.find((t) => t.id === selectedTemplate)!;

  function handleSuggestion(suggestion: string) {
    setPrompt(suggestion);
    setError('');
    textareaRef.current?.focus();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValid || isSubmitting) return;
    setError('');
    setIsSubmitting(true);

    // TODO: Connect to POST /api/v1/script/generate with template param
    await new Promise((r) => setTimeout(r, 1400));

    setIsSubmitting(false);
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3500);
  }

  return (
    <div className="card p-6 space-y-4">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
          <Sparkles size={16} className="text-primary" />
        </div>
        <div>
          <h2 className="text-base font-bold text-foreground">New Research Job</h2>
          <p className="text-xs text-muted-foreground">Describe your video topic in detail for the best results</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        {/* Script Format Template Selector */}
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-foreground">Script Format</label>
          <div className="relative">
            <button
              type="button"
              onClick={() => setTemplateOpen(!templateOpen)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg border border-border bg-card hover:bg-muted transition-colors text-left"
            >
              <span className="text-primary">{activeTemplate.icon}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground">{activeTemplate.label}</p>
                <p className="text-xs text-muted-foreground truncate">{activeTemplate.description}</p>
              </div>
              <div className="flex items-center gap-3 shrink-0 text-2xs text-muted-foreground font-mono">
                <span>{activeTemplate.targetLength}</span>
                <span>·</span>
                <span>{activeTemplate.sections} sections</span>
              </div>
              <ChevronDown size={14} className={`text-muted-foreground transition-transform duration-150 shrink-0 ${templateOpen ? 'rotate-180' : ''}`} />
            </button>

            {templateOpen && (
              <div className="absolute left-0 right-0 top-full mt-1.5 bg-card border border-border rounded-xl shadow-lg z-20 overflow-hidden animate-fade-in">
                {SCRIPT_TEMPLATES.map((tmpl) => (
                  <button
                    key={tmpl.id}
                    type="button"
                    onClick={() => { setSelectedTemplate(tmpl.id); setTemplateOpen(false); }}
                    className={`
                      w-full flex items-start gap-3 px-4 py-3 text-left transition-colors
                      ${selectedTemplate === tmpl.id ? 'bg-primary/5' : 'hover:bg-muted'}
                    `}
                  >
                    <span className={`mt-0.5 ${selectedTemplate === tmpl.id ? 'text-primary' : 'text-muted-foreground'}`}>
                      {tmpl.icon}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-semibold ${selectedTemplate === tmpl.id ? 'text-primary' : 'text-foreground'}`}>
                        {tmpl.label}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">{tmpl.description}</p>
                    </div>
                    <div className="text-right shrink-0 space-y-0.5">
                      <p className="font-mono text-2xs text-muted-foreground">{tmpl.targetLength}</p>
                      <p className="font-mono text-2xs text-muted-foreground">{tmpl.sections} sections</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="prompt-input" className="text-sm font-semibold text-foreground">
            Research Prompt
          </label>
          <p className="text-xs text-muted-foreground">
            Be specific — include context, angle, and intended audience for a richer script.
          </p>
          <div className="relative">
            <textarea
              id="prompt-input"
              ref={textareaRef}
              value={prompt}
              onChange={(e) => {
                setPrompt(e.target.value);
                if (error) setError('');
              }}
              placeholder="e.g. Explain the history and future of nuclear fusion energy for a general audience — cover key milestones, current projects like ITER, and realistic timelines."
              className={`
                input-field resize-none h-32 leading-relaxed
                ${isOverLimit ? 'ring-2 ring-red-400 border-red-300' : ''}
              `}
              maxLength={MAX_CHARS + 50}
              aria-describedby="char-count prompt-error"
            />
            <div
              id="char-count"
              className={`
                absolute bottom-2.5 right-3 text-xs font-mono tabular-nums font-medium
                ${isOverLimit ? 'text-red-500' : charCount > MAX_CHARS * 0.8 ? 'text-amber-600' : 'text-muted-foreground'}
              `}
            >
              {charCount}/{MAX_CHARS}
            </div>
          </div>
          {error && (
            <p id="prompt-error" className="text-xs text-red-500 font-medium">{error}</p>
          )}
        </div>

        {/* Suggestions */}
        <div className="space-y-2">
          <div className="flex items-center gap-1.5">
            <Lightbulb size={12} className="text-muted-foreground" />
            <span className="text-xs font-semibold text-muted-foreground">Topic ideas</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {TOPIC_SUGGESTIONS.map((suggestion) => (
              <button
                key={`suggestion-${suggestion.slice(0, 30).replace(/\s+/g, '-')}`}
                type="button"
                onClick={() => handleSuggestion(suggestion)}
                className="
                  text-xs px-3 py-1.5 rounded-full border border-border bg-muted
                  text-muted-foreground font-medium hover:border-primary hover:text-primary
                  hover:bg-primary/5 transition-all duration-150 active:scale-95
                "
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3 pt-1">
          <button
            type="submit"
            disabled={!isValid || isSubmitting}
            className="btn-primary min-w-[160px]"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                Queuing job…
              </span>
            ) : submitted ? (
              <span className="flex items-center gap-2">
                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
                Job queued!
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <SendHorizonal size={14} />
                Generate Script
              </span>
            )}
          </button>
          {charCount > 0 && charCount < MIN_CHARS && (
            <p className="text-xs text-muted-foreground">
              {MIN_CHARS - charCount} more character{MIN_CHARS - charCount !== 1 ? 's' : ''} needed
            </p>
          )}
        </div>
      </form>
    </div>
  );
}