/**
 * Motion Design Animation Styles and Utilities
 * Handles rendering and processing of professional motion graphics animations
 */

export type AnimationStyle = 'newspaper' | 'filmstrip' | 'parallax' | 'kinetic' | 'organic';
export type ExportFormat = 'mp4' | 'webm' | 'gif' | 'apng';
export type SoundEffect = 'none' | 'foley' | 'cinematic' | 'modern';

export interface AnimationConfig {
  style: AnimationStyle;
  speed: number; // 0.25 - 3.0 multiplier
  duration: number; // seconds per asset
  autoTransition: boolean;
  soundEffect: SoundEffect;
  exportFormat: ExportFormat;
}

export interface AnimationPreset {
  name: string;
  description: string;
  duration: number;
  keyframes: Record<string, Record<string, string | number>>;
  easing: 'ease-in' | 'ease-out' | 'ease-in-out' | 'linear' | 'custom';
}

/**
 * Animation style presets with keyframe definitions
 */
export const ANIMATION_PRESETS: Record<AnimationStyle, AnimationPreset> = {
  newspaper: {
    name: 'Newspaper',
    description: 'Classic newspaper animation with progressive text reveal',
    duration: 2.5,
    easing: 'ease-in-out',
    keyframes: {
      '0%': { opacity: 0, clipPath: 'inset(0 100% 0 0)' },
      '50%': { opacity: 0.7, clipPath: 'inset(0 50% 0 0)' },
      '100%': { opacity: 1, clipPath: 'inset(0 0 0 0)' },
    },
  },
  filmstrip: {
    name: 'Filmstrip',
    description: 'Vintage film reel effect with sequential progression',
    duration: 3,
    easing: 'ease-out',
    keyframes: {
      '0%': { transform: 'rotateY(90deg) scale(0.8)', opacity: 0 },
      '50%': { transform: 'rotateY(45deg) scale(0.9)', opacity: 0.5 },
      '100%': { transform: 'rotateY(0deg) scale(1)', opacity: 1 },
    },
  },
  parallax: {
    name: 'Parallax',
    description: 'Multi-layer depth effect with moving backgrounds',
    duration: 2.8,
    easing: 'ease-in-out',
    keyframes: {
      '0%': { transform: 'translateZ(0) scale(1.1)', opacity: 0 },
      '50%': { transform: 'translateZ(50px) scale(1.05)', opacity: 0.8 },
      '100%': { transform: 'translateZ(100px) scale(1)', opacity: 1 },
    },
  },
  kinetic: {
    name: 'Kinetic',
    description: 'Dynamic motion graphics with easing curves',
    duration: 2.2,
    easing: 'ease-in-out',
    keyframes: {
      '0%': { transform: 'translate(-50%, 50%) scale(0)', opacity: 0 },
      '50%': { transform: 'translate(-25%, 25%) scale(0.8)', opacity: 0.8 },
      '100%': { transform: 'translate(0, 0) scale(1)', opacity: 1 },
    },
  },
  organic: {
    name: 'Organic',
    description: 'Fluid motion inspired by natural physics',
    duration: 3.2,
    easing: 'ease-in-out',
    keyframes: {
      '0%': { opacity: 0, transform: 'scale(0.7) rotateX(45deg)' },
      '30%': { opacity: 0.6, transform: 'scale(0.95) rotateX(20deg)' },
      '70%': { opacity: 0.9, transform: 'scale(1.05) rotateX(-10deg)' },
      '100%': { opacity: 1, transform: 'scale(1) rotateX(0deg)' },
    },
  },
};

/**
 * Sound design effect presets for animations
 */
export const SOUND_PRESETS: Record<SoundEffect, string> = {
  none: 'Silent',
  foley: 'Foley (typewriter clicks, paper transitions)',
  cinematic: 'Cinematic (orchestral swells, impacts)',
  modern: 'Modern (digital whooshes, synth pads)',
};

/**
 * Export format specifications
 */
export const EXPORT_FORMATS: Record<ExportFormat, { label: string; mimeType: string }> = {
  mp4: { label: 'MP4 (H.264)', mimeType: 'video/mp4' },
  webm: { label: 'WebM (VP9)', mimeType: 'video/webm' },
  gif: { label: 'Animated GIF', mimeType: 'image/gif' },
  apng: { label: 'APNG', mimeType: 'image/apng' },
};

/**
 * Calculate total animation duration based on assets and config
 */
export function calculateTotalDuration(assetCount: number, config: AnimationConfig): number {
  const presetDuration = ANIMATION_PRESETS[config.style].duration;
  const adjustedDuration = presetDuration / config.speed;
  return assetCount * (adjustedDuration + config.duration);
}

/**
 * Generate CSS animation string from preset
 */
export function generateAnimationCSS(style: AnimationStyle, speed: number): string {
  const preset = ANIMATION_PRESETS[style];
  const keyframesCSS = Object.entries(preset.keyframes)
    .map(([stop, styles]) => {
      const cssStyles = Object.entries(styles as Record<string, string | number>)
        .map(([prop, val]) => `${prop}: ${val}`)
        .join('; ');
      return `${stop} { ${cssStyles}; }`;
    })
    .join('\n');

  const duration = preset.duration / speed;

  return `
@keyframes motion-${style} {
  ${keyframesCSS}
}

.animation-${style} {
  animation: motion-${style} ${duration}s ${preset.easing} forwards;
}
`;
}

/**
 * Validate animation configuration
 */
export function validateAnimationConfig(config: Partial<AnimationConfig>): boolean {
  if (!config.style || !ANIMATION_PRESETS[config.style]) return false;
  if (config.speed && (config.speed < 0.25 || config.speed > 3)) return false;
  if (config.duration && (config.duration < 1 || config.duration > 10)) return false;
  if (config.exportFormat && !EXPORT_FORMATS[config.exportFormat]) return false;
  return true;
}

/**
 * Create animation payload for API submission
 */
export function createAnimationPayload(
  assetId: string,
  config: AnimationConfig
): Record<string, unknown> {
  return {
    assetId,
    animation: {
      style: config.style,
      speed: config.speed,
      duration: config.duration,
      autoTransition: config.autoTransition,
      sound: config.soundEffect,
      export: {
        format: config.exportFormat,
      },
    },
    metadata: {
      createdAt: new Date().toISOString(),
      totalDuration: calculateTotalDuration(1, config),
    },
  };
}
