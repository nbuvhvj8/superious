'use client';

import React from 'react';
import Modal from '@/components/ui/Modal';
import { Bell, Check, Trash2, Clock, AlertCircle } from 'lucide-react';

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
    title: 'Job Completed',
    message: 'Your research on "Future of AI in Video" is ready.',
    time: '2 mins ago',
    type: 'success',
    unread: true,
  },
  {
    id: '2',
    title: 'Source Captured',
    message: 'Successfully captured 12 sources for "Blockbuster History".',
    time: '45 mins ago',
    type: 'info',
    unread: false,
  },
  {
    id: '3',
    title: 'Storage Warning',
    message: 'Your workspace storage is almost full (85%).',
    time: '2 hours ago',
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
    <Modal open={open} onClose={onClose} title="Notifications" size="md">
      <div className="flex flex-col h-[450px]">
        {/* Header Actions */}
        <div className="flex items-center justify-between px-5 py-3 bg-muted/30 border-b border-border">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
            Recent activity
          </span>
          <button className="text-xs font-bold text-primary hover:underline">
            Mark all as read
          </button>
        </div>

        {/* Notification List */}
        <div className="flex-1 overflow-y-auto scrollbar-thin divide-y divide-border">
          {MOCK_NOTIFICATIONS.length > 0 ? (
            MOCK_NOTIFICATIONS.map((notif) => (
              <div
                key={notif.id}
                className={`p-4 hover:bg-muted/40 transition-colors cursor-pointer group relative ${
                  notif.unread ? 'bg-primary/[0.02]' : ''
                }`}
              >
                <div className="flex gap-3">
                  <div className={`mt-0.5 shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                    notif.type === 'success' ? 'bg-green-100 text-green-600' :
                    notif.type === 'warning' ? 'bg-amber-100 text-amber-600' :
                    notif.type === 'error' ? 'bg-red-100 text-red-600' :
                    'bg-blue-100 text-blue-600'
                  }`}>
                    {notif.type === 'success' && <Check size={16} strokeWidth={2.25} />}
                    {notif.type === 'warning' && <AlertCircle size={16} strokeWidth={2.25} />}
                    {notif.type === 'info' && <Bell size={16} strokeWidth={2.25} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <h4 className={`text-sm font-bold truncate ${notif.unread ? 'text-foreground' : 'text-muted-foreground'}`}>
                        {notif.title}
                      </h4>
                      <div className="flex items-center gap-1.5 text-2xs text-muted-foreground">
                        <Clock size={10} strokeWidth={2.25} />
                        {notif.time}
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                      {notif.message}
                    </p>
                  </div>
                  {notif.unread && (
                    <div className="absolute top-4 right-4 w-1.5 h-1.5 bg-primary rounded-full" />
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-3">
              <Bell size={40} className="opacity-20" strokeWidth={1.5} />
              <p className="text-sm font-medium">All caught up!</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border flex justify-center">
          <button className="btn-secondary w-full text-xs py-2">
            View all history
          </button>
        </div>
      </div>
    </Modal>
  );
}
