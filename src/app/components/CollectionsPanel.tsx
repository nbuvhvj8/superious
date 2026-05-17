'use client';

import React, { useState } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { ArrowDown01Icon, ArrowRight01Icon, Cancel01Icon, Edit01Icon, FolderIcon, FolderOpenIcon, FolderAddIcon, Tick01Icon } from '@hugeicons/core-free-icons';

interface Collection {
  id: string;
  name: string;
  color: string;
  jobIds: string[];
}

const COLLECTION_COLORS = [
  '#635BFF',
  '#8B5CF6',
  '#FF5996',
  '#0EA5E9',
  '#F59E0B',
  '#10B981',
  '#EF4444',
];

const DEFAULT_COLLECTIONS: Collection[] = [
  { id: 'col-1', name: 'Finance Series', color: '#635BFF', jobIds: ['job-5e41df', 'job-2d87bc'] },
  {
    id: 'col-2',
    name: 'Science & Tech',
    color: '#0EA5E9',
    jobIds: ['job-1c93be', 'job-8d72ac', 'job-6e13fa'],
  },
  { id: 'col-3', name: 'Client Work', color: '#F59E0B', jobIds: ['job-7f64aa'] },
];

interface Props {
  selectedCollection: string | null;
  onSelectCollection: (id: string | null) => void;
}

export default function CollectionsPanel({ selectedCollection, onSelectCollection }: Props) {
  const [collections, setCollections] = useState<Collection[]>(DEFAULT_COLLECTIONS);
  const [expanded, setExpanded] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const [newColor, setNewColor] = useState(COLLECTION_COLORS[0]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  function handleCreate() {
    if (!newName.trim()) return;
    const col: Collection = {
      id: `col-${Date.now()}`,
      name: newName.trim(),
      color: newColor,
      jobIds: [],
    };
    setCollections((prev) => [...prev, col]);
    setNewName('');
    setNewColor(COLLECTION_COLORS[0]);
    setCreating(false);
  }

  function handleDelete(id: string) {
    setCollections((prev) => prev.filter((c) => c.id !== id));
    if (selectedCollection === id) onSelectCollection(null);
  }

  function handleStartEdit(col: Collection) {
    setEditingId(col.id);
    setEditName(col.name);
  }

  function handleSaveEdit(id: string) {
    if (!editName.trim()) return;
    setCollections((prev) => prev.map((c) => (c.id === id ? { ...c, name: editName.trim() } : c)));
    setEditingId(null);
  }

  return (
    <div className="card overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-4 py-2 hover:bg-muted/40 transition-colors"
      >
        <div className="flex items-center gap-2.5">
          <HugeiconsIcon icon={FolderOpenIcon} size={16} strokeWidth={2.25} className="text-primary" />
          <span className="text-sm font-bold text-foreground">Collections</span>
          <span className="bg-muted px-1.5 py-0.5 rounded text-2xs font-bold text-muted-foreground">
            {collections.length}
          </span>
        </div>
        {expanded ? (
          <HugeiconsIcon icon={ArrowDown01Icon} size={14} strokeWidth={2.25} className="text-foreground" />
        ) : (
          <HugeiconsIcon icon={ArrowRight01Icon} size={14} strokeWidth={2.25} className="text-foreground" />
        )}
      </button>

      {expanded && (
        <div className="border-t border-border">
          {/* All Jobs option */}
          <button
            onClick={() => onSelectCollection(null)}
            className={`
              w-full flex items-center gap-2.5 px-4 py-2.5 text-left transition-colors
              ${selectedCollection === null ? 'bg-primary/5 text-primary' : 'text-muted-foreground hover:bg-muted/40 hover:text-foreground'}
            `}
          >
            <HugeiconsIcon icon={FolderIcon} size={13} className={selectedCollection === null ? 'text-primary' : ''} />
            <span className="text-xs font-semibold">All Jobs</span>
          </button>

          {/* Collections */}
          {collections.map((col) => (
            <div key={col.id} className="group relative">
              {editingId === col.id ? (
                <div className="flex items-center gap-2 px-4 py-2">
                  <div
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: col.color }}
                  />
                  <input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSaveEdit(col.id);
                      if (e.key === 'Escape') setEditingId(null);
                    }}
                    className="flex-1 text-xs font-semibold bg-transparent border-b border-primary focus:outline-none text-foreground"
                    autoFocus
                  />
                  <button
                    onClick={() => handleSaveEdit(col.id)}
                    className="text-primary hover:opacity-80"
                  >
                    <HugeiconsIcon icon={Tick01Icon} size={12} />
                  </button>
                  <button
                    onClick={() => setEditingId(null)}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <HugeiconsIcon icon={Cancel01Icon} size={12} />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => onSelectCollection(selectedCollection === col.id ? null : col.id)}
                  className={`
                    w-full flex items-center gap-2.5 px-4 py-2.5 text-left transition-colors
                    ${selectedCollection === col.id ? 'bg-primary/5' : 'hover:bg-muted/40'}
                  `}
                >
                  <div
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: col.color }}
                  />
                  <span
                    className={`text-xs font-semibold flex-1 truncate ${selectedCollection === col.id ? 'text-primary' : 'text-foreground'}`}
                  >
                    {col.name}
                  </span>
                  <span className="font-mono text-2xs text-muted-foreground tabular-nums">
                    {col.jobIds.length}
                  </span>
                </button>
              )}
              {/* Edit/Delete actions */}
              {editingId !== col.id && (
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStartEdit(col);
                    }}
                    className="w-5 h-5 rounded flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                  >
                    <HugeiconsIcon icon={Edit01Icon} size={10} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(col.id);
                    }}
                    className="w-5 h-5 rounded flex items-center justify-center text-muted-foreground hover:text-red-500 hover:bg-red-50 transition-colors"
                  >
                    <HugeiconsIcon icon={Cancel01Icon} size={10} />
                  </button>
                </div>
              )}
            </div>
          ))}

          {/* Create new */}
          {creating ? (
            <div className="px-4 py-3 border-t border-border space-y-2.5">
              <input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleCreate();
                  if (e.key === 'Escape') setCreating(false);
                }}
                placeholder="Collection name…"
                className="input-field text-xs py-1.5"
                autoFocus
              />
              <div className="flex items-center gap-1.5">
                {COLLECTION_COLORS.map((c) => (
                  <button
                    key={c}
                    onClick={() => setNewColor(c)}
                    className={`w-5 h-5 rounded-full transition-transform ${newColor === c ? 'scale-125 ring-2 ring-offset-1 ring-foreground/30' : 'hover:scale-110'}`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setCreating(false)}
                  className="btn-ghost text-xs py-1 px-2 flex-1"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreate}
                  disabled={!newName.trim()}
                  className="btn-primary text-xs py-1 px-2 flex-1"
                >
                  Create
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setCreating(true)}
              className="w-full flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-muted-foreground hover:text-primary hover:bg-muted/40 transition-colors border-t border-border"
            >
              <HugeiconsIcon icon={FolderAddIcon} size={13} />
              New Collection
            </button>
          )}
        </div>
      )}
    </div>
  );
}
