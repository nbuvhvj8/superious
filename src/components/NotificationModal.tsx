'use client';

import React from 'react';
import Modal from '@/components/ui/Modal';

interface NotificationModalProps {
  open: boolean;
  onClose: () => void;
}

export default function NotificationModal({ open, onClose }: NotificationModalProps) {
  return (
    <Modal open={open} onClose={onClose} title="Activity" size="notification">
      <div className="flex flex-col h-[540px] bg-background">
        {/* Content removed per request */}
      </div>
    </Modal>
  );
}
