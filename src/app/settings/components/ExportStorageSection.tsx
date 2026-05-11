'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Download, CheckCircle2 } from 'lucide-react';
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
    <section id="export-storage" className="space-y-8">
      <div className="flex items-center gap-2.5 pb-1 border-b border-border/60">
        <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
          <Download size={15} className="text-foreground" />
        </div>
        <div>
          <h2 className="text-base font-bold text-foreground">Export & Storage</h2>
          <p className="text-xs text-muted-foreground">
            Configure default export format and screenshot storage lifecycle policy.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Default Export Format */}
          <div className="space-y-1.5">
            <label htmlFor="export-format" className="text-sm font-semibold text-foreground">
              Default Export Format
            </label>
            <p className="text-xs text-muted-foreground">
              Used when clicking the Export button on a completed script. Can be overridden per
              export.
            </p>
            <select
              id="export-format"
              {...register('defaultExportFormat')}
              className="input-field font-medium"
            >
              <option value="md">Markdown (.md)</option>
              <option value="txt">Plain Text (.txt)</option>
              <option value="json">JSON (.json)</option>
            </select>
          </div>

          {/* Screenshot Retention */}
          <div className="space-y-1.5">
            <label htmlFor="retention" className="text-sm font-semibold text-foreground">
              Screenshot Retention Period
            </label>
            <p className="text-xs text-muted-foreground">
              Screenshots are automatically deleted from Supabase Storage after this many days.
              Range: 7–90.
            </p>
            <div className="flex items-center gap-2">
              <input
                id="retention"
                type="number"
                min={7}
                max={90}
                {...register('screenshotRetentionDays', {
                  valueAsNumber: true,
                  min: { value: 7, message: 'Minimum 7 days' },
                  max: { value: 90, message: 'Maximum 90 days' },
                })}
                className="input-field w-24 font-mono text-sm"
              />
              <span className="text-sm text-muted-foreground font-medium">
                day{retentionDays !== 1 ? 's' : ''}
              </span>
            </div>
            {errors.screenshotRetentionDays && (
              <p className="text-xs text-red-500">{errors.screenshotRetentionDays.message}</p>
            )}
          </div>
        </div>

        {/* Auto Cleanup Toggle */}
        <div className="pt-2 border-t border-border">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-0.5">
              <p className="text-sm font-semibold text-foreground">Automatic Storage Cleanup</p>
              <p className="text-xs text-muted-foreground">
                Run a daily cleanup job that removes screenshots older than the retention period
                from Supabase Storage. Disabling this means screenshots accumulate indefinitely.
              </p>
            </div>
            <Toggle checked={autoCleanup} onChange={setAutoCleanup} id="cleanup-toggle" />
          </div>
        </div>

        {/* Storage Usage Info */}
        <div className="flex items-start gap-3 px-4 py-3 rounded-lg bg-secondary/20 border border-secondary/40">
          <div className="space-y-1 flex-1">
            <p className="text-xs font-bold text-foreground">Current Storage Usage</p>
            <div className="h-1.5 w-full rounded-full bg-border overflow-hidden">
              <div className="h-full rounded-full bg-primary" style={{ width: '34%' }} />
            </div>
            <div className="flex items-center justify-between">
              <span className="font-mono text-2xs text-muted-foreground">340 MB used</span>
              <span className="font-mono text-2xs text-muted-foreground">1 GB limit</span>
            </div>
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
              'Save Storage Settings'
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
