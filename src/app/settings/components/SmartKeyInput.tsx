

import React, { useState, useEffect, useCallback } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { AlertCircleIcon, ArrowUpRight01Icon, CheckmarkCircle01Icon, CpuIcon, Loading03Icon, Search01Icon, SecurityCheckIcon } from '@hugeicons/core-free-icons';

interface DetectedProvider {
  id: string;
  name: string;
  category: 'llm' | 'search';
  description: string;
  models: string[];
  docsUrl: string;
}

interface SmartKeyInputProps {
  onSave: (providerId: string, apiKey: string) => Promise<void>;
}

export default function SmartKeyInput({ onSave }: SmartKeyInputProps) {
  const [apiKey, setApiKey] = useState('');
  const [isDetecting, setIsDetecting] = useState(false);
  const [detectedProvider, setDetectedProvider] = useState<DetectedProvider | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const detectProvider = useCallback(async (key: string) => {
    if (!key || key.length < 5) {
      setDetectedProvider(null);
      return;
    }

    setIsDetecting(true);
    setError(null);
    try {
      const res = await fetch('/api/v1/settings/api-keys/detect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey: key }),
      });
      if (res.ok) {
        const data = await res.json();
        setDetectedProvider(data.provider);
      }
    } catch (err) {
      console.error('Detection failed:', err);
    } finally {
      setIsDetecting(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (apiKey) {
        void detectProvider(apiKey);
      } else {
        setDetectedProvider(null);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [apiKey, detectProvider]);

  async function handleSave() {
    if (!detectedProvider || !apiKey) return;

    setIsSaving(true);
    setError(null);
    try {
      await onSave(detectedProvider.id, apiKey);
      setIsSaved(true);
      setApiKey('');
      setDetectedProvider(null);
      setTimeout(() => setIsSaved(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save API key');
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
          <HugeiconsIcon icon={Search01Icon} size={18} />
        </div>
        <input
          type="password"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          placeholder="Paste any AI API key"
          className="input-field pl-10 h-12 text-base font-mono"
          autoComplete="off"
        />
        <div className="absolute inset-y-0 right-3 flex items-center">
          {isDetecting && <HugeiconsIcon icon={Loading03Icon} size={18} className="animate-spin text-primary" />}
          {isSaved && <HugeiconsIcon icon={CheckmarkCircle01Icon} size={18} className="text-primary" />}
        </div>
      </div>

      {detectedProvider && (
        <div className="animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-white border border-border flex items-center justify-center shadow-sm">
                  <HugeiconsIcon icon={CpuIcon} size={20} className="text-primary" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
                    Detected: {detectedProvider.name}
                    <span className="status-badge bg-primary/10 text-primary uppercase text-[9px] tracking-wider">
                      {detectedProvider.category}
                    </span>
                  </h4>
                  <p className="text-xs text-muted-foreground">{detectedProvider.description}</p>
                </div>
              </div>
              <a
                href={detectedProvider.docsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
              >
                Docs <HugeiconsIcon icon={ArrowUpRight01Icon} size={10} />
              </a>
            </div>

            {detectedProvider.models.length > 0 && (
              <div className="space-y-2">
                <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                  Available Models
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {detectedProvider.models.map((model) => (
                    <span
                      key={model}
                      className="px-2 py-0.5 rounded-md bg-white border border-border text-[10px] font-mono text-foreground"
                    >
                      {model}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {error && (
              <div className="flex items-center gap-2 text-red-500 text-xs font-medium">
                <HugeiconsIcon icon={AlertCircleIcon} size={14} />
                {error}
              </div>
            )}

            <button
              onClick={handleSave}
              disabled={isSaving}
              className="btn-primary w-full h-10 text-sm font-bold shadow-lg shadow-primary/20"
            >
              {isSaving ? (
                <>
                  <HugeiconsIcon icon={Loading03Icon} size={16} className="animate-spin" /> Saving...
                </>
              ) : (
                <>
                  <HugeiconsIcon icon={SecurityCheckIcon} size={16} /> Encrypt & Save {detectedProvider.name} Key
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {!detectedProvider && apiKey.length > 10 && !isDetecting && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-muted border border-border text-[11px] text-muted-foreground animate-in fade-in">
          <HugeiconsIcon icon={AlertCircleIcon} size={14} className="shrink-0" />
          Key pattern not recognized. Please ensure it&apos;s a valid key from a supported provider.
        </div>
      )}
    </div>
  );
}
