'use client';

import React, { useState } from 'react';
import { Camera, Download, CheckSquare, Square, Copy, Check } from 'lucide-react';

interface BRollItem {
  id: string;
  segmentTitle: string;
  segmentOrder: number;
  cue: string;
  checked: boolean;
}

interface Props {
  items: BRollItem[];
}

export default function BRollPanel({ items }: Props) {
  const [checkedIds, setCheckedIds] = useState<Set<string>>(new Set());
  const [copied, setCopied] = useState(false);

  function toggleItem(id: string) {
    setCheckedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAll() {
    if (checkedIds.size === items.length) {
      setCheckedIds(new Set());
    } else {
      setCheckedIds(new Set(items.map((i) => i.id)));
    }
  }

  function handleCopy() {
    const text = items.map((item, i) => `${i + 1}. [${item.segmentTitle}] ${item.cue}`).join('\n');
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  function handleExport() {
    const lines = [
      'B-ROLL SHOT LIST',
      '================',
      '',
      ...items.map((item, i) => {
        const check = checkedIds.has(item.id) ? '[x]' : '[ ]';
        return `${check} ${i + 1}. [Seg ${item.segmentOrder}: ${item.segmentTitle}]\n     ${item.cue}`;
      }),
    ];
    const blob = new Blob([lines.join('\n')], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'broll-shot-list.txt';
    a.click();
    URL.revokeObjectURL(url);
  }

  const checkedCount = checkedIds.size;
  const totalCount = items.length;

  // Group by segment
  const grouped = items.reduce<Record<string, BRollItem[]>>((acc, item) => {
    const key = `${item.segmentOrder}:${item.segmentTitle}`;
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {});

  return (
    <div className="px-4 py-5 space-y-4">
      {/* Header */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Camera size={15} className="text-primary" />
            <h3 className="text-sm font-bold text-foreground">B-Roll Shot List</h3>
          </div>
          <span className="font-mono text-xs text-muted-foreground tabular-nums">
            {checkedCount}/{totalCount} shot{totalCount !== 1 ? 's' : ''}
          </span>
        </div>

        {/* Progress */}
        <div className="h-1.5 w-full rounded-full bg-border overflow-hidden">
          <div
            className="h-full rounded-full bg-primary transition-all duration-500"
            style={{ width: `${totalCount > 0 ? (checkedCount / totalCount) * 100 : 0}%` }}
          />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={toggleAll}
            className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
          >
            {checkedIds.size === items.length ? (
              <CheckSquare size={13} className="text-primary" />
            ) : (
              <Square size={13} />
            )}
            {checkedIds.size === items.length ? 'Uncheck all' : 'Check all'}
          </button>
          <div className="flex-1" />
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
          >
            {copied ? <Check size={13} className="text-primary" /> : <Copy size={13} />}
            {copied ? 'Copied!' : 'Copy'}
          </button>
          <button
            onClick={handleExport}
            className="flex items-center gap-1.5 text-xs font-semibold text-primary hover:opacity-80 transition-opacity"
          >
            <Download size={13} />
            Export
          </button>
        </div>
      </div>

      {/* Shot List */}
      <div className="space-y-4">
        {Object.entries(grouped).map(([key, groupItems]) => {
          const [, segTitle] = key.split(':');
          const segOrder = groupItems[0].segmentOrder;
          return (
            <div key={key} className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-2xs font-bold flex items-center justify-center shrink-0">
                  {segOrder}
                </span>
                <span className="text-xs font-bold text-foreground line-clamp-1">{segTitle}</span>
              </div>
              <div className="space-y-1.5 pl-7">
                {groupItems.map((item, idx) => (
                  <button
                    key={item.id}
                    onClick={() => toggleItem(item.id)}
                    className={`
                      w-full flex items-start gap-2.5 p-2.5 rounded-lg text-left
                      border transition-all duration-150
                      ${
                        checkedIds.has(item.id)
                          ? 'bg-primary/5 border-primary/20'
                          : 'bg-muted/40 border-border hover:border-primary/30 hover:bg-muted/60'
                      }
                    `}
                  >
                    <div className="shrink-0 mt-0.5">
                      {checkedIds.has(item.id) ? (
                        <CheckSquare size={14} className="text-primary" />
                      ) : (
                        <Square size={14} className="text-muted-foreground" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <span className="font-mono text-2xs text-muted-foreground mr-1.5">
                        #{idx + 1}
                      </span>
                      <span
                        className={`text-xs font-medium leading-relaxed ${checkedIds.has(item.id) ? 'line-through text-muted-foreground' : 'text-foreground'}`}
                      >
                        {item.cue}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
