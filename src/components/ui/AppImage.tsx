'use client';

import React, { useState, useCallback, useMemo, memo } from 'react';

interface AppImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  fill?: boolean;
  onClick?: () => void;
  fallbackSrc?: string;
  loading?: 'lazy' | 'eager';
  [key: string]: unknown;
}

const AppImage = memo(function AppImage({
  src,
  alt,
  width,
  height,
  className = '',
  priority = false,
  fill = false,
  onClick,
  fallbackSrc = '/assets/images/no_image.png',
  loading = 'lazy',
  ...props
}: AppImageProps) {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // When src changes, the browser naturally handles the new load.
  // We just need to reset our error/loading states if the URL actually changed.
  const [lastSrc, setLastSrc] = useState(src);
  if (src !== lastSrc) {
    setLastSrc(src);
    setHasError(false);
    setIsLoading(true);
  }

  const handleError = useCallback(() => {
    setHasError(true);
    setIsLoading(false);
  }, []);

  const handleLoad = useCallback(() => {
    setIsLoading(false);
    setHasError(false);
  }, []);

  const imageClassName = useMemo(() => {
    const classes = [className];
    if (isLoading) classes.push('bg-gray-200');
    if (onClick) classes.push('cursor-pointer hover:opacity-90 transition-opacity duration-200');
    return classes.filter(Boolean).join(' ');
  }, [className, isLoading, onClick]);

  const resolvedLoading = priority ? 'eager' : loading;
  const currentSrc = hasError ? fallbackSrc : src;

  if (fill) {
    return (
      <div className="relative" style={{ width: '100%', height: '100%' }}>
        <img
          src={currentSrc}
          alt={alt}
          className={imageClassName}
          onError={handleError}
          onLoad={handleLoad}
          onClick={onClick}
          loading={resolvedLoading}
          style={{ objectFit: 'cover', width: '100%', height: '100%' }}
          {...props}
        />
      </div>
    );
  }

  return (
    <img
      src={currentSrc}
      alt={alt}
      width={width}
      height={height}
      className={imageClassName}
      onError={handleError}
      onLoad={handleLoad}
      onClick={onClick}
      loading={resolvedLoading}
      {...props}
    />
  );
});

AppImage.displayName = 'AppImage';

export default AppImage;
