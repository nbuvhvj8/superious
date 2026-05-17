

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { HugeiconsIcon } from '@hugeicons/react';
import { CheckmarkCircle01Icon, Loading03Icon, SlidersHorizontalIcon } from '@hugeicons/core-free-icons';
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
    formState: { isDirty },
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
    <section id="research-preferences" className="space-y-12">
      <div className="flex items-center gap-2.5 pb-1 border-b border-border/60">
        <div className="w-8 h-8 rounded-lg bg-[#f2f3f6] flex items-center justify-center">
          <HugeiconsIcon icon={SlidersHorizontalIcon} size={15} className="text-foreground" />
        </div>
        <div>
          <h2 className="text-base font-bold text-foreground">Research Preferences</h2>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-12">
        <div className="space-y-8">
          {/* Max Sources */}
          <div className="flex items-start justify-between gap-8">
            <div className="space-y-1 flex-1">
              <h3 className="text-sm font-medium text-foreground">Max Sources Per Job</h3>
              <p className="text-xs text-muted-foreground leading-relaxed max-w-md">
                The source_ranker node selects up to this many high-quality sources. Range: 3–10.
              </p>
            </div>
            <div className="flex items-center gap-3 w-full max-w-[240px]">
              <input
                type="range"
                min={3}
                max={10}
                step={1}
                {...register('maxSources', { valueAsNumber: true })}
                className="flex-1 h-1.5 rounded-full accent-primary cursor-pointer bg-[#f2f3f6]"
              />
              <span className="font-mono text-[12px] font-bold text-foreground bg-[#f2f3f6] px-2 py-1 rounded-[6px] min-w-[28px] text-center">
                {maxSources}
              </span>
            </div>
          </div>

          {/* Screenshot Concurrency */}
          <div className="flex items-start justify-between gap-8">
            <div className="space-y-1 flex-1">
              <h3 className="text-sm font-medium text-foreground">Screenshot Concurrency</h3>
              <p className="text-xs text-muted-foreground leading-relaxed max-w-md">
                Max simultaneous Chromium instances. Higher values use more RAM. Range: 1–5.
              </p>
            </div>
            <div className="flex items-center gap-3 w-full max-w-[240px]">
              <input
                type="range"
                min={1}
                max={5}
                step={1}
                {...register('screenshotConcurrency', { valueAsNumber: true })}
                className="flex-1 h-1.5 rounded-full accent-primary cursor-pointer bg-[#f2f3f6]"
              />
              <span className="font-mono text-[12px] font-bold text-foreground bg-[#f2f3f6] px-2 py-1 rounded-[6px] min-w-[28px] text-center">
                {concurrency}
              </span>
            </div>
          </div>

          {/* Source Timeout */}
          <div className="flex items-start justify-between gap-8">
            <div className="space-y-1 flex-1">
              <h3 className="text-sm font-medium text-foreground">Per-Source Timeout</h3>
              <p className="text-xs text-muted-foreground leading-relaxed max-w-md">
                Seconds before a screenshot attempt is marked failed. Minimum 15s, maximum 60s.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={15}
                max={60}
                {...register('sourceTimeoutS', {
                  valueAsNumber: true,
                  min: { value: 15, message: 'Min 15s' },
                  max: { value: 60, message: 'Max 60s' },
                })}
                className="h-9 px-3 text-sm w-24 text-left bg-[#f2f3f6] rounded-[8px] border-0 outline-none focus:outline-none focus:ring-0 placeholder:text-muted-foreground/40 transition-all hover:bg-[#ebecef] font-mono"
              />
              <span className="text-[12px] font-bold text-muted-foreground">s</span>
            </div>
          </div>

          {/* Proxy URL */}
          <div className="flex items-start justify-between gap-8">
            <div className="space-y-1 flex-1">
              <h3 className="text-sm font-medium text-foreground">Screenshot Proxy URL</h3>
              <p className="text-xs text-muted-foreground leading-relaxed max-w-md">
                Optional HTTP/HTTPS proxy for blocked domains.
              </p>
            </div>
            <input
              type="url"
              placeholder="http://proxy.example.com:8080"
              {...register('proxyUrl')}
              className="h-9 px-3 text-sm w-full max-w-[240px] text-left bg-[#f2f3f6] rounded-[8px] border-0 outline-none focus:outline-none focus:ring-0 placeholder:text-muted-foreground/40 transition-all hover:bg-[#ebecef]"
              autoComplete="off"
            />
          </div>

          {/* Toggle Options */}
          <div className="flex items-start justify-between gap-8 pt-4 border-t border-border/40">
            <div className="space-y-1 flex-1">
              <h3 className="text-sm font-medium text-foreground">Retry Failed Screenshots</h3>
              <p className="text-xs text-muted-foreground leading-relaxed max-w-md">
                Automatically retry screenshot capture once if the first attempt fails.
              </p>
            </div>
            <Toggle checked={retryFailed} onChange={setRetryFailed} />
          </div>

          <div className="flex items-start justify-between gap-8">
            <div className="space-y-1 flex-1">
              <h3 className="text-sm font-medium text-foreground">Wayback Machine Fallback</h3>
              <p className="text-xs text-muted-foreground leading-relaxed max-w-md">
                If a URL is blocked, attempt to capture the most recent archive.org snapshot.
              </p>
            </div>
            <Toggle checked={archiveFallback} onChange={setArchiveFallback} />
          </div>
        </div>

        <div className="flex items-center gap-3 pt-6 border-t border-border/40">
          <button
            type="submit"
            disabled={saving}
            className="h-9 px-6 bg-[#f2f3f6] rounded-[8px] text-[12px] font-bold text-foreground hover:bg-[#ebecef] transition-all disabled:opacity-50 min-w-[140px]"
          >
            {saving ? (
              <span className="flex items-center justify-center gap-2">
                <HugeiconsIcon icon={Loading03Icon} size={14} className="animate-spin" />
                Saving...
              </span>
            ) : saved ? (
              <span className="flex items-center justify-center gap-2">
                <HugeiconsIcon icon={CheckmarkCircle01Icon} size={14} className="text-primary" />
                Saved
              </span>
            ) : (
              'Save Preferences'
            )}
          </button>
          {isDirty && !saving && !saved && (
            <span className="text-[11px] text-amber-600 font-bold uppercase tracking-wider">
              Unsaved changes
            </span>
          )}
        </div>
      </form>
    </section>
  );
}
