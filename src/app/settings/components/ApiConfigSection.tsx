'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { ChevronDown, Eye, EyeOff, Loader2, Trash2, Edit3, Check } from 'lucide-react';
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

function ProviderRow({
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
      globalModels = globalModels.filter((m) => m !== model);
    }
    localStorage.setItem('chat_models', JSON.stringify(globalModels));
    broadcastModelsUpdate();
  };

  const providerModels = PROVIDERS.find((p) => p.id === provider.id)?.models || [];

  async function handleSave() {
    setError(null);
    if (!keyValue.trim()) {
      setError('Enter key');
      return;
    }
    setSaving(true);
    try {
      await onSave(provider.id, keyValue.trim());
      setKeyValue('');
      setShow(false);
      setEditing(false);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-col gap-3 py-4 border-b border-border/40 last:border-0">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="space-y-0.5">
            <h3 className="text-sm font-bold text-foreground">{provider.name}</h3>
            <p className="text-[11.5px] text-muted-foreground leading-none">
              {provider.description}
            </p>
          </div>
          {provider.configured && (
            <span className="flex items-center gap-1 text-[10px] font-bold text-primary bg-primary/5 px-2 py-0.5 rounded-full uppercase tracking-wider">
              Connected
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          {provider.category === 'llm' && provider.configured && providerModels.length > 0 && (
            <div className="relative">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-2 px-2.5 py-1.5 bg-[#f2f3f6] rounded-[8px] text-[11px] font-bold text-foreground hover:bg-[#ebecef] transition-all"
              >
                <span>{selectedModels.length} Models</span>
                <ChevronDown
                  size={12}
                  className={`text-muted-foreground transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}
                />
              </button>

              {isDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsDropdownOpen(false)} />
                  <div className="absolute top-full right-0 mt-1 w-52 bg-white border border-border/60 rounded-[8px] shadow-xl z-50 py-1 max-h-60 overflow-y-auto scrollbar-thin">
                    {providerModels.map((model) => (
                      <button
                        key={model}
                        onClick={() => toggleModel(model)}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-[11px] font-semibold hover:bg-[#f9f9f9] transition-colors text-left"
                      >
                        <span className="flex-1 truncate">{model}</span>
                        {selectedModels.includes(model) && (
                          <Check className="text-primary" size={12} />
                        )}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          {!editing ? (
            <div className="flex items-center gap-1">
              <span className="text-[11.5px] font-mono text-muted-foreground mr-2">
                {provider.preview}
              </span>
              <button
                onClick={() => setEditing(true)}
                className="p-1.5 rounded-md text-muted-foreground hover:bg-[#f2f3f6] hover:text-foreground transition-all"
              >
                <Edit3 size={14} />
              </button>
              <button
                onClick={() => onDelete(provider.id)}
                className="p-1.5 rounded-md text-muted-foreground hover:bg-red-50 hover:text-red-500 transition-all"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <div className="relative">
                <input
                  type={show ? 'text' : 'password'}
                  value={keyValue}
                  onChange={(e) => setKeyValue(e.target.value)}
                  placeholder="Paste API Key"
                  className="h-8 px-3 pr-8 text-[11.5px] font-mono w-[180px] bg-[#f2f3f6] rounded-[6px] border-none focus:ring-0 placeholder:text-muted-foreground/40"
                />
                <button
                  type="button"
                  onClick={() => setShow(!show)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground/60 hover:text-foreground"
                >
                  {show ? <EyeOff size={12} /> : <Eye size={12} />}
                </button>
              </div>
              <button
                onClick={handleSave}
                disabled={saving || !keyValue.trim()}
                className="h-8 px-3 bg-primary text-white rounded-[6px] text-[11px] font-bold hover:opacity-90 disabled:opacity-50 transition-all flex items-center gap-2"
              >
                {saving ? <Loader2 size={11} className="animate-spin" /> : 'Save'}
              </button>
              {provider.configured && (
                <button
                  onClick={() => setEditing(false)}
                  className="text-[11px] font-bold text-muted-foreground hover:text-foreground px-2"
                >
                  Cancel
                </button>
              )}
            </div>
          )}
        </div>
      </div>
      {error && <p className="text-[10px] text-red-500 font-bold ml-0.5">{error}</p>}
    </div>
  );
}

export default function ApiConfigSection() {
  const [providers, setProviders] = useState<ProviderInfo[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

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
    const provider = PROVIDERS.find((p) => p.id === providerId);
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

  return (
    <div className="space-y-16">
      {/* Header & Smart Input */}
      <section className="space-y-8">
        <h2 className="text-[16px] font-bold text-foreground">API Configuration</h2>

        <div className="flex flex-col gap-6">
          <div className="flex items-start justify-between gap-8">
            <div className="space-y-1">
              <h3 className="text-sm font-medium text-foreground">Smart Key Input</h3>
              <p className="text-xs text-muted-foreground leading-relaxed max-w-md">
                Paste your API key here, and outlier will automatically detect and configure the
                provider for you.
              </p>
            </div>
            <div className="flex-1 max-w-[400px]">
              <SmartKeyInput onSave={handleSave} />
            </div>
          </div>
        </div>
      </section>

      {/* Provider List Section */}
      <section className="space-y-8">
        <div className="space-y-2 border-b border-border/60 pb-4">
          <h2 className="text-[16px] font-bold text-foreground">Providers</h2>
          <p className="text-xs text-muted-foreground">
            Manage your individual AI and search provider credentials.
          </p>
        </div>

        {loadError && (
          <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-600 font-bold">
            {loadError}
          </div>
        )}

        {!providers ? (
          <div className="flex items-center gap-3 text-xs text-muted-foreground font-bold py-10 justify-center">
            <Loader2 size={14} className="animate-spin text-primary" />
            <span>Loading providers...</span>
          </div>
        ) : (
          <div className="space-y-12">
            {CATEGORY_ORDER.map((category) => {
              const list = grouped[category];
              if (list.length === 0) return null;
              return (
                <div key={category} className="space-y-2">
                  <h3 className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest px-0.5">
                    {CATEGORY_LABEL[category]}
                  </h3>
                  <div className="flex flex-col">
                    {list.map((p) => (
                      <ProviderRow
                        key={p.id}
                        provider={p}
                        onSave={handleSave}
                        onDelete={handleDelete}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
