'use client';

import React from 'react';
import { Key, Sliders, Download, Trash2, Link2 } from 'lucide-react';

const NAV_ITEMS = [
  { key: 'nav-api', label: 'API Configuration', href: '#api-config', icon: <Key size={15} strokeWidth={2.25} /> },
  {
    key: 'nav-integrations',
    label: 'Integrations',
    href: '#integrations',
    icon: <Link2 size={15} strokeWidth={2.25} />,
  },
  {
    key: 'nav-research',
    label: 'Research Preferences',
    href: '#research-prefs',
    icon: <Sliders size={15} strokeWidth={2.25} />,
  },
  {
    key: 'nav-export',
    label: 'Export & Storage',
    href: '#export-storage',
    icon: <Download size={15} strokeWidth={2.25} />,
  },
  { key: 'nav-danger', label: 'Danger Zone', href: '#danger-zone', icon: <Trash2 size={15} strokeWidth={2.25} /> },
];

export default function SettingsNav() {
  return (
    <nav className="space-y-1">
      {NAV_ITEMS?.map((item) => (
        <a
          key={item?.key}
          href={item?.href}
          className="
            flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-bold
            text-foreground hover:bg-muted hover:text-primary
            transition-all duration-150
          "
        >
          {item?.icon}
          {item?.label}
        </a>
      ))}
    </nav>
  );
}
