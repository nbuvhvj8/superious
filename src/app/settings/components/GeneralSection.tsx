'use client';

import React, { useState, useEffect } from 'react';
import { User, Sun, Moon, Monitor, Camera, ChevronDown, Check } from 'lucide-react';
import Toggle from '@/components/ui/Toggle';

const APP_COLORS = [
  { name: 'Green', value: '#16a34a' },
  { name: 'Blue', value: '#2563eb' },
  { name: 'Purple', value: '#9333ea' },
  { name: 'Rose', value: '#e11d48' },
  { name: 'Orange', value: '#ea580c' },
  { name: 'Slate', value: '#334155' },
];

export default function GeneralSection() {
  const [appearance, setAppearance] = useState<'light' | 'dark' | 'system'>('system');
  const [appColor, setAppColor] = useState('#16a34a');
  const [notifyCompletions, setNotifyCompletions] = useState(true);
  const [notifyDispatch, setNotifyDispatch] = useState(true);
  const [showColorDropdown, setShowColorDropdown] = useState(false);

  const handleAppearanceChange = (mode: 'light' | 'dark' | 'system') => {
    setAppearance(mode);
    localStorage.setItem('appearance', mode);
    
    if (mode === 'system') {
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
    } else {
      document.documentElement.setAttribute('data-theme', mode === 'dark' ? 'dark' : 'light');
    }
  };

  useEffect(() => {
    const savedAppearance = localStorage.getItem('appearance') as 'light' | 'dark' | 'system' || 'system';
    setAppearance(savedAppearance);

    const savedColor = localStorage.getItem('app_color');
    const isValidColor = APP_COLORS.some((c) => c.value === savedColor);
    const colorToApply = isValidColor ? (savedColor as string) : '#16a34a';

    setAppColor(colorToApply);
    document.documentElement.style.setProperty('--primary', colorToApply);
  }, []);

  const handleColorChange = (color: string) => {
    setAppColor(color);
    localStorage.setItem('app_color', color);
    document.documentElement.style.setProperty('--primary', color);
    setShowColorDropdown(false);
  };

  return (
    <div className="space-y-16">
      {/* Profile Section */}
      <section className="space-y-6">
        <h2 className="text-[16px] font-bold text-foreground">Profile</h2>

        <div className="space-y-6">
          {/* Avatar Row */}
          <div className="flex items-center justify-between gap-4">
            <div className="space-y-1">
              <h3 className="text-sm font-medium text-foreground">Avatar</h3>
              <p className="text-xs text-muted-foreground">
                Click to upload a new profile picture.
              </p>
            </div>
            <div className="relative group cursor-pointer shrink-0">
              <div className="w-12 h-12 rounded-full bg-[#f2f3f6] border border-border/40 flex items-center justify-center overflow-hidden">
                <User size={20} className="text-muted-foreground" />
              </div>
              <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera size={14} className="text-white" />
              </div>
            </div>
          </div>

          {/* Full Name Row */}
          <div className="flex items-center justify-between gap-4">
            <div className="space-y-1">
              <h3 className="text-sm font-medium text-foreground">Full Name</h3>
            </div>
            <input
              type="text"
              placeholder="Your full name"
              className="h-9 px-3 text-sm w-full max-w-[240px] text-left bg-[#f2f3f6] rounded-[8px] border-0 outline-none focus:outline-none focus:ring-0 placeholder:text-muted-foreground/40 transition-all hover:bg-[#ebecef]"
            />
          </div>

          {/* Preferred Name Row */}
          <div className="flex items-center justify-between gap-4">
            <div className="space-y-1">
              <h3 className="text-sm font-medium text-foreground">What should outlier call you?</h3>
            </div>
            <input
              type="text"
              placeholder="Preferred name"
              className="h-9 px-3 text-sm w-full max-w-[240px] text-left bg-[#f2f3f6] rounded-[8px] border-0 outline-none focus:outline-none focus:ring-0 placeholder:text-muted-foreground/40 transition-all hover:bg-[#ebecef]"
            />
          </div>
        </div>
      </section>

      {/* Preference Section */}
      <section className="space-y-6">
        <h2 className="text-[16px] font-bold text-foreground">Preference</h2>

        <div className="space-y-6">
          {/* Appearance Row */}
          <div className="flex items-center justify-between gap-4">
            <div className="space-y-1">
              <h3 className="text-sm font-medium text-foreground">Appearance</h3>
            </div>
            <div className="flex items-center gap-1 p-1 bg-[#f2f3f6] rounded-[8px]">
              {[
                { id: 'light', label: 'White', icon: <Sun size={14} /> },
                { id: 'dark', label: 'Black', icon: <Moon size={14} /> },
                { id: 'system', label: 'System', icon: <Monitor size={14} /> },
              ].map((mode) => (
                <button
                  key={mode.id}
                  onClick={() => handleAppearanceChange(mode.id as 'light' | 'dark' | 'system')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-[11.5px] font-bold rounded-[6px] transition-all ${
                    appearance === mode.id
                      ? 'bg-white text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {mode.icon}
                  {mode.label}
                </button>
              ))}            </div>
          </div>

          {/* App Color Row */}
          <div className="flex items-center justify-between gap-4">
            <div className="space-y-1">
              <h3 className="text-sm font-medium text-foreground">App Color</h3>
            </div>
            <div className="relative">
              <button
                onClick={() => setShowColorDropdown(!showColorDropdown)}
                className="flex items-center gap-2 px-3 py-1.5 bg-[#f2f3f6] rounded-[8px] border-none text-[12px] font-bold text-foreground hover:bg-[#ebecef] transition-all min-w-[120px] justify-between"
              >
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full shadow-sm"
                    style={{ backgroundColor: appColor }}
                  />
                  <span>{APP_COLORS.find((c) => c.value === appColor)?.name}</span>
                </div>
                <ChevronDown
                  size={14}
                  className={`text-muted-foreground transition-transform ${showColorDropdown ? 'rotate-180' : ''}`}
                />
              </button>

              {showColorDropdown && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowColorDropdown(false)} />
                  <div className="absolute top-full right-0 mt-1 w-44 bg-white border border-border/60 rounded-[8px] shadow-xl z-50 py-1 overflow-hidden animate-in fade-in slide-in-from-top-1">
                    {APP_COLORS.map((color) => (
                      <button
                        key={color.value}
                        onClick={() => handleColorChange(color.value)}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-[12px] font-semibold hover:bg-[#f9f9f9] transition-colors text-left"
                      >
                        <div
                          className="w-3.5 h-3.5 rounded-full shadow-sm shrink-0"
                          style={{ backgroundColor: color.value }}
                        />
                        <span className="flex-1">{color.name}</span>
                        {appColor === color.value && <Check className="text-primary" size={13} />}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Notification Section */}
      <section className="space-y-6">
        <h2 className="text-[16px] font-bold text-foreground">Notifications</h2>

        <div className="space-y-8">
          <div className="flex items-start justify-between gap-8">
            <div className="space-y-1">
              <h3 className="text-sm font-medium text-foreground">Response completions</h3>
            </div>
            <div className="pt-1">
              <Toggle checked={notifyCompletions} onChange={setNotifyCompletions} />
            </div>
          </div>

          <div className="flex items-start justify-between gap-8">
            <div className="space-y-1">
              <h3 className="text-sm font-medium text-foreground">Dispatch messages</h3>
            </div>
            <div className="pt-1">
              <Toggle checked={notifyDispatch} onChange={setNotifyDispatch} />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
