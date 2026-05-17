import React from 'react';
import { HugeiconsIcon, IconSvgElement } from '@hugeicons/react';
import * as HugeIcons from '@hugeicons/core-free-icons';

type IconVariant = 'outline' | 'solid';

interface IconProps {
  name: string;
  variant?: IconVariant;
  size?: number;
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
  [key: string]: unknown;
}

function Icon({
  name,
  variant = 'outline',
  size = 24,
  className = '',
  onClick,
  disabled = false,
  ...props
}: IconProps) {
  const iconSet = HugeIcons;
  const IconComponent = iconSet[name as keyof typeof iconSet] as IconSvgElement;

  if (!IconComponent) {
    return (
      <HugeiconsIcon
        icon={HugeIcons.QuestionIcon}
        size={size}
        strokeWidth={2.25}
        className={`text-gray-400 ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
        onClick={disabled ? undefined : onClick}
        {...props}
      />
    );
  }

  return (
    <HugeiconsIcon
      icon={IconComponent}
      size={size}
      strokeWidth={2.25}
      className={`${disabled ? 'opacity-50 cursor-not-allowed' : onClick ? 'cursor-pointer hover:opacity-80' : ''} ${className}`}
      onClick={disabled ? undefined : onClick}
      {...props}
    />
  );
}

export default Icon;
