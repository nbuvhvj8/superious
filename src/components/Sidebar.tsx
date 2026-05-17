'use client';

import React, { useMemo, useState } from 'react';
import AppLogo from './ui/AppLogo';
import Link from 'next/link';
import { HugeiconsIcon } from '@hugeicons/react';
import { usePathname } from 'next/navigation';
import {
  Briefcase02Icon,
  Clock01Icon,
  MoreHorizontalIcon,
  PanelLeftIcon,
  PanelRightIcon,
  Pen01Icon,
  PuzzleIcon,
  Search01Icon,
  Settings01Icon,
  UserIcon,
} from '@hugeicons/core-free-icons';
import Modal from './ui/Modal';

interface NavItem {
  key: string;
  label: string;
  href: string;
  icon: React.ReactNode;
}

const TOP_NAV_ITEMS: NavItem[] = [
  {
    key: 'nav-search',
    label: 'Search',
    href: '#search',
    icon: <HugeiconsIcon icon={Search01Icon} size={16} strokeWidth={2.25} />,
  },
  {
    key: 'nav-chat',
    label: 'New Chat',
    href: '/new-chat',
    icon: <HugeiconsIcon icon={Pen01Icon} size={16} strokeWidth={2.25} />,
  },
  {
    key: 'nav-plugins',
    label: 'Extensions',
    href: '/plugins',
    icon: <HugeiconsIcon icon={PuzzleIcon} size={16} strokeWidth={2.25} />,
  },
  {
    key: 'nav-cron',
    label: 'Scheduled',
    href: '/cron-job',
    icon: <HugeiconsIcon icon={Clock01Icon} size={16} strokeWidth={2.25} />,
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
  const [searchOpen, setSearchOpen] = useState(false);

  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const sessions = useMemo(() => mockSessions, []);

  const renderNavLink = (item: NavItem) => {
    const isActive =
      pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));

    if (item.key === 'nav-search') {
      return (
        <button
          key={item.key}
          type="button"
          onClick={() => setSearchOpen(true)}
          title={collapsed ? item.label : undefined}
          className={`
            flex w-full items-center gap-3 px-3 py-2 rounded-[6px] text-sm font-semibold
            transition-all duration-150 group relative
            active:scale-[0.97] active:duration-75
            text-muted-foreground hover:bg-[#f9f9f9] hover:text-foreground
            ${collapsed ? 'justify-center' : ''}
          `}
        >
          <span className="shrink-0">{item.icon}</span>
          {!collapsed && <span className="truncate">{item.label}</span>}
        </button>
      );
    }

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
    <>
      <aside
        className={`relative flex flex-col h-full border-r border-border bg-[#fdfdfe] transition-all duration-300 ease-in-out shrink-0 ${collapsed ? 'w-14' : 'w-[280px]'}`}
      >
        <div
          className={`flex items-center h-12 px-4 gap-3 overflow-hidden ${collapsed ? 'justify-center' : 'justify-between'}`}
        >
          {!collapsed && <AppLogo size={32} />}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1.5 rounded-md text-foreground hover:bg-muted transition-all duration-150"
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? (
              <HugeiconsIcon icon={PanelRightIcon} size={18} strokeWidth={2.25} />
            ) : (
              <HugeiconsIcon icon={PanelLeftIcon} size={18} strokeWidth={2.25} />
            )}
          </button>
        </div>

        <nav className="pt-2 px-2 space-y-1">{TOP_NAV_ITEMS.map(renderNavLink)}</nav>

        {!collapsed && (
          <div className="mt-4 px-2 min-h-0">
            <div className="px-3 pb-2 text-[11px] font-bold tracking-[0.12em] text-muted-foreground">
              recents
            </div>
            <div className="space-y-1">
              {sessions.map((session) => (
                <div
                  key={session.id}
                  className="relative flex items-center gap-1 rounded-[6px] px-2 py-1 hover:bg-[#f9f9f9] transition-colors group"
                >
                  <Link
                    href={session.href}
                    className="block min-w-0 flex-1 rounded-[6px] px-1 py-1 text-[13px] text-muted-foreground hover:text-foreground"
                  >
                    <span className="line-clamp-1">{session.title}</span>
                  </Link>
                  <button
                    onClick={() => setOpenMenuId(openMenuId === session.id ? null : session.id)}
                    className={`p-1.5 rounded-[6px] text-muted-foreground hover:bg-[#f2f3f6] hover:text-foreground transition-all ${openMenuId === session.id ? 'opacity-100 bg-[#f2f3f6]' : 'opacity-0 group-hover:opacity-100'}`}
                    aria-label={`Open options for ${session.title}`}
                  >
                    <HugeiconsIcon icon={MoreHorizontalIcon} size={14} />
                  </button>

                  {openMenuId === session.id && (
                    <>
                      <div className="fixed inset-0 z-30" onClick={() => setOpenMenuId(null)} />
                      <div className="absolute top-full right-0 mt-1 w-36 bg-white border border-border rounded-lg shadow-xl z-40 py-1.5 animate-slide-up">
                        <button className="w-full text-left px-3 py-1.5 text-[12px] font-medium text-muted-foreground hover:bg-[#f9f9f9] hover:text-foreground transition-colors">
                          Archive
                        </button>
                        <button className="w-full text-left px-3 py-1.5 text-[12px] font-medium text-muted-foreground hover:bg-[#f9f9f9] hover:text-foreground transition-colors">
                          Rename
                        </button>
                        <div className="h-px bg-border/50 my-1" />
                        <button className="w-full text-left px-3 py-1.5 text-[12px] font-medium text-red-500 hover:bg-red-50 transition-colors">
                          Delete
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-auto border-t border-border p-2 space-y-1">
          {!collapsed && (
            <Link
              href="/settings"
              className={`flex items-center justify-between gap-2 px-3 py-2 rounded-[6px] text-sm font-semibold transition-all duration-150 ${pathname.startsWith('/settings') ? 'bg-[#f2f3f6] text-foreground shadow-sm' : 'text-muted-foreground hover:bg-[#f9f9f9] hover:text-foreground'}`}
            >
              <div className="flex items-center gap-2 min-w-0">
                <HugeiconsIcon icon={UserIcon} size={16} strokeWidth={2.25} />
                <span className="truncate">johndoe</span>
              </div>
              <HugeiconsIcon icon={Settings01Icon} size={15} strokeWidth={2.25} />
            </Link>
          )}
        </div>
      </aside>

      <Modal open={searchOpen} onClose={() => setSearchOpen(false)} size="xl">
        <div className="p-4 space-y-6">
          <div className="relative group">
            <HugeiconsIcon
              icon={Search01Icon}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors"
              size={18}
            />
            <input
              type="text"
              autoFocus
              placeholder="Search chats, prompts, notes..."
              className="w-full h-12 pl-12 pr-4 rounded-[10px] bg-[#f2f3f6] border-0 text-[15px] outline-none focus:ring-2 focus:ring-primary/10 transition-all placeholder:text-muted-foreground/60"
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between px-1">
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/80">
                Recent Searches
              </h4>
              <button className="text-[11px] font-medium text-muted-foreground hover:text-foreground transition-colors">
                Clear all
              </button>
            </div>

            <div className="grid gap-1">
              {[
                { title: 'Q2 Product Strategy', category: 'Chat', time: '2h ago' },
                { title: 'Market Analysis - AI Tools', category: 'Research', time: '5h ago' },
                { title: 'Video Script: Future of SaaS', category: 'Script', time: 'Yesterday' },
              ].map((item, i) => (
                <button
                  key={i}
                  className="flex items-center justify-between w-full p-2.5 rounded-[8px] hover:bg-[#f2f3f6] transition-all group active:scale-[0.99]"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-[6px] bg-white border border-border/50 flex items-center justify-center text-muted-foreground group-hover:text-primary transition-colors">
                      <HugeiconsIcon icon={Clock01Icon} size={14} />
                    </div>
                    <div className="text-left">
                      <div className="text-[13px] font-medium text-foreground">{item.title}</div>
                      <div className="text-[11px] text-muted-foreground">{item.category}</div>
                    </div>
                  </div>
                  <div className="text-[11px] text-muted-foreground">{item.time}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="pt-2 border-t border-border/50 flex items-center justify-between px-1 text-[11px] text-muted-foreground">
            <div className="flex gap-4">
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 rounded border border-border bg-muted font-sans text-[10px]">
                  ↵
                </kbd>{' '}
                to select
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 rounded border border-border bg-muted font-sans text-[10px]">
                  ↑↓
                </kbd>{' '}
                to navigate
              </span>
            </div>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded border border-border bg-muted font-sans text-[10px]">
                ESC
              </kbd>{' '}
              to close
            </span>
          </div>
        </div>
      </Modal>
    </>
  );
}
