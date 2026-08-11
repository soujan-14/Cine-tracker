'use client';

interface LogoProps {
  size?: number;
  showText?: boolean;
  textSize?: 'sm' | 'base' | 'lg';
  className?: string;
}

/**
 * Single source of truth for Cine Tracker branding.
 * The public logo asset is intentionally rendered without filters, cropping,
 * recoloring, generated fallbacks, or added text so the supplied artwork stays exact.
 */
export function Logo({ size = 36, className = '' }: LogoProps) {
  return (
    <img
      src="/logo.png"
      alt="Cine Tracker"
      width={size}
      height={size}
      loading="eager"
      draggable={false}
      className={`block shrink-0 object-contain ${className}`}
      style={{ width: size, height: size }}
    />
  );
}
