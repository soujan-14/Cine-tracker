'use client';

interface LogoProps {
  size?: number;
  showText?: boolean;
  textSize?: 'sm' | 'base' | 'lg';
  className?: string;
}

const BRAND_RED = '#E50914';

/**
 * Cine Tracker brand mark:
 * a single bold red C with the responsive Cine Tracker wordmark.
 * Keep the public API unchanged so every existing usage stays compatible.
 */
export function Logo({
  size = 36,
  showText = true,
  textSize = 'base',
  className = '',
}: LogoProps) {
  const textSizeClass =
    textSize === 'sm'
      ? 'text-xs tracking-[0.12em] sm:text-sm'
      : textSize === 'lg'
        ? 'text-base tracking-[0.08em] sm:text-lg'
        : 'text-sm tracking-[0.12em] sm:text-base sm:tracking-wider';

  return (
    <div
      className={`flex min-w-0 shrink-0 items-center gap-2 ${className}`}
      aria-label="Cine Tracker"
    >
      <svg
        aria-hidden="true"
        role="img"
        viewBox="0 0 64 64"
        width={size}
        height={size}
        className="block shrink-0"
        focusable="false"
      >
        <text
          x="32"
          y="47"
          textAnchor="middle"
          fontFamily="Arial, Helvetica, sans-serif"
          fontSize="48"
          fontWeight="900"
          fill={BRAND_RED}
        >
          C
        </text>
      </svg>

      {showText ? (
        <span
          className={`whitespace-nowrap font-black text-white ${textSizeClass}`}
        >
          CINE
          <span className="text-[#E50914]"> TRACKER</span>
        </span>
      ) : null}
    </div>
  );
}
