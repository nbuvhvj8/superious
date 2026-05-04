'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff, Key, CheckCircle2 } from 'lucide-react';

interface ApiFormData {
  anthropicKey: string;
  tavilyKey: string;
  serperKey: string;
}

function MaskedInput({ id, label, description, placeholder, register, error, name }: {
  id: string;
  label: string;
  description: string;
  placeholder: string;
  register: ReturnType<typeof useForm<ApiFormData>>['register'];
  error?: string;
  name: keyof ApiFormData;
}) {
  const [show, setShow] = useState(false);
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="text-sm font-semibold text-foreground">{label}</label>
      <p className="text-xs text-muted-foreground">{description}</p>
      <div className="relative">
        <input
          id={id}
          type={show ? 'text' : 'password'}
          placeholder={placeholder}
          {...register(name)}
          className="input-field pr-10 font-mono text-sm"
          autoComplete="off"
        />
        <button
          type="button"
          onClick={() => setShow(!show)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          aria-label={show ? 'Hide key' : 'Show key'}
        >
          {show ? <EyeOff size={14} /> : <Eye size={14} />}
        </button>
      </div>
      {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
    </div>
  );
}

export default function ApiConfigSection() {
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<ApiFormData>({
    defaultValues: {
      anthropicKey: 'sk-ant-api03-••••••••••••••••••••••••••••••••••••••••••',
      tavilyKey:    'tvly-••••••••••••••••••••••••••••••••',
      serperKey:    '',
    },
  });

  async function onSubmit(data: ApiFormData) {
    setSaving(true);
    // TODO: Connect to PATCH /api/v1/settings/api-keys
    await new Promise((r) => setTimeout(r, 1100));
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  return (
    <section id="api-config" className="card p-6 space-y-5">
      <div className="flex items-center gap-2.5 pb-1 border-b border-border">
        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
          <Key size={15} className="text-primary" />
        </div>
        <div>
          <h2 className="text-base font-bold text-foreground">API Configuration</h2>
          <p className="text-xs text-muted-foreground">Keys are stored encrypted at rest — never exposed in client responses.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <MaskedInput
          id="anthropic-key"
          label="Anthropic API Key"
          description="Used for script generation (claude-sonnet-4) and research planning (claude-haiku-4-5). Required."
          placeholder="sk-ant-api03-…"
          register={register}
          name="anthropicKey"
          error={errors.anthropicKey?.message}
        />
        <MaskedInput
          id="tavily-key"
          label="Tavily API Key"
          description="Primary web search provider. Supports up to 1,000 searches/month on the free tier."
          placeholder="tvly-…"
          register={register}
          name="tavilyKey"
          error={errors.tavilyKey?.message}
        />
        <MaskedInput
          id="serper-key"
          label="Serper API Key"
          description="Fallback search provider used when Tavily returns insufficient results. Optional."
          placeholder="Leave blank to disable fallback search"
          register={register}
          name="serperKey"
          error={errors.serperKey?.message}
        />

        <div className="flex items-center gap-3 pt-1">
          <button
            type="submit"
            disabled={saving || !isDirty}
            className="btn-primary min-w-[140px]"
          >
            {saving ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                Saving…
              </span>
            ) : saved ? (
              <span className="flex items-center gap-2">
                <CheckCircle2 size={14} />
                Saved
              </span>
            ) : (
              'Save API Keys'
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