'use client';

import React from 'react';
import { User, Mail, Shield, CreditCard, ChevronRight } from 'lucide-react';

export default function AccountSection() {
  return (
    <div className="space-y-16">
      {/* Account Info Section */}
      <section className="space-y-6">
        <h2 className="text-[16px] font-bold text-foreground">Account</h2>
        
        <div className="space-y-6">
          {/* Email Row */}
          <div className="flex items-center justify-between gap-4">
            <div className="space-y-1">
              <h3 className="text-sm font-medium text-foreground">Email address</h3>
              <p className="text-xs text-muted-foreground">The email address associated with your account.</p>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-[#f2f3f6] rounded-[8px] text-[12.5px] font-bold text-foreground">
              <Mail size={13} className="text-muted-foreground" />
              <span>user@example.com</span>
            </div>
          </div>

<<<<<<< Updated upstream
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Manage your account profile and credentials.
        </p>
        <div className="p-4 rounded-xl border border-border bg-muted/20 italic text-xs text-muted-foreground">
          Placeholder for account settings: profile info, email preferences, etc.
=======
          {/* Subscription Row */}
          <div className="flex items-center justify-between gap-4">
            <div className="space-y-1">
              <h3 className="text-sm font-medium text-foreground">Subscription</h3>
              <p className="text-xs text-muted-foreground">You are currently on the Pro Researcher plan.</p>
            </div>
            <button className="flex items-center gap-2 px-3 py-1.5 bg-[#f2f3f6] rounded-[8px] text-[11.5px] font-bold text-primary hover:bg-[#ebecef] transition-all">
              <CreditCard size={13} />
              <span>Manage Billing</span>
            </button>
          </div>
>>>>>>> Stashed changes
        </div>
      </section>

      {/* Security Section */}
      <section className="space-y-6">
        <h2 className="text-[16px] font-bold text-foreground">Security</h2>

        <div className="space-y-6">
          {/* Password Row */}
          <div className="flex items-center justify-between gap-4">
            <div className="space-y-1">
              <h3 className="text-sm font-medium text-foreground">Password</h3>
              <p className="text-xs text-muted-foreground">Last changed 3 months ago.</p>
            </div>
            <button className="flex items-center gap-2 px-3 py-1.5 bg-[#f2f3f6] rounded-[8px] text-[11.5px] font-bold text-foreground hover:bg-[#ebecef] transition-all">
              <span>Update Password</span>
              <ChevronRight size={13} className="text-muted-foreground" />
            </button>
          </div>

          {/* Two-Factor Row */}
          <div className="flex items-center justify-between gap-4">
            <div className="space-y-1">
              <h3 className="text-sm font-medium text-foreground">Two-factor authentication</h3>
              <p className="text-xs text-muted-foreground">Add an extra layer of security to your account.</p>
            </div>
            <button className="px-3 py-1.5 bg-[#f2f3f6] rounded-[8px] text-[11.5px] font-bold text-foreground hover:bg-[#ebecef] transition-all">
              Enable 2FA
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
