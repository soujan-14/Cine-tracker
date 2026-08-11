'use client';

import Image from 'next/image';

interface LogoProps {
  size?: number;
  showText?: boolean;
  textSize?: 'sm' | 'base' | 'lg';
  className?: string;
}

export function Logo({ size = 36, showText = true, textSize = 'base', className = '' }: LogoProps) {
  const textSizeClass =
    textSize === 'sm'
      ? 'text-sm tracking-[0.15em]'
      : textSize === 'lg'
        ? 'text-lg tracking-[0.1em]'
        : 'text-base tracking-wider';

  return (
    <div className={`flex items-center gap-2 flex-shrink-0 ${className}`}>
      <Image
        src="/logo.png"
        alt="Cine Tracker"
        width={size}
        height={size}
        priority
        className="block object-contain"
      />
      {showText ? (
        <span className={`hidden sm:block font-black text-white ${textSizeClass}`}>
          CINE<span className="text-[#E50914]">TRACKER</span>
        </span>
      ) : null}
    </div>
  );
}
