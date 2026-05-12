'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Download, CheckCircle2, Loader2, ChevronDown } from 'lucide-react';
import Toggle from '@/components/ui/Toggle';

interface ExportFormData {
  defaultExportFormat: 'txt' | 'md' | 'json';
  screenshotRetentionDays: number;
}

export default function ExportStorageSection() {
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [autoCleanup, setAutoCleanup] = useState(true);

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    watch,
  } = useForm<ExportFormData>({
    defaultValues: {
      defaultExportFormat: 'md',
      screenshotRetentionDays: 30,
    },
  });

  const retentionDays = watch('screenshotRetentionDays');

  async function onSubmit() {
    setSaving(true);
    // TODO: Connect to PATCH /api/v1/settings/export
    await new Promise((r) => setTimeout(r, 900));
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  return (
    <section id="export-storage" className="space-y-12">
      <div className="flex items-center gap-2.5 pb-1 border-b border-border/60">
        <div className="w-8 h-8 rounded-lg bg-[#f2f3f6] flex items-center justify-center">
          <Download size={15} className="text-foreground" />
        </div>
        <div>
          <h2 className="text-base font-bold text-foreground">Export & Storage</h2>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-12">
        <div className="space-y-8">
          {/* Default Export Format */}
          <div className="flex items-start justify-between gap-8">
            <div className="space-y-1 flex-1">
              <h3 className="text-sm font-medium text-foreground">Default Export Format</h3>
              <p className="text-xs text-muted-foreground leading-relaxed max-w-md">
                Used when clicking the Export button on a completed script.
              </p>
            </div>
            <div className="relative w-full max-w-[240px]">
              <select
                id="export-format"
                {...register('defaultExportFormat')}
                className="appearance-none h-9 px-3 text-sm w-full text-left bg-[#f2f3f6] rounded-[8px] border-0 outline-none focus:outline-none focus:ring-0 placeholder:text-muted-foreground/40 transition-all hover:bg-[#ebecef] font-bold text-foreground"
              >
                <option value="md">Markdown (.md)</option>
                <option value="txt">Plain Text (.txt)</option>
                <option value="json">JSON (.json)</option>
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                <ChevronDown size={14} className="text-muted-foreground" />
              </div>
            </div>
          </div>

          {/* Screenshot Retention */}
          <div className="flex items-start justify-between gap-8">
            <div className="space-y-1 flex-1">
              <h3 className="text-sm font-medium text-foreground">Screenshot Retention Period</h3>
              <p className="text-xs text-muted-foreground leading-relaxed max-w-md">
                Screenshots are automatically deleted after this many days. Range: 7–90.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={7}
                max={90}
                {...register('screenshotRetentionDays', {
                  valueAsNumber: true,
                  min: { value: 7, message: 'Min 7 days' },
                  max: { value: 90, message: 'Max 90 days' },
                })}
                className="h-9 px-3 text-sm w-24 text-left bg-[#f2f3f6] rounded-[8px] border-0 outline-none focus:outline-none focus:ring-0 placeholder:text-muted-foreground/40 transition-all hover:bg-[#ebecef] font-mono"
              />
              <span className="text-[12px] font-bold text-muted-foreground">days</span>
            </div>
          </div>

          {/* Auto Cleanup Toggle */}
          <div className="flex items-start justify-between gap-8 pt-4 border-t border-border/40">
            <div className="space-y-1 flex-1">
              <h3 className="text-sm font-medium text-foreground">Automatic Storage Cleanup</h3>
              <p className="text-xs text-muted-foreground leading-relaxed max-w-md">
                Run a daily cleanup job that removes screenshots older than the retention period.
              </p>
            </div>
            <Toggle checked={autoCleanup} onChange={setAutoCleanup} />
          </div>

          {/* Storage Usage Row */}
          <div className="flex items-start justify-between gap-8">
            <div className="space-y-1 flex-1">
              <h3 className="text-sm font-medium text-foreground">Current Storage Usage</h3>
              <p className="text-xs text-muted-foreground leading-relaxed max-w-md">
                Total space occupied by screenshots in Supabase Storage.
              </p>
            </div>
            <div className="w-full max-w-[240px] space-y-2">
              <div className="h-2 w-full rounded-full bg-[#f2f3f6] overflow-hidden">
                <div className="h-full rounded-full bg-primary" style={{ width: '34%' }} />
              </div>
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                  340 MB / 1 GB
                </span>
                <span className="text-[10px] font-bold text-primary">34% used</span>
              </div>
            </div>
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
                <Loader2 size={14} className="animate-spin" />
                Saving...
              </span>
            ) : saved ? (
              <span className="flex items-center justify-center gap-2">
                <CheckCircle2 size={14} className="text-primary" />
                Saved
              </span>
            ) : (
              'Save Storage Settings'
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
