'use client';

import React from 'react';
import { User } from 'lucide-react';

export default function AccountSection() {
  return (
    <section id="account" className="space-y-8 text-foreground">
      <div className="flex items-center gap-2.5 pb-1 border-b border-border/60">
        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
          <User size={15} />
        </div>
        <div>
          <h2 className="text-base font-bold">Account</h2>
        </div>
      </div>

      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">Manage your account profile and credentials.</p>
        <div className="p-4 rounded-xl border border-border bg-muted/20 italic text-xs text-muted-foreground">
          Placeholder for account settings: profile info, email preferences, etc.
        </div>
      </div>
    </section>
  );
}
