'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff, Key, CheckCircle2 } from 'lucide-react';
import Toggle from '@/components/ui/Toggle';

interface ApiFormData {
  anthropicKey: string;
  geminiKey: string;
  openaiKey: string;
  tavilyKey: string;
  serperKey: string;
  scriptGenerationProvider: 'anthropic' | 'gemini' | 'openai';
  researchProvider: 'anthropic' | 'gemini' | 'openai';
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
  const [scriptProvider, setScriptProvider] = useState<'anthropic' | 'gemini' | 'openai'>('anthropic');
  const [researchProvider, setResearchProvider] = useState<'anthropic' | 'gemini' | 'openai'>('anthropic');

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<ApiFormData>({
    defaultValues: {
      anthropicKey: 'sk-ant-api03-••••••••••••••••••••••••••••••••••••••••••',
      geminiKey: '',
      openaiKey: '',
      tavilyKey:    'tvly-••••••••••••••••••••••••••••••••',
      serperKey:    '',
      scriptGenerationProvider: 'anthropic',
      researchProvider: 'anthropic',
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

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-7">
        {/* Provider Selection */}
        <div className="space-y-4 p-4 bg-muted/40 rounded-lg border border-border">
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-3">Script Generation Provider</h3>
            <p className="text-xs text-muted-foreground mb-3">Choose based on performance, cost, or quality preferences.</p>
            <div className="flex gap-3">
              {(['anthropic', 'gemini', 'openai'] as const).map((provider) => (
                <button
                  key={provider}
                  type="button"
                  onClick={() => setScriptProvider(provider)}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-all ${
                    scriptProvider === provider
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary text-foreground hover:bg-secondary/80'
                  }`}
                >
                  {provider === 'anthropic' ? 'Claude (Anthropic)' : provider === 'gemini' ? 'Gemini' : 'GPT (OpenAI)'}
                </button>
              ))}
            </div>
          </div>

          <div className="border-t border-border pt-4">
            <h3 className="text-sm font-semibold text-foreground mb-3">Research Provider</h3>
            <p className="text-xs text-muted-foreground mb-3">Provider used for planning and analysis tasks.</p>
            <div className="flex gap-3">
              {(['anthropic', 'gemini', 'openai'] as const).map((provider) => (
                <button
                  key={provider}
                  type="button"
                  onClick={() => setResearchProvider(provider)}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-all ${
                    researchProvider === provider
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary text-foreground hover:bg-secondary/80'
                  }`}
                >
                  {provider === 'anthropic' ? 'Claude (Anthropic)' : provider === 'gemini' ? 'Gemini' : 'GPT (OpenAI)'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* API Keys */}
        <MaskedInput
          id="anthropic-key"
          label="Anthropic API Key"
          description="Used for Claude models (sonnet-4 for generation, haiku-4-5 for research). Optional if not using Claude."
          placeholder="sk-ant-api03-…"
          register={register}
          name="anthropicKey"
          error={errors.anthropicKey?.message}
        />

        <MaskedInput
          id="gemini-key"
          label="Google Gemini API Key"
          description="Used for Gemini models (gemini-2.0-flash for generation). Optional if not using Gemini."
          placeholder="AIzaSy…"
          register={register}
          name="geminiKey"
          error={errors.geminiKey?.message}
        />

        <MaskedInput
          id="openai-key"
          label="OpenAI API Key"
          description="Used for GPT models (gpt-4o for generation). Optional if not using OpenAI."
          placeholder="sk-…"
          register={register}
          name="openaiKey"
          error={errors.openaiKey?.message}
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