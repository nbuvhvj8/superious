'use client';

import React from 'react';
import { Zap, Microscope, Landmark, Atom } from 'lucide-react';

const SUGGESTIONS = [
  {
    category: 'Energy',
    label: 'Energy',
    icon: <Zap size={13} />,
    topic: 'The history of solar power adoption in residential areas.',
  },
  {
    category: 'Science',
    label: 'Science',
    icon: <Microscope size={13} />,
    topic: 'How CRISPR technology is revolutionizing modern medicine.',
  },
  {
    category: 'Business',
    label: 'Business',
    icon: <Landmark size={13} />,
    topic: 'The rise and fall of industrial manufacturing in the 20th century.',
  },
  {
    category: 'Physics',
    label: 'Physics',
    icon: <Atom size={13} />,
    topic: 'Nuclear fusion and the future of sustainable energy production.',
  },
];

interface SuggestionGridProps {
  onSelect: (topic: string) => void;
}

export default function SuggestionGrid({ onSelect }: SuggestionGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-[500px] mx-auto">
      {SUGGESTIONS.map((s, i) => (
        <button
          key={i}
          onClick={() => onSelect(s.topic)}
          className="
            flex flex-col items-start text-left p-[12px] px-[14px] rounded-[10px]
            bg-white border border-border shadow-sm
            hover:border-[#C5D0A8] hover:bg-[#FDFCF8]
            transition-all duration-150 group
          "
        >
          <span className="flex items-center gap-1.5 mb-0.5">
            <span className="text-[#6B7A52]">{s.icon}</span>
            <span className="text-[12px] font-semibold text-[#6B7A52]">{s.label}</span>
          </span>
          <span className="text-[12.5px] text-muted-foreground leading-[1.5] group-hover:text-foreground/80 transition-colors block">
            {s.topic}
          </span>
        </button>
      ))}
    </div>
  );
}
