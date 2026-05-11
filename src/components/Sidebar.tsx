'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Microscope,
  BookOpenText,
  Settings,
  PanelLeft,
  PanelRight,
  SquarePen,
  Clock,
  HardDrive,
  Video,
  Box,
  Activity,
} from 'lucide-react';

interface NavItem {
  key: string;
  label: string;
  href: string;
  icon: React.ReactNode;
  badge?: number;
}

const NAV_ITEMS: NavItem[] = [
  {
    key: 'nav-chat',
    label: 'New Chat',
    href: '/new-chat',
    icon: <SquarePen size={16} strokeWidth={2.25} />,
  },
  {
    key: 'nav-workspace',
    label: 'Workspace',
    href: '/workspace',
    icon: <Microscope size={16} strokeWidth={2.25} />,
  },
  {
    key: 'nav-studio',
    label: 'Studio',
    href: '/motion-design',
    icon: <Video size={16} strokeWidth={2.25} />,
  },
  {
    key: 'nav-artifact',
    label: 'Artifact',
    href: '/artifact',
    icon: <Box size={16} strokeWidth={2.25} />,
  },
  {
    key: 'nav-session',
    label: 'Session',
    href: '/session',
    icon: <Activity size={16} strokeWidth={2.25} />,
  },
  {
    key: 'nav-jobs',
    label: 'Job Details',
    href: '/job-detail',
    icon: <BookOpenText size={16} strokeWidth={2.25} />,
  },
  {
    key: 'nav-cron',
    label: 'Cron Job',
    href: '/cron-job',
    icon: <Clock size={16} strokeWidth={2.25} />,
  },
  {
    key: 'nav-storages',
    label: 'Storages',
    href: '/storages',
    icon: <HardDrive size={16} strokeWidth={2.25} />,
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={`
        relative flex flex-col h-full border-r border-border bg-background
        transition-all duration-300 ease-in-out shrink-0
        ${collapsed ? 'w-14' : 'w-[280px]'}
      `}
    >
      {/* Header with Logo and Toggle */}
      <div className={`flex items-center justify-between h-16 px-4 gap-3 overflow-hidden`}>
        {!collapsed && <div className="flex-1" />}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="
            p-1.5 rounded-md text-foreground
            hover:bg-muted transition-all duration-150
          "
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? (
            <PanelRight size={18} strokeWidth={2.25} />
          ) : (
            <PanelLeft size={18} strokeWidth={2.25} />
          )}
        </button>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 py-4 px-2 space-y-1 overflow-hidden">
        {NAV_ITEMS.map((item) => {
          const isActive =
            pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.key}
              href={item.href}
              title={collapsed ? item.label : undefined}
              className={`
                flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold
                transition-all duration-150 group relative
                ${
                  isActive
                    ? 'bg-muted text-foreground'
                    : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground'
                }
                ${collapsed ? 'justify-center' : ''}
              `}
            >
              <span className="shrink-0">{item.icon}</span>
              {!collapsed && <span className="truncate">{item.label}</span>}
              {item.badge && item.badge > 0 && (
                <span
                  className={`
                  ml-auto bg-primary text-primary-foreground text-2xs font-bold
                  rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1
                  ${collapsed ? 'absolute top-1 right-1' : ''}
                `}
                >
                  {item.badge}
                </span>
              )}
              {/* Tooltip for collapsed */}
              {collapsed && (
                <span
                  className="
                  absolute left-full ml-3 px-2 py-1 rounded-md bg-foreground text-background
                  text-xs font-medium whitespace-nowrap opacity-0 pointer-events-none
                  group-hover:opacity-100 transition-opacity duration-150 z-50
                "
                >
                  {item.label}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer Items */}
      <div className="mt-auto border-t border-border p-2 space-y-1">
        <Link
          href="/settings"
          title={collapsed ? 'Settings' : undefined}
          className={`
            flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold
            transition-all duration-150 group relative
            ${
              pathname === '/settings'
                ? 'bg-muted text-foreground'
                : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground'
            }
            ${collapsed ? 'justify-center' : ''}
          `}
        >
          <Settings size={20} strokeWidth={2.25} className="shrink-0" />
          {!collapsed && <span>Settings</span>}
          {collapsed && (
            <span
              className="
              absolute left-full ml-3 px-2 py-1 rounded-md bg-foreground text-background
              text-xs font-medium whitespace-nowrap opacity-0 pointer-events-none
              group-hover:opacity-100 transition-opacity duration-150 z-50
            "
            >
              Settings
            </span>
          )}
        </Link>
      </div>
    </aside>
  );
}
