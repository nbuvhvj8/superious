'use client';

import React from 'react';
import { Key, Sliders, Download, Trash2, Link2 } from 'lucide-react';

export const SETTINGS_TABS = [
  {
    key: 'api',
    label: 'API Configuration',
    icon: <Key size={15} strokeWidth={2.25} />,
  },
  {
    key: 'integrations',
    label: 'Integrations',
    icon: <Link2 size={15} strokeWidth={2.25} />,
  },
  {
    key: 'research',
    label: 'Research Preferences',
    icon: <Sliders size={15} strokeWidth={2.25} />,
  },
  {
    key: 'export',
    label: 'Export & Storage',
    icon: <Download size={15} strokeWidth={2.25} />,
  },
  {
    key: 'danger',
    label: 'Danger Zone',
    icon: <Trash2 size={15} strokeWidth={2.25} />,
  },
] as const;

export type SettingsTabKey = typeof SETTINGS_TABS[number]['key'];

interface SettingsNavProps {
  activeTab: SettingsTabKey;
  onTabChange: (key: SettingsTabKey) => void;
}

export default function SettingsNav({ activeTab, onTabChange }: SettingsNavProps) {
  return (
    <nav className="space-y-1">
      {SETTINGS_TABS.map((item) => (
        <button
          key={item.key}
          onClick={() => onTabChange(item.key)}
          className={`
            w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-bold
            transition-all duration-150
            ${activeTab === item.key 
              ? 'bg-muted text-foreground border border-border/50 shadow-sm' 
              : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground border border-transparent'}
          `}
        >
          {item.icon}
          {item.label}
        </button>
      ))}
    </nav>
  );
}
