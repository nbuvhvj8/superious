'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Feather, CheckCircle2 } from 'lucide-react';
import Toggle from '@/components/ui/Toggle';

interface AnimationFormData {
  enableMotionDesign: boolean;
  animationStyle: 'newspaper' | 'filmstrip' | 'parallax' | 'kinetic' | 'organic';
  animationSpeed: number;
  enableAutoTransition: boolean;
  transitionDuration: number;
  enableSoundDesign: boolean;
}

const animationStyles = [
  {
    id: 'newspaper',
    label: 'Newspaper',
    description: 'Classic newspaper animation with progressive text reveal and image transitions',
  },
  {
    id: 'filmstrip',
    label: 'Filmstrip',
    description: 'Vintage film reel effect with sequential frame-by-frame progression',
  },
  {
    id: 'parallax',
    label: 'Parallax',
    description: 'Multi-layer depth effect with foreground/background depth separation',
  },
  {
    id: 'kinetic',
    label: 'Kinetic',
    description: 'Dynamic motion graphics with easing curves and smooth transitions',
  },
  {
    id: 'organic',
    label: 'Organic',
    description: 'Fluid, natural motion inspired by organic shapes and physics',
  },
] as const;

export default function AnimationSection() {
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [motionEnabled, setMotionEnabled] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    watch,
  } = useForm<AnimationFormData>({
    defaultValues: {
      enableMotionDesign: false,
      animationStyle: 'newspaper',
      animationSpeed: 1,
      enableAutoTransition: true,
      transitionDuration: 2,
      enableSoundDesign: false,
    },
  });

  const selectedStyle = watch('animationStyle');
  const speed = watch('animationSpeed');
  const duration = watch('transitionDuration');

  async function onSubmit(data: AnimationFormData) {
    setSaving(true);
    // TODO: Connect to PATCH /api/v1/settings/animation
    await new Promise((r) => setTimeout(r, 1100));
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  return (
    <section id="animation-design" className="card p-6 space-y-5">
      <div className="flex items-center gap-2.5 pb-1 border-b border-border">
        <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center">
          <Feather size={15} className="text-purple-500" />
        </div>
        <div>
          <h2 className="text-base font-bold text-foreground">Motion Design & Animation</h2>
          <p className="text-xs text-muted-foreground">
            Professional motion graphics for captured assets with newspaper, film, and kinetic
            effects.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Enable Motion Design Toggle */}
        <div className="flex items-start gap-4 p-4 bg-muted/40 rounded-lg border border-border">
          <Toggle
            checked={motionEnabled}
            onChange={(val) => {
              setMotionEnabled(val);
              // TODO: Connect to form state
            }}
            id="motion-design-toggle"
          />
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-foreground">Enable Motion Design</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Automatically process captured assets with professional animations and transitions.
            </p>
          </div>
        </div>

        {motionEnabled && (
          <>
            {/* Animation Style Selection */}
            <div className="space-y-3">
              <label className="text-sm font-semibold text-foreground">Animation Style</label>
              <p className="text-xs text-muted-foreground">
                Choose the motion design aesthetic for your assets.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {animationStyles.map((style) => (
                  <label
                    key={style.id}
                    className="flex items-start gap-3 p-3 rounded-lg border border-border hover:border-primary/50 cursor-pointer transition-colors has-[:checked]:bg-primary/5 has-[:checked]:border-primary"
                  >
                    <input
                      type="radio"
                      value={style.id}
                      {...register('animationStyle')}
                      className="mt-1 w-4 h-4 accent-primary cursor-pointer"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">{style.label}</p>
                      <p className="text-xs text-muted-foreground">{style.description}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Animation Speed */}
            <div className="space-y-1.5">
              <label htmlFor="anim-speed" className="text-sm font-semibold text-foreground">
                Animation Speed
              </label>
              <p className="text-xs text-muted-foreground">
                Playback speed multiplier. 1.0 = normal, 0.5 = half speed, 2.0 = double speed.
              </p>
              <div className="flex items-center gap-3">
                <input
                  id="anim-speed"
                  type="range"
                  min="0.25"
                  max="3"
                  step="0.25"
                  {...register('animationSpeed', { valueAsNumber: true })}
                  className="flex-1 h-1.5 rounded-full accent-primary cursor-pointer"
                />
                <span className="font-mono text-sm font-bold text-foreground tabular-nums w-12 text-right">
                  {speed.toFixed(2)}x
                </span>
              </div>
            </div>

            {/* Auto-Transition */}
            <div className="flex items-start gap-4 p-4 bg-muted/40 rounded-lg border border-border">
              <Toggle checked={true} onChange={() => {}} id="auto-transition-toggle" />
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-foreground">
                  Auto-Transition Between Assets
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Automatically progress to the next captured asset when animation completes.
                </p>
              </div>
            </div>

            {/* Transition Duration */}
            <div className="space-y-1.5">
              <label htmlFor="trans-duration" className="text-sm font-semibold text-foreground">
                Transition Duration
              </label>
              <p className="text-xs text-muted-foreground">
                Seconds to display each animated asset before transitioning. Range: 1–10 seconds.
              </p>
              <div className="flex items-center gap-2">
                <input
                  id="trans-duration"
                  type="number"
                  min={1}
                  max={10}
                  {...register('transitionDuration', {
                    valueAsNumber: true,
                    min: { value: 1, message: 'Minimum 1 second' },
                    max: { value: 10, message: 'Maximum 10 seconds' },
                  })}
                  className="input-field w-20 font-mono text-sm"
                />
                <span className="text-sm text-muted-foreground font-medium">seconds</span>
              </div>
              {errors.transitionDuration && (
                <p className="text-xs text-red-500">{errors.transitionDuration.message}</p>
              )}
            </div>

            {/* Sound Design */}
            <div className="flex items-start gap-4 p-4 bg-muted/40 rounded-lg border border-border">
              <Toggle checked={soundEnabled} onChange={setSoundEnabled} id="sound-design-toggle" />
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-foreground">Sound Design</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Add procedural sound effects (foley, transitions, emphasis stabs) synchronized
                  with animations.
                </p>
              </div>
            </div>

            {soundEnabled && (
              <div className="p-4 bg-blue-500/10 rounded-lg border border-blue-500/20 space-y-2">
                <p className="text-sm text-foreground font-medium">📍 Sound Design Preview</p>
                <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
                  <li>Transition whoosh and impact sounds</li>
                  <li>Typewriter clicks for newspaper style</li>
                  <li>Film projection reel sounds for filmstrip</li>
                  <li>Ambient pad generation for smooth transitions</li>
                </ul>
              </div>
            )}
          </>
        )}

        {/* Save Button */}
        <div className="flex items-center gap-3 pt-1">
          <button type="submit" disabled={saving || !isDirty} className="btn-primary min-w-[140px]">
            {saving ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24" fill="none">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                Saving…
              </span>
            ) : saved ? (
              <span className="flex items-center gap-2">
                <CheckCircle2 size={14} />
                Saved
              </span>
            ) : (
              'Save Settings'
            )}
          </button>
          {isDirty && !saving && !saved && (
            <span className="text-xs text-amber-600 font-medium">Unsaved changes</span>
          )}
        </div>
      </form>
    </section>
  );
}
