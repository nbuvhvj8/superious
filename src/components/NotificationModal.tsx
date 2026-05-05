'use client';

import React from 'react';
import Modal from '@/components/ui/Modal';
import { Bell, Check, Clock, AlertCircle, Info } from 'lucide-react';

interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  type: 'info' | 'success' | 'warning' | 'error';
  unread: boolean;
}

const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: '1',
    title: 'Research Job Completed',
    message: 'The history of solar energy in Africa is ready for review.',
    time: '2m',
    type: 'success',
    unread: true,
  },
  {
    id: '2',
    title: 'Source Capture Success',
    message: '12 high-quality sources captured for your latest prompt.',
    time: '45m',
    type: 'info',
    unread: false,
  },
  {
    id: '3',
    title: 'Storage Capacity',
    message: 'You have used 85% of your available research storage.',
    time: '2h',
    type: 'warning',
    unread: true,
  },
];

interface NotificationModalProps {
  open: boolean;
  onClose: () => void;
}

export default function NotificationModal({ open, onClose }: NotificationModalProps) {
  return (
    <Modal open={open} onClose={onClose} title="Activity" size="md">
      <div className="flex flex-col h-[480px] bg-background">
        {/* Simple Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h3 className="text-xs font-bold text-foreground uppercase tracking-widest">
            Recent Notifications
          </h3>
          <button className="text-[10px] font-bold text-primary hover:opacity-80 uppercase tracking-tight">
            Clear all
          </button>
        </div>

        {/* Clean List */}
        <div className="flex-1 overflow-y-auto scrollbar-thin divide-y divide-border/60">
          {MOCK_NOTIFICATIONS.map((notif) => (
            <div
              key={notif.id}
              className={`
                group relative flex gap-4 px-6 py-5 transition-colors
                ${notif.unread ? 'bg-primary/[0.03]' : 'hover:bg-muted/30'}
              `}
            >
              {/* Simple Icon — No circle, just the bold stroke */}
              <div className="mt-0.5 shrink-0">
                {notif.type === 'success' && (
                  <Check size={18} strokeWidth={2.25} className="text-primary" />
                )}
                {notif.type === 'warning' && (
                  <AlertCircle size={18} strokeWidth={2.25} className="text-amber-600" />
                )}
                {notif.type === 'info' && (
                  <Info size={18} strokeWidth={2.25} className="text-blue-600" />
                )}
                {notif.type === 'error' && (
                  <AlertCircle size={18} strokeWidth={2.25} className="text-red-600" />
                )}
              </div>

              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <h4
                    className={`text-sm font-bold truncate ${notif.unread ? 'text-foreground' : 'text-foreground/70'}`}
                  >
                    {notif.title}
                  </h4>
                  <span className="text-[10px] font-bold text-muted-foreground uppercase whitespace-nowrap">
                    {notif.time}
                  </span>
                </div>
                <p className="text-xs text-foreground/60 leading-relaxed line-clamp-2 font-medium">
                  {notif.message}
                </p>
              </div>

              {/* Unread Indicator — Simple dot */}
              {notif.unread && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary rounded-r-full" />
              )}
            </div>
          ))}
        </div>

        {/* Minimal Footer */}
        <div className="p-6 border-t border-border">
          <button
            onClick={onClose}
            className="w-full py-3 bg-foreground text-background text-xs font-bold rounded-xl hover:opacity-90 transition-all active:scale-[0.98]"
          >
            Close Activity
          </button>
        </div>
      </div>
    </Modal>
  );
}
