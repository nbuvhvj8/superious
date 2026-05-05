'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Check, X, Edit3, RotateCcw } from 'lucide-react';

interface Props {
  value: string;
  onSave: (newValue: string) => void;
  className?: string;
  placeholder?: string;
  label?: string;
}

export default function ScriptEditor({
  value,
  onSave,
  className = '',
  placeholder = '',
  label,
}: Props) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const [saved, setSaved] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (editing && textareaRef.current) {
      textareaRef.current.focus();
      // Auto-resize
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [editing]);

  function autoResize() {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }

  function handleEdit() {
    setDraft(value);
    setEditing(true);
  }

  function handleSave() {
    onSave(draft);
    setEditing(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function handleCancel() {
    setDraft(value);
    setEditing(false);
  }

  function handleReset() {
    setDraft(value);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }

  if (!editing) {
    return (
      <div className="group relative">
        <p className={`${className} leading-relaxed text-foreground`}>{value || placeholder}</p>
        <button
          onClick={handleEdit}
          className="
            absolute -top-1 -right-1 opacity-0 group-hover:opacity-100
            w-6 h-6 rounded-md bg-primary/10 border border-primary/20
            flex items-center justify-center text-primary
            hover:bg-primary hover:text-primary-foreground
            transition-all duration-150
          "
          title="Edit this section"
        >
          <Edit3 size={11} />
        </button>
        {saved && (
          <span className="absolute -top-1 -right-1 flex items-center gap-1 text-2xs font-semibold text-primary animate-fade-in">
            <Check size={11} /> Saved
          </span>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {label && (
        <span className="text-2xs font-bold text-primary uppercase tracking-wider">
          Editing: {label}
        </span>
      )}
      <div className="relative rounded-xl border-2 border-primary/40 bg-primary/5 overflow-hidden">
        <textarea
          ref={textareaRef}
          value={draft}
          onChange={(e) => {
            setDraft(e.target.value);
            autoResize();
          }}
          className="
            w-full px-4 py-3 bg-transparent text-sm leading-relaxed text-foreground
            resize-none focus:outline-none font-medium min-h-[80px]
          "
          placeholder={placeholder}
        />
        <div className="flex items-center gap-1.5 px-3 py-2 border-t border-primary/20 bg-primary/5">
          <span className="text-2xs text-muted-foreground font-mono tabular-nums mr-auto">
            {draft.length} chars
          </span>
          <button
            onClick={handleReset}
            className="flex items-center gap-1 text-2xs text-muted-foreground hover:text-foreground px-2 py-1 rounded-md hover:bg-muted transition-colors"
            title="Reset to original"
          >
            <RotateCcw size={11} />
            Reset
          </button>
          <button
            onClick={handleCancel}
            className="flex items-center gap-1 text-2xs text-muted-foreground hover:text-foreground px-2 py-1 rounded-md hover:bg-muted transition-colors"
          >
            <X size={11} />
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-1 text-2xs font-semibold text-primary-foreground bg-primary px-2.5 py-1 rounded-md hover:opacity-90 transition-opacity"
          >
            <Check size={11} />
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
