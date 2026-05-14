'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BriefcaseBusiness,
  PanelLeft,
  PanelRight,
  SquarePen,
  Clock,
  Puzzle,
  Search,
  User,
  MoreHorizontal,
  Settings,
} from 'lucide-react';

interface NavItem {
  key: string;
  label: string;
  href: string;
  icon: React.ReactNode;
}

const TOP_NAV_ITEMS: NavItem[] = [
  { key: 'nav-chat', label: 'New Chat', href: '/new-chat', icon: <SquarePen size={16} strokeWidth={2.25} /> },
  { key: 'nav-search', label: 'Search', href: '/session', icon: <Search size={16} strokeWidth={2.25} /> },
  { key: 'nav-plugins', label: 'Plugins & Extensions', href: '/plugins', icon: <Puzzle size={16} strokeWidth={2.25} /> },
  { key: 'nav-cron', label: 'Cron Jobs', href: '/cron-job', icon: <Clock size={16} strokeWidth={2.25} /> },
];

const BOTTOM_NAV_ITEMS: NavItem[] = [
  {
    key: 'nav-operations',
    label: 'Operations Hub',
    href: '/research-hub',
    icon: <BriefcaseBusiness size={16} strokeWidth={2.25} />,
  },
];

const mockSessions = [
  { id: 's1', title: 'Q2 Product Positioning Review', href: '/new-chat' },
  { id: 's2', title: 'Weekly Competitor Snapshot', href: '/new-chat' },
  { id: 's3', title: 'Growth Experiment Backlog', href: '/new-chat' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  const sessions = useMemo(() => mockSessions, []);

  const renderNavLink = (item: NavItem) => {
    const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));

    return (
      <Link
        key={item.key}
        href={item.href}
        title={collapsed ? item.label : undefined}
        className={`
          flex items-center gap-3 px-3 py-2 rounded-[6px] text-sm font-semibold
          transition-all duration-150 group relative
          active:scale-[0.97] active:duration-75
          ${isActive ? 'bg-[#f2f3f6] text-foreground shadow-sm' : 'text-muted-foreground hover:bg-[#f9f9f9] hover:text-foreground'}
          ${collapsed ? 'justify-center' : ''}
        `}
      >
        <span className="shrink-0">{item.icon}</span>
        {!collapsed && <span className="truncate">{item.label}</span>}
      </Link>
    );
  };

  return (
    <aside className={`relative flex flex-col h-full border-r border-border bg-[fdfdfe] transition-all duration-300 ease-in-out shrink-0 ${collapsed ? 'w-14' : 'w-[280px]'}`}>
      <div className="flex items-center justify-between h-12 px-4 gap-3 overflow-hidden">
        {!collapsed && <div className="text-xs font-semibold text-muted-foreground tracking-wide">Superious</div>}
        <button onClick={() => setCollapsed(!collapsed)} className="p-1.5 rounded-md text-foreground hover:bg-muted transition-all duration-150" aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}>
          {collapsed ? <PanelRight size={18} strokeWidth={2.25} /> : <PanelLeft size={18} strokeWidth={2.25} />}
        </button>
      </div>

      <nav className="pt-2 px-2 space-y-1">{TOP_NAV_ITEMS.map(renderNavLink)}</nav>

      {!collapsed && (
        <div className="mt-4 px-2 min-h-0">
          <div className="px-3 pb-2 text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">recents</div>
          <div className="space-y-1">
            {sessions.map((session) => (
              <div key={session.id} className="flex items-center gap-1 rounded-[6px] px-2 py-1 hover:bg-[#f9f9f9] transition-colors group">
                <Link href={session.href} className="block min-w-0 flex-1 rounded-[6px] px-1 py-1 text-[13px] text-muted-foreground hover:text-foreground">
                  <span className="line-clamp-1">{session.title}</span>
                </Link>
                <button className="p-1.5 rounded-[6px] text-muted-foreground hover:bg-[#f2f3f6] hover:text-foreground opacity-0 group-hover:opacity-100 transition-all" aria-label={`Open options for ${session.title}`}>
                  <MoreHorizontal size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-auto border-t border-border p-2 space-y-1">
        {BOTTOM_NAV_ITEMS.map(renderNavLink)}
        {!collapsed && (
          <Link href="/settings" className={`flex items-center justify-between gap-2 px-3 py-2 rounded-[6px] text-sm font-semibold transition-all duration-150 ${pathname.startsWith('/settings') ? 'bg-[#f2f3f6] text-foreground shadow-sm' : 'text-muted-foreground hover:bg-[#f9f9f9] hover:text-foreground'}`}>
            <div className="flex items-center gap-2 min-w-0">
              <User size={16} strokeWidth={2.25} />
              <span className="truncate">johndoe</span>
            </div>
            <Settings size={15} strokeWidth={2.25} />
          </Link>
        )}
      </div>
    </aside>
  );
}
