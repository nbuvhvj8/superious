'use client';

import React from 'react';
import { Zap, Microscope, Landmark, Atom } from 'lucide-react';

const SUGGESTIONS = [
  {
    category: 'Energy',
    label: 'Energy',
    icon: <Zap size={13} className="text-[#8A9A6B]" />,
    topic: 'The history of solar power adoption in residential areas.',
  },
  {
    category: 'Science',
    label: 'Science',
    icon: <Microscope size={13} className="text-[#8A9A6B]" />,
    topic: 'How CRISPR technology is revolutionizing modern medicine.',
  },
  {
    category: 'Business',
    label: 'Business',
    icon: <Landmark size={13} className="text-[#8A9A6B]" />,
    topic: 'The rise and fall of industrial manufacturing in the 20th century.',
  },
  {
    category: 'Physics',
    label: 'Physics',
    icon: <Atom size={13} className="text-[#8A9A6B]" />,
    topic: 'Nuclear fusion and the future of sustainable energy production.',
  },
];

interface SuggestionGridProps {
  onSelect: (topic: string) => void;
}

export default function SuggestionGrid({ onSelect }: SuggestionGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-[500px] mx-auto mt-2">
      {SUGGESTIONS.map((s, i) => (
        <button
          key={i}
          onClick={() => onSelect(s.topic)}
          className="
            flex flex-col items-start text-left p-3.5 rounded-[10px]
            bg-card border border-border/60 shadow-sm
            hover:border-[#C5D0A8] hover:bg-[#FDFCF8]
            transition-all duration-150 group
          "
        >
          <div className="flex items-center gap-1.5 mb-1">
            {s.icon}
            <span className="text-[12px] font-semibold text-[#6B7A52]">{s.label}</span>
          </div>
          <p className="text-[12.5px] text-muted-foreground/80 leading-relaxed group-hover:text-foreground/90 transition-colors">
            {s.topic}
          </p>
        </button>
      ))}
    </div>
  );
}
