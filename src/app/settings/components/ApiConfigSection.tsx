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
} from 'lucide-react';

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

  useEffect(() => {
    setEditing(!provider.configured);
  }, [provider.configured]);

  const patternMatches = useMemo(() => {
    if (!provider.keyPattern || !keyValue) return true;
    try {
      return new RegExp(provider.keyPattern).test(keyValue.trim());
    } catch {
      return true;
    }
  }, [provider.keyPattern, keyValue]);

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
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to delete key');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="rounded-xl border border-border bg-white p-4 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-sm font-bold text-foreground">{provider.name}</h3>
            {provider.configured && (
              <span className="status-badge bg-primary/10 text-primary">
                <CheckCircle2 size={11} /> Connected
              </span>
            )}
            <a
              href={provider.docsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
            >
              Get key <ExternalLink size={10} />
            </a>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">{provider.description}</p>
          {provider.configured && !editing && (
            <p className="text-[11px] text-muted-foreground mt-1.5 font-mono">
              {provider.preview} · updated {formatRelative(provider.updatedAt)}
            </p>
          )}
        </div>
      </div>

      {editing ? (
        <div className="space-y-2">
          <div className="relative">
            <input
              type={show ? 'text' : 'password'}
              value={keyValue}
              onChange={(e) => setKeyValue(e.target.value)}
              placeholder={provider.keyPlaceholder}
              autoComplete="off"
              spellCheck={false}
              className="input-field pr-10 font-mono text-sm"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  void handleSave();
                }
              }}
            />
            <button
              type="button"
              onClick={() => setShow((s) => !s)}
              aria-label={show ? 'Hide key' : 'Show key'}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {show ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          </div>
          {provider.keyPattern && keyValue && !patternMatches && (
            <p className="text-[11px] text-amber-600">
              Heads up — keys for {provider.name} usually start with{' '}
              <code className="font-mono">{provider.keyPlaceholder}</code>.
            </p>
          )}
          {error && <p className="text-[11px] text-red-500 font-medium">{error}</p>}

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSave}
              disabled={saving || !keyValue.trim()}
              className="btn-primary text-xs h-8 px-3"
            >
              {saving ? (
                <>
                  <Loader2 size={12} className="animate-spin" /> Saving…
                </>
              ) : saved ? (
                <>
                  <CheckCircle2 size={12} /> Saved
                </>
              ) : (
                <>
                  <ShieldCheck size={12} /> Encrypt &amp; save
                </>
              )}
            </button>
            {provider.configured && (
              <button
                type="button"
                onClick={() => {
                  setEditing(false);
                  setKeyValue('');
                  setError(null);
                }}
                className="btn-ghost text-xs h-8 px-3"
              >
                Cancel
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="btn-secondary text-xs h-8 px-3"
          >
            Replace key
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={saving}
            className="btn-ghost text-xs h-8 px-3 text-red-500 hover:bg-red-50 hover:text-red-600"
          >
            <Trash2 size={12} /> Remove
          </button>
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
    <section id="api-config" className="card p-6 space-y-5">
      <div className="flex items-center gap-2.5 pb-1 border-b border-border">
        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
          <Key size={15} className="text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-base font-bold text-foreground">API Configuration</h2>
          <p className="text-xs text-muted-foreground">
            Bring your own keys for any provider. All keys are encrypted at rest using AES-256-GCM
            and never sent back to the browser in plaintext.
          </p>
        </div>
        {providers && (
          <span className="status-badge bg-secondary/40 text-foreground hidden sm:inline-flex">
            <Plus size={11} /> {totalConfigured} connected
          </span>
        )}
      </div>

      {loadError && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-xs text-red-600">
          {loadError}
        </div>
      )}

      {!providers ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
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
                  <span className="text-[11px] text-muted-foreground font-medium">
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
    </section>
  );
}
