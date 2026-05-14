'use client';

import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full' | 'notification' | 'notification-lg';
}

const SIZE_MAP = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-2xl',
  full: 'max-w-5xl',
  notification: 'max-w-[700px]',
  'notification-lg': 'max-w-[800px]',
};

export default function Modal({ open, onClose, title, children, size = 'md' }: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-foreground/40 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div
        className={`
          relative w-full ${SIZE_MAP[size]} ${(size === 'notification' || size === 'notification-lg') ? 'bg-background' : 'bg-card'} rounded-2xl border border-border
          shadow-2xl animate-slide-up overflow-hidden
        `}
      >
        {title && (
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <h3 className="text-base font-bold text-foreground">{title}</h3>
            <button onClick={onClose} className="btn-ghost p-1.5" aria-label="Close modal">
              <X size={16} strokeWidth={2.25} />
            </button>
          </div>
        )}
        {!title && (
          <button
            onClick={onClose}
            className="absolute top-3 right-3 z-10 btn-ghost p-1.5 bg-card/80 backdrop-blur-sm"
            aria-label="Close modal"
          >
            <X size={16} />
          </button>
        )}
        <div>{children}</div>
      </div>
    </div>
  );
}
