'use client';

import React, { useEffect, useMemo, useState } from 'react';
import {
  CheckCircle2,
  ChevronDown,
  Eye,
  EyeOff,
  ExternalLink,
  Key,
  Loader2,
  Plus,
  ShieldCheck,
  Trash2,
  Edit3,
} from 'lucide-react';
import SmartKeyInput from './SmartKeyInput';
import { PROVIDERS } from '@/lib/providers';
import { broadcastModelsUpdate, syncModelsToStorage } from '@/lib/use-chat-models';

interface ProviderInfo {
  id: string;
  name: string;
  category: 'llm' | 'search';
  description: string;
  keyPlaceholder: string;
  keyPattern?: string;
  docsUrl: string;
  configured: boolean;
  preview: string | null;
  updatedAt: string | null;
}

const CATEGORY_LABEL: Record<ProviderInfo['category'], string> = {
  llm: 'AI / LLM Providers',
  search: 'Web Search Providers',
};

const CATEGORY_ORDER: ProviderInfo['category'][] = ['llm', 'search'];

function formatRelative(iso: string | null): string {
  if (!iso) return '';
  const then = new Date(iso).getTime();
  const diff = Date.now() - then;
  if (Number.isNaN(then)) return '';
  if (diff < 60_000) return 'just now';
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`;
  return `${Math.floor(diff / 86_400_000)}d ago`;
}

function ProviderCard({
  provider,
  onSave,
  onDelete,
}: {
  provider: ProviderInfo;
  onSave: (id: string, key: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}) {
  const [editing, setEditing] = useState(!provider.configured);
  const [keyValue, setKeyValue] = useState('');
  const [show, setShow] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedModels, setSelectedModels] = useState<string[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    setEditing(!provider.configured);
    const stored = localStorage.getItem(`selected_models_${provider.id}`);
    if (stored) {
      setSelectedModels(JSON.parse(stored));
    }
  }, [provider.configured, provider.id]);

  const toggleModel = (model: string) => {
    const updated = selectedModels.includes(model)
      ? selectedModels.filter((m) => m !== model)
      : [...selectedModels, model];
    setSelectedModels(updated);
    localStorage.setItem(`selected_models_${provider.id}`, JSON.stringify(updated));
    
    // Update global list for chat input
    const globalStored = localStorage.getItem('chat_models') || '[]';
    let globalModels = JSON.parse(globalStored) as string[];
    
    if (updated.includes(model)) {
      if (!globalModels.includes(model)) globalModels.push(model);
    } else {
      globalModels = globalModels.filter(m => m !== model);
    }
    localStorage.setItem('chat_models', JSON.stringify(globalModels));
    broadcastModelsUpdate();
  };

  const providerModels = PROVIDERS.find(p => p.id === provider.id)?.models || [];

  async function handleSave() {
    setError(null);
    if (!keyValue.trim()) {
      setError('Enter an API key first.');
      return;
    }
    setSaving(true);
    try {
      await onSave(provider.id, keyValue.trim());
      setKeyValue('');
      setShow(false);
      setEditing(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to save key');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    setError(null);
    setSaving(true);
    try {
      await onDelete(provider.id);
      setKeyValue('');
      setEditing(true);
      // Also clear models
      setSelectedModels([]);
      localStorage.removeItem(`selected_models_${provider.id}`);
      broadcastModelsUpdate();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to delete key');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="rounded-xl border border-border bg-white p-5 space-y-4 shadow-sm hover:shadow-md transition-shadow duration-200">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-sm font-bold text-foreground">{provider.name}</h3>
            {provider.configured && (
              <span className="status-badge bg-primary/10 text-primary border border-primary/20">
                <CheckCircle2 size={11} /> Connected
              </span>
            )}
            <a
              href={provider.docsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[10px] font-bold text-muted-foreground hover:text-primary inline-flex items-center gap-1 uppercase tracking-wider"
            >
              Get key <ExternalLink size={10} />
            </a>
          </div>
          <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{provider.description}</p>
        </div>
      </div>

      {editing ? (
        <div className="space-y-3">
          <div className="relative">
            <input
              type={show ? 'text' : 'password'}
              value={keyValue}
              onChange={(e) => setKeyValue(e.target.value)}
              placeholder={provider.keyPlaceholder}
              autoComplete="off"
              spellCheck={false}
              className="input-field pr-10 font-mono text-sm h-11"
            />
            <button
              type="button"
              onClick={() => setShow((s) => !s)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {show ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          </div>
          {error && <p className="text-[11px] text-red-500 font-medium">{error}</p>}
          <div className="flex items-center gap-2">
            <button type="button" onClick={handleSave} disabled={saving || !keyValue.trim()} className="btn-primary text-xs h-9 px-4">
              {saving ? <Loader2 size={12} className="animate-spin" /> : 'Save Key'}
            </button>
            {provider.configured && (
              <button type="button" onClick={() => setEditing(false)} className="btn-ghost text-xs h-9 px-4">Cancel</button>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between py-2 border-y border-border/50">
             <div className="flex flex-col gap-0.5">
               <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Status</span>
               <span className="text-xs font-semibold text-foreground font-mono">{provider.preview}</span>
             </div>
             <div className="flex items-center gap-2">
                <button onClick={() => setEditing(true)} className="p-1.5 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-all">
                  <Edit3 size={14} />
                </button>
                <button onClick={handleDelete} className="p-1.5 rounded-md text-muted-foreground hover:bg-red-50 hover:text-red-500 transition-all">
                  <Trash2 size={14} />
                </button>
             </div>
          </div>

          {provider.category === 'llm' && providerModels.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between relative">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Model Selection</span>
                <button 
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center gap-1.5 px-2 py-1 rounded bg-muted hover:bg-muted/80 text-[11px] font-bold text-foreground transition-all"
                >
                  Pick Models <ChevronDown size={12} className={`transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {isDropdownOpen && (
                  <div className="absolute top-full right-0 mt-1 w-56 bg-white border border-border rounded-lg shadow-xl z-30 py-1 max-h-48 overflow-y-auto scrollbar-thin">
                    {providerModels.map(model => (
                      <button
                        key={model}
                        onClick={() => toggleModel(model)}
                        className={`
                          w-full text-left px-3 py-1.5 text-xs flex items-center justify-between transition-colors
                          ${selectedModels.includes(model) ? 'bg-primary/5 text-primary font-bold' : 'text-foreground hover:bg-muted'}
                        `}
                      >
                        {model}
                        {selectedModels.includes(model) && <CheckCircle2 size={10} />}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              
              {selectedModels.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {selectedModels.map(model => (
                    <span key={model} className="px-1.5 py-0.5 rounded bg-primary/10 text-primary text-[10px] font-bold border border-primary/20">
                      {model}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function ApiConfigSection() {
  const [providers, setProviders] = useState<ProviderInfo[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<Record<ProviderInfo['category'], boolean>>({
    llm: true,
    search: true,
  });

  async function refresh() {
    try {
      const res = await fetch('/api/v1/settings/api-keys', { cache: 'no-store' });
      if (!res.ok) throw new Error(`Failed (${res.status})`);
      const data = (await res.json()) as { providers: ProviderInfo[] };
      setProviders(data.providers);
      setLoadError(null);
    } catch (err: unknown) {
      setLoadError(err instanceof Error ? err.message : 'Failed to load providers');
    }
  }

  useEffect(() => {
    void refresh();
  }, []);

  async function handleSave(providerId: string, apiKey: string) {
    const res = await fetch('/api/v1/settings/api-keys', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ providerId, apiKey }),
    });
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(text || `Save failed (${res.status})`);
    }

    // Automatically select all models for this provider if it's an LLM and none are selected
    const provider = PROVIDERS.find(p => p.id === providerId);
    if (provider && provider.category === 'llm' && provider.models && provider.models.length > 0) {
      const existing = localStorage.getItem(`selected_models_${providerId}`);
      if (!existing) {
        localStorage.setItem(`selected_models_${providerId}`, JSON.stringify(provider.models));
        syncModelsToStorage(provider.models);
      }
    }

    await refresh();
  }

  async function handleDelete(providerId: string) {
    const res = await fetch(
      `/api/v1/settings/api-keys?providerId=${encodeURIComponent(providerId)}`,
      { method: 'DELETE' }
    );
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(text || `Delete failed (${res.status})`);
    }
    await refresh();
  }

  const grouped = useMemo(() => {
    const acc: Record<ProviderInfo['category'], ProviderInfo[]> = {
      llm: [],
      search: [],
    };
    for (const p of providers ?? []) {
      acc[p.category]?.push(p);
    }
    return acc;
  }, [providers]);

  const totalConfigured = providers?.filter((p) => p.configured).length ?? 0;

  return (
    <section id="api-config" className="space-y-8">
      <div className="flex items-center gap-2.5 pb-1 border-b border-border/60">
        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
          <Key size={15} className="text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-base font-bold text-foreground">API Configuration</h2>
        </div>
        {providers && (
          <span className="status-badge bg-secondary/40 text-foreground hidden sm:inline-flex">
            <Plus size={11} /> {totalConfigured} connected
          </span>
        )}
      </div>

      <div className="space-y-4">
        <div className="space-y-1">
          <h3 className="text-sm font-bold text-foreground">Smart Key Input</h3>
          <p className="text-[11px] text-muted-foreground font-medium">
            Paste your API key here, and we&apos;ll automatically detect the provider.
          </p>
        </div>
        <SmartKeyInput onSave={handleSave} />
      </div>

      <div className="border-t border-border pt-6">
        <div className="space-y-1 mb-4">
          <h3 className="text-sm font-bold text-foreground">Manage Providers</h3>
          <p className="text-[11px] text-muted-foreground font-medium">
            View and manage your connected AI and search services.
          </p>
        </div>

        {loadError && (
          <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-xs text-red-600 font-medium">
            {loadError}
          </div>
        )}

        {!providers ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium">
            <Loader2 size={14} className="animate-spin" /> Loading providers…
          </div>
        ) : (
          <div className="space-y-5">
            {CATEGORY_ORDER.map((category) => {
              const list = grouped[category];
              if (list.length === 0) return null;
              return (
                <div key={category} className="space-y-2.5">
                  <button
                    type="button"
                    onClick={() => setExpanded((e) => ({ ...e, [category]: !e[category] }))}
                    className="flex items-center gap-1.5 w-full text-left"
                  >
                    <ChevronDown
                      size={14}
                      className={`text-muted-foreground transition-transform ${
                        expanded[category] ? '' : '-rotate-90'
                      }`}
                    />
                    <span className="section-label">{CATEGORY_LABEL[category]}</span>
                    <span className="text-[11px] text-muted-foreground font-bold ml-1">
                      ({list.filter((p) => p.configured).length}/{list.length})
                    </span>
                  </button>
                  {expanded[category] && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                      {list.map((p) => (
                        <ProviderCard
                          key={p.id}
                          provider={p}
                          onSave={handleSave}
                          onDelete={handleDelete}
                        />
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
