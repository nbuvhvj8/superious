'use client';

import React, { useState } from 'react';
import { RotateCcw, Download, Play, Pause } from 'lucide-react';

interface CapturedAsset {
  id: string;
  name: string;
  type: 'image' | 'screenshot' | 'chart';
  thumbnail: string;
  uploadedAt: Date;
}

const mockAssets: CapturedAsset[] = [
  {
    id: '1',
    name: 'Product Hero Image',
    type: 'image',
    thumbnail:
      'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 400 300%22%3E%3Crect fill=%22%2334d399%22 width=%22400%22 height=%22300%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 font-size=%2248%22 fill=%22white%22 text-anchor=%22middle%22 dominant-baseline=%22middle%22%3EAsset 1%3C/text%3E%3C/svg%3E',
    uploadedAt: new Date(Date.now() - 86400000),
  },
  {
    id: '2',
    name: 'Analytics Dashboard',
    type: 'screenshot',
    thumbnail:
      'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 400 300%22%3E%3Crect fill=%223b82f6%22 width=%22400%22 height=%22300%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 font-size=%2248%22 fill=%22white%22 text-anchor=%22middle%22 dominant-baseline=%22middle%22%3EAsset 2%3C/text%3E%3C/svg%3E',
    uploadedAt: new Date(Date.now() - 172800000),
  },
  {
    id: '3',
    name: 'User Journey Chart',
    type: 'chart',
    thumbnail:
      'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 400 300%22%3E%3Crect fill=%238b5cf6%22 width=%22400%22 height=%22300%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 font-size=%2248%22 fill=%22white%22 text-anchor=%22middle%22 dominant-baseline=%22middle%22%3EAsset 3%3C/text%3E%3C/svg%3E',
    uploadedAt: new Date(Date.now() - 259200000),
  },
];

type AnimationStyle = 'newspaper' | 'filmstrip' | 'parallax' | 'kinetic' | 'organic';

interface AnimationPreset {
  style: AnimationStyle;
  label: string;
  description: string;
  duration: number;
}

const animationPresets: AnimationPreset[] = [
  {
    style: 'newspaper',
    label: 'Newspaper',
    description: 'Progressive text reveal with classic newspaper animation',
    duration: 2.5,
  },
  {
    style: 'filmstrip',
    label: 'Filmstrip',
    description: 'Vintage film reel effect with frame progression',
    duration: 3,
  },
  {
    style: 'parallax',
    label: 'Parallax',
    description: 'Multi-layer depth effect with moving backgrounds',
    duration: 2.8,
  },
  {
    style: 'kinetic',
    label: 'Kinetic',
    description: 'Dynamic motion graphics with easing curves',
    duration: 2.2,
  },
  {
    style: 'organic',
    label: 'Organic',
    description: 'Fluid motion inspired by natural physics',
    duration: 3.2,
  },
];

