

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

  const maskedKey = useMemo(() => {
    if (!provider.preview) return '';
    const start = provider.preview.slice(0, 3);
    return `${start}${'*'.repeat(20)}`;
  }, [provider.preview]);

  return (
    <div className="flex items-center justify-between py-4 border-b border-border/40 last:border-0 group relative">
      {/* Left: Name */}
      <div className="w-[180px] shrink-0">
        <h3 className="text-sm font-bold text-foreground">{provider.name}</h3>
      </div>

      {/* Center: Key */}
      <div className="flex-1 flex justify-center">
        {editing ? (
          <div className="flex items-center gap-2 w-full max-w-[300px]">
            <div className="relative flex-1">
              <input
                type={show ? 'text' : 'password'}
                value={keyValue}
                onChange={(e) => setKeyValue(e.target.value)}
                placeholder={provider.keyPlaceholder}
                autoComplete="off"
                spellCheck={false}
                className="input-field pr-10 font-mono text-xs h-9"
              />
              <button
                type="button"
                onClick={() => setShow((s) => !s)}
                aria-label={show ? 'Hide API key' : 'Show API key'}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-none focus:ring-2 focus:ring-primary rounded-sm"
              >
                {show ? <EyeOff size={13} /> : <Eye size={13} />}
              </button>
            </div>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving || !keyValue.trim()}
              className="btn-primary text-[11px] h-8 px-3"
            >
              {saving ? <Loader2 size={12} className="animate-spin" /> : 'Save'}
            </button>
            {provider.configured && (
              <button
                type="button"
                onClick={() => setEditing(false)}
                className="btn-ghost text-[11px] h-8 px-2"
              >
                Cancel
              </button>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-4">
            <span className="text-xs font-mono text-muted-foreground/60 tracking-wider">
              {maskedKey}
            </span>
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity">
              <button
                onClick={() => setEditing(true)}
                aria-label="Edit API key"
                className="p-1 rounded hover:bg-muted text-muted-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <Edit3 size={13} />
              </button>
              <button
                onClick={async () => {
                  try {
                    setError(null);
                    await onDelete(provider.id);
                  } catch (err: unknown) {
                    setError(err instanceof Error ? err.message : 'Delete failed');
                  }
                }}
                aria-label="Delete API key"
                className="p-1 rounded hover:bg-red-50 hover:text-red-500 text-muted-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <Trash2 size={13} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Right: Models */}
      <div className="w-[180px] shrink-0 flex justify-end">
        {provider.category === 'llm' && providerModels.length > 0 && (
          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-muted/50 hover:bg-muted text-[11px] font-bold text-foreground transition-all"
            >
              {selectedModels.length > 0 ? `${selectedModels.length} Models` : 'Select Models'}
              <ChevronDown
                size={12}
                className={`transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}
              />
            </button>

            {isDropdownOpen && (
              <>
                <div className="fixed inset-0 z-20" onClick={() => setIsDropdownOpen(false)} />
                <div className="absolute top-full right-0 mt-1 w-56 bg-white border border-border rounded-lg shadow-xl z-30 py-1 max-h-48 overflow-y-auto scrollbar-thin">
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
      </div>
      {error && (
        <p className="text-[10px] text-red-500 font-bold absolute -bottom-1 left-1/2 -translate-x-1/2">
          {error}
        </p>
      )}
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

  const configuredProviders = useMemo(() => {
    if (!providers) return [];
    return CATEGORY_ORDER.flatMap((cat) =>
      providers.filter((p) => p.category === cat && p.configured)
    );
  }, [providers]);

  return (
    <div className="space-y-16">
      <section className="space-y-8">
        <h2 className="text-[16px] font-bold text-foreground">API Configuration</h2>

        <div className="flex flex-col gap-6">
          <div className="flex items-start justify-between gap-8">
            <div className="space-y-1">
              <h3 className="text-sm font-medium text-foreground">Smart Key Input</h3>
            </div>
            <div className="flex-1 max-w-[400px]">
              <SmartKeyInput onSave={handleSave} />
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-8">
        <div className="space-y-2 border-b border-border/60 pb-4">
          <h2 className="text-[16px] font-bold text-foreground">Providers</h2>
          <p className="text-xs text-muted-foreground">
            Manage your individual AI and search (Tavily, Serper, Brave, Exa) provider credentials.
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
          configuredProviders.length > 0 && (
            <div className="space-y-2">
              <div className="flex flex-col">
                {configuredProviders.map((p) => (
                  <ProviderRow
                    key={p.id}
                    provider={p}
                    onSave={handleSave}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            </div>
          )
        )}
      </section>
    </div>
  );
}
