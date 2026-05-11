'use client';

import React from 'react';
import { Key, Sliders, Download, Trash2, Link2 } from 'lucide-react';

export const SETTINGS_TABS = [
  {
    key: 'general',
    label: 'General',
  },
  {
    key: 'account',
    label: 'Account',
  },
  {
    key: 'api',
    label: 'API Configuration',
  },
  {
    key: 'integrations',
    label: 'Integrations',
  },
  {
    key: 'research',
    label: 'Research Preferences',
  },
  {
    key: 'export',
    label: 'Export & Storage',
  },
  {
    key: 'privacy',
    label: 'Privacy',
  },
  {
    key: 'danger',
    label: 'Danger Zone',
  },
] as const;

export type SettingsTabKey = typeof SETTINGS_TABS[number]['key'];

interface SettingsNavProps {
  activeTab: SettingsTabKey;
  onTabChange: (key: SettingsTabKey) => void;
}

export default function SettingsNav({ activeTab, onTabChange }: SettingsNavProps) {
  return (
    <nav className="flex flex-col gap-0.5 p-1">
      {SETTINGS_TABS.map((item) => (
        <button
          key={item.key}
          onClick={() => onTabChange(item.key)}
          className={`
            flex items-center px-3 py-[9px] rounded-[6px] text-[13px] font-semibold
            transition-all duration-150 group relative
            active:scale-[0.98]
            ${activeTab === item.key 
              ? 'bg-[#f2f3f6] text-foreground' 
              : 'text-muted-foreground hover:bg-[#f9f9f9]/60 hover:text-foreground'}
          `}
        >
          <span className="truncate">{item.label}</span>
        </button>
      ))}
    </nav>
  );
}
