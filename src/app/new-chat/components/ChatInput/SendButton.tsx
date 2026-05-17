'use client';

import React from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { ArrowUp01Icon, SquareIcon } from '@hugeicons/core-free-icons';

interface SendButtonProps {
  state: 'empty' | 'ready' | 'stop';
  onClick: () => void;
}

export default function SendButton({ state, onClick }: SendButtonProps) {
  const getStyles = () => {
    switch (state) {
      case 'stop':
        return 'bg-foreground text-background cursor-pointer';
      case 'ready':
        return 'bg-green-600 text-white cursor-pointer';
      case 'empty':
      default:
        return 'bg-muted text-muted-foreground/60 cursor-default';
    }
  };

  return (
    <button
      onClick={state !== 'empty' ? onClick : undefined}
      disabled={state === 'empty'}
      className={`
        w-[34px] h-[34px] rounded-full flex items-center justify-center
        transition-none shrink-0
        ${getStyles()}
      `}
      aria-label={state === 'stop' ? 'Stop generation' : 'Send message'}
    >
      {state === 'stop' ? (
        <HugeiconsIcon icon={SquareIcon} size={16} fill="currentColor" strokeWidth={0} />
      ) : (
        <HugeiconsIcon icon={ArrowUp01Icon} size={16} strokeWidth={2.5} />
      )}
    </button>
  );
}
