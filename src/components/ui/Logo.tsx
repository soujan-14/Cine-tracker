'use client';

interface LogoProps {
  size?: number;
  showText?: boolean;
  textSize?: 'sm' | 'base' | 'lg';
  className?: string;
}

/** Cine Tracker brand mark: red C with the responsive Cine Tracker wordmark. */
export function Logo({ size = 36, showText = true, textSize = 'base', className = '' }: LogoProps) {
  const textSizeClass =
    textSize === 'sm'
      ? 'text-xs tracking-[0.12em] sm:text-sm'
      : textSize === 'lg'
        ? 'text-base tracking-[0.08em] sm:text-lg'
        : 'text-sm tracking-[0.12em] sm:text-base tracking-wider';

  return (
    <div className={`flex min-w-0 shrink-0 items-center gap-2 ${className}`}>
      <span
        aria-hidden="true"
        className="flex shrink-0 items-center justify-center font-black leading-none text-[#E50914]"
        style={{ width: size, height: size, fontSize: Math.max(24, Math.round(size * 0.92)) }}
      >
        C
      </span>
      {showText ? (
        <span className={`whitespace-nowrap font-black text-white ${textSizeClass}`}>
          CINE<span className="text-[#E50914]"> TRACKER</span>
        </span>
      ) : null}
    </div>
  );
}
