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
  Feather,
  SquarePen,
  Clock,
  Database,
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
    label: 'Chat',
    href: '/chat',
    icon: <SquarePen size={20} strokeWidth={2.25} />,
  },
  {
    key: 'nav-workspace',
    label: 'Workspace',
    href: '/',
    icon: <Microscope size={20} strokeWidth={2.25} />,
  },
  {
    key: 'nav-jobs',
    label: 'Job Details',
    href: '/job-detail',
    icon: <BookOpenText size={20} strokeWidth={2.25} />,
  },
  {
    key: 'nav-cron',
    label: 'Cron Job',
    href: '/cron-job',
    icon: <Clock size={20} strokeWidth={2.25} />,
  },
  {
    key: 'nav-storages',
    label: 'Storages',
    href: '/storages',
    icon: <Database size={20} strokeWidth={2.25} />,
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
        ${collapsed ? 'w-16' : 'w-[300px]'}
      `}
    >
      {/* Header with Logo and Toggle */}
      <div
        className={`flex items-center justify-between h-16 px-4 border-b border-border gap-3 overflow-hidden`}
      >
        {!collapsed && (
          <span className="font-extrabold text-base tracking-tight text-foreground whitespace-nowrap overflow-hidden italic">
            outlier
          </span>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="
            p-1.5 rounded-md text-foreground
            hover:bg-muted transition-all duration-150
          "
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <PanelRight size={18} strokeWidth={2.25} /> : <PanelLeft size={18} strokeWidth={2.25} />}
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
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
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
                ? 'bg-primary/10 text-primary'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
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

      {/* Active job indicator */}
      {!collapsed && (
        <div className="px-3 pb-3">
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary/30 border border-secondary">
            <Feather size={14} strokeWidth={2.25} className="text-primary shrink-0 status-pulse" />
            <span className="text-xs font-semibold text-primary truncate">1 job active</span>
          </div>
        </div>
      )}
    </aside>
  );
}