export default function MotionDesignGallery() {
  const [selectedAssetId, setSelectedAssetId] = useState<string | null>('1');
  const [selectedAnimation, setSelectedAnimation] = useState<AnimationStyle>('newspaper');
  const [isPlaying, setIsPlaying] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const selectedAsset = mockAssets.find((a) => a.id === selectedAssetId);
  const selectedPreset = animationPresets.find((p) => p.style === selectedAnimation);

  const handleApplyAnimation = async () => {
    setIsProcessing(true);
    // Simulate processing
    await new Promise((r) => setTimeout(r, 2000));
    setIsProcessing(false);
    setIsPlaying(true);
  };

  const handleDownload = () => {
    // TODO: Implement export with animation applied
    console.log('Downloading animated asset...');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Asset Selection Panel */}
      <div className="lg:col-span-2 space-y-5">
        {/* Preview Area */}
        <div className="card p-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-foreground">Preview</h2>
              <span className="text-xs font-medium px-2 py-1 rounded bg-primary/10 text-primary">
                {selectedPreset?.label}
              </span>
            </div>

            {/* Animation Preview */}
            <div className="aspect-video w-full rounded-lg bg-gradient-to-br from-muted to-muted/50 border-2 border-border flex items-center justify-center overflow-hidden relative">
              {selectedAsset && (
                <img
                  src={selectedAsset.thumbnail}
                  alt={selectedAsset.name}
                  className={`w-full h-full object-cover ${isPlaying ? 'animate-pulse' : ''}`}
                />
              )}

              {/* Animation Overlay Indicators */}
              {isPlaying && (
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer" />
                </div>
              )}

              {/* Play/Pause Overlay */}
              <div className="absolute inset-0 flex items-center justify-center bg-black/0 hover:bg-black/20 transition-colors group">
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="w-16 h-16 rounded-full bg-primary text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center shadow-lg"
                  title={isPlaying ? 'Pause' : 'Play'}
                >
                  {isPlaying ? <Pause size={24} /> : <Play size={24} className="ml-1" />}
                </button>
              </div>
            </div>

            {/* Animation Info */}
            {selectedPreset && (
              <div className="p-3 bg-muted/40 rounded-lg border border-border">
                <p className="text-sm text-foreground font-medium">{selectedPreset.label}</p>
                <p className="text-xs text-muted-foreground mt-1">{selectedPreset.description}</p>
                <p className="text-xs text-muted-foreground mt-2">
                  Duration: {selectedPreset.duration}s
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2">
              <button
                onClick={handleApplyAnimation}
                disabled={isProcessing}
                className="btn-primary flex-1"
              >
                {isProcessing ? 'Processing...' : 'Apply Animation'}
              </button>
              <button
                onClick={handleDownload}
                disabled={isProcessing || !selectedAsset}
                className="btn-secondary flex items-center justify-center gap-2"
              >
                <Download size={16} />
                Export
              </button>
              <button onClick={() => setIsPlaying(false)} className="btn-ghost" title="Reset">
                <RotateCcw size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Asset List */}
        <div className="card p-6">
          <h3 className="text-sm font-bold text-foreground mb-4">Captured Assets</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {mockAssets.map((asset) => (
              <button
                key={asset.id}
                onClick={() => {
                  setSelectedAssetId(asset.id);
                  setIsPlaying(false);
                }}
                className={`group relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                  selectedAssetId === asset.id
                    ? 'border-primary ring-2 ring-primary/50'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <img
                  src={asset.thumbnail}
                  alt={asset.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-200"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                  <span className="text-xs font-medium text-white opacity-0 group-hover:opacity-100 transition-opacity">
                    {asset.type}
                  </span>
                </div>
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                  <p className="text-xs font-semibold text-white truncate">{asset.name}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Animation Styles Panel */}
      <div className="card p-6 h-fit sticky top-8">
        <h3 className="text-sm font-bold text-foreground mb-4">Animation Styles</h3>
        <div className="space-y-2">
          {animationPresets.map((preset) => (
            <button
              key={preset.style}
              onClick={() => {
                setSelectedAnimation(preset.style);
                setIsPlaying(false);
              }}
              className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
                selectedAnimation === preset.style
                  ? 'bg-primary/10 border-primary'
                  : 'bg-muted/40 border-border hover:border-primary/50'
              }`}
            >
              <p className="text-sm font-semibold text-foreground">{preset.label}</p>
              <p className="text-xs text-muted-foreground mt-1">{preset.description}</p>
            </button>
          ))}
        </div>

        {/* Additional Options */}
        <div className="mt-6 space-y-4 pt-6 border-t border-border">
          <div>
            <label className="text-xs font-semibold text-foreground block mb-2">
              Speed Multiplier
            </label>
            <select className="input-field w-full text-sm">
              <option value="0.5">Slow (0.5x)</option>
              <option value="1" selected>
                Normal (1.0x)
              </option>
              <option value="1.5">Fast (1.5x)</option>
              <option value="2">Very Fast (2.0x)</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-foreground block mb-2">Sound Effect</label>
            <select className="input-field w-full text-sm">
              <option value="none">None</option>
              <option value="foley">Foley</option>
              <option value="cinematic">Cinematic</option>
              <option value="modern">Modern</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-foreground block mb-2">
              Export Format
            </label>
            <select className="input-field w-full text-sm">
              <option value="mp4">MP4 (Recommended)</option>
              <option value="webm">WebM</option>
              <option value="gif">Animated GIF</option>
              <option value="apng">APNG</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
