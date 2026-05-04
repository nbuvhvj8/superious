'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import AppLogo from '@/components/ui/AppLogo';
import {
  FlaskConical,
  FileVideo,
  Settings,
  ChevronLeft,
  ChevronRight,
  Zap,
  Sparkles,
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
    key: 'nav-workspace',
    label: 'Research Workspace',
    href: '/',
    icon: <FlaskConical size={20} />,
  },
  {
    key: 'nav-jobs',
    label: 'Job Detail',
    href: '/job-detail',
    icon: <FileVideo size={20} />,
  },
  {
    key: 'nav-settings',
    label: 'Settings',
    href: '/settings',
    icon: <Settings size={20} />,
  },
  {
    key: 'nav-onboarding',
    label: 'Onboarding',
    href: '/onboarding',
    icon: <Sparkles size={20} />,
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={`
        relative flex flex-col h-full border-r border-border bg-card
        transition-all duration-300 ease-in-out shrink-0
        ${collapsed ? 'w-16' : 'w-60'}
      `}
    >
      {/* Logo */}
      <div className={`flex items-center h-16 px-4 border-b border-border gap-3 overflow-hidden`}>
        <div className="shrink-0">
          <AppLogo size={32} />
        </div>
        {!collapsed && (
          <span className="font-extrabold text-base tracking-tight text-foreground whitespace-nowrap overflow-hidden">
            ScriptForge
          </span>
        )}
      </div>

      {/* Nav Items */}
      <nav className="flex-1 py-4 px-2 space-y-1 overflow-hidden">
        {!collapsed && (
          <p className="section-label px-2 mb-3">Navigation</p>
        )}
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.key}
              href={item.href}
              title={collapsed ? item.label : undefined}
              className={`
                flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold
                transition-all duration-150 group relative
                ${isActive
                  ? 'bg-primary/10 text-primary' :'text-muted-foreground hover:bg-muted hover:text-foreground'
                }
                ${collapsed ? 'justify-center' : ''}
              `}
            >
              <span className="shrink-0">{item.icon}</span>
              {!collapsed && (
                <span className="truncate">{item.label}</span>
              )}
              {item.badge && item.badge > 0 && (
                <span className={`
                  ml-auto bg-primary text-primary-foreground text-2xs font-bold
                  rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1
                  ${collapsed ? 'absolute top-1 right-1' : ''}
                `}>
                  {item.badge}
                </span>
              )}
              {/* Tooltip for collapsed */}
              {collapsed && (
                <span className="
                  absolute left-full ml-3 px-2 py-1 rounded-md bg-foreground text-background
                  text-xs font-medium whitespace-nowrap opacity-0 pointer-events-none
                  group-hover:opacity-100 transition-opacity duration-150 z-50
                ">
                  {item.label}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Active job indicator */}
      <div className={`px-3 pb-3 ${collapsed ? 'flex justify-center' : ''}`}>
        <div className={`
          flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary/30 border border-secondary
          ${collapsed ? 'justify-center' : ''}
        `}>
          <Zap size={14} className="text-primary shrink-0 status-pulse" />
          {!collapsed && (
            <span className="text-xs font-semibold text-primary truncate">1 job active</span>
          )}
        </div>
      </div>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="
          absolute -right-3 top-20 w-6 h-6 rounded-full bg-card border border-border
          flex items-center justify-center text-muted-foreground
          hover:bg-muted hover:text-foreground transition-all duration-150 z-10
        "
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
      </button>
    </aside>
  );
}