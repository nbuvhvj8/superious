'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Sliders, CheckCircle2 } from 'lucide-react';
import Toggle from '@/components/ui/Toggle';

interface ResearchFormData {
  maxSources: number;
  screenshotConcurrency: number;
  proxyUrl: string;
  sourceTimeoutS: number;
  retryFailedScreenshots: boolean;
  useArchiveFallback: boolean;
}

export default function ResearchPreferencesSection() {
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [retryFailed, setRetryFailed] = useState(true);
  const [archiveFallback, setArchiveFallback] = useState(true);

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    watch,
  } = useForm<ResearchFormData>({
    defaultValues: {
      maxSources: 8,
      screenshotConcurrency: 3,
      proxyUrl: '',
      sourceTimeoutS: 30,
      retryFailedScreenshots: true,
      useArchiveFallback: true,
    },
  });

  const maxSources = watch('maxSources');
  const concurrency = watch('screenshotConcurrency');

  async function onSubmit() {
    setSaving(true);
    // TODO: Connect to PATCH /api/v1/settings/research
    await new Promise((r) => setTimeout(r, 1000));
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  return (
    <section id="research-prefs" className="card p-6 space-y-5">
      <div className="flex items-center gap-2.5 pb-1 border-b border-border">
        <div className="w-8 h-8 rounded-lg bg-secondary/60 flex items-center justify-center">
          <Sliders size={15} className="text-foreground" />
        </div>
        <div>
          <h2 className="text-base font-bold text-foreground">Research Preferences</h2>
          <p className="text-xs text-muted-foreground">
            Control how the research agent and screenshot service behave per job.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Max Sources */}
          <div className="space-y-1.5">
            <label htmlFor="max-sources" className="text-sm font-semibold text-foreground">
              Max Sources Per Job
            </label>
            <p className="text-xs text-muted-foreground">
              The source_ranker node selects up to this many high-quality sources. Range: 3–10.
            </p>
            <div className="flex items-center gap-3">
              <input
                id="max-sources"
                type="range"
                min={3}
                max={10}
                step={1}
                {...register('maxSources', { valueAsNumber: true })}
                className="flex-1 h-1.5 rounded-full accent-primary cursor-pointer"
              />
              <span className="font-mono text-sm font-bold text-foreground tabular-nums w-6 text-center">
                {maxSources}
              </span>
            </div>
            {errors.maxSources && (
              <p className="text-xs text-red-500">{errors.maxSources.message}</p>
            )}
          </div>

          {/* Screenshot Concurrency */}
          <div className="space-y-1.5">
            <label htmlFor="concurrency" className="text-sm font-semibold text-foreground">
              Screenshot Concurrency
            </label>
            <p className="text-xs text-muted-foreground">
              Max simultaneous Chromium instances. Higher values use more RAM. Range: 1–5.
            </p>
            <div className="flex items-center gap-3">
              <input
                id="concurrency"
                type="range"
                min={1}
                max={5}
                step={1}
                {...register('screenshotConcurrency', { valueAsNumber: true })}
                className="flex-1 h-1.5 rounded-full accent-primary cursor-pointer"
              />
              <span className="font-mono text-sm font-bold text-foreground tabular-nums w-6 text-center">
                {concurrency}
              </span>
            </div>
          </div>

          {/* Source Timeout */}
          <div className="space-y-1.5">
            <label htmlFor="timeout" className="text-sm font-semibold text-foreground">
              Per-Source Screenshot Timeout
            </label>
            <p className="text-xs text-muted-foreground">
              Seconds before a screenshot attempt is marked failed. Minimum 15s, maximum 60s.
            </p>
            <div className="flex items-center gap-2">
              <input
                id="timeout"
                type="number"
                min={15}
                max={60}
                {...register('sourceTimeoutS', {
                  valueAsNumber: true,
                  min: { value: 15, message: 'Minimum 15 seconds' },
                  max: { value: 60, message: 'Maximum 60 seconds' },
                })}
                className="input-field w-24 font-mono text-sm"
              />
              <span className="text-sm text-muted-foreground font-medium">seconds</span>
            </div>
            {errors.sourceTimeoutS && (
              <p className="text-xs text-red-500">{errors.sourceTimeoutS.message}</p>
            )}
          </div>

          {/* Proxy URL */}
          <div className="space-y-1.5">
            <label htmlFor="proxy-url" className="text-sm font-semibold text-foreground">
              Screenshot Proxy URL
            </label>
            <p className="text-xs text-muted-foreground">
              Optional HTTP/HTTPS proxy for blocked domains. Format: http://user:pass@host:port
            </p>
            <input
              id="proxy-url"
              type="url"
              placeholder="http://proxy.example.com:8080"
              {...register('proxyUrl')}
              className="input-field font-mono text-sm"
              autoComplete="off"
            />
          </div>
        </div>

        {/* Toggle Options */}
        <div className="space-y-3 pt-2 border-t border-border">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-0.5">
              <p className="text-sm font-semibold text-foreground">Retry Failed Screenshots</p>
              <p className="text-xs text-muted-foreground">
                Automatically retry screenshot capture once if the first attempt fails. Uses
                exponential back-off (1s, 4s, 16s).
              </p>
            </div>
            <Toggle checked={retryFailed} onChange={setRetryFailed} id="retry-toggle" />
          </div>
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-0.5">
              <p className="text-sm font-semibold text-foreground">Wayback Machine Fallback</p>
              <p className="text-xs text-muted-foreground">
                If a URL is blocked or unavailable, attempt to capture the most recent archive.org
                snapshot instead.
              </p>
            </div>
            <Toggle checked={archiveFallback} onChange={setArchiveFallback} id="archive-toggle" />
          </div>
        </div>

        <div className="flex items-center gap-3 pt-1">
          <button type="submit" disabled={saving} className="btn-primary min-w-[160px]">
            {saving ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24" fill="none">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                Saving…
              </span>
            ) : saved ? (
              <span className="flex items-center gap-2">
                <CheckCircle2 size={14} /> Saved
              </span>
            ) : (
              'Save Preferences'
            )}
          </button>
          {isDirty && !saving && !saved && (
            <span className="text-xs text-amber-600 font-medium">Unsaved changes</span>
          )}
        </div>
      </form>
    </section>
  );
}
