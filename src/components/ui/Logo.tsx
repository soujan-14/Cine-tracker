'use client';

interface LogoProps {
  size?: number;
  showText?: boolean;
  textSize?: 'sm' | 'base' | 'lg';
  className?: string;
}

/**
 * Single source of truth for Cine Tracker branding.
 * The supplied artwork is rendered as-is from the canonical /logo.png asset.
 * The CINE TRACKER wordmark is separate text so the image itself is never modified.
 */
export function Logo({ size = 36, showText = true, textSize = 'base', className = '' }: LogoProps) {
  const textSizeClass =
    textSize === 'sm'
      ? 'text-xs tracking-[0.12em] sm:text-sm'
      : textSize === 'lg'
        ? 'text-base tracking-[0.08em] sm:text-lg'
        : 'text-sm tracking-[0.12em] sm:text-base tracking-wider';

  return (
    <div className={`flex min-w-0 shrink-0 items-center gap-2 ${className}`}>
      <img
        src="/logo.png"
        alt="Cine Tracker Logo"
        width={size}
        height={size}
        loading="eager"
        draggable={false}
        className="block shrink-0 object-contain"
        style={{ width: size, height: size }}
      />
      {showText ? (
        <span className={`whitespace-nowrap font-black text-white ${textSizeClass}`}>
          CINE<span className="text-[#E50914]"> TRACKER</span>
        </span>
      ) : null}
    </div>
  );
}