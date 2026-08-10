'use client';

import { useState } from 'react';
import { Film } from 'lucide-react';

interface LogoProps {
  size?: number;
  showText?: boolean;
  textSize?: 'sm' | 'base' | 'lg';
  className?: string;
}

export function Logo({ size = 36, showText = true, textSize = 'base', className = '' }: LogoProps) {
  const [pngLoaded, setPngLoaded] = useState(false);
  const [pngErrored, setPngErrored] = useState(false);
  const [svgLoaded, setSvgLoaded] = useState(false);
  const [svgErrored, setSvgErrored] = useState(false);

  const textSizeClass =
    textSize === 'sm'
      ? 'text-sm tracking-[0.15em]'
      : textSize === 'lg'
        ? 'text-lg tracking-[0.1em]'
        : 'text-base tracking-wider';

  const showFallback = !pngLoaded && !svgLoaded && (pngErrored || svgErrored);

  return (
    <div className={`flex items-center gap-2 flex-shrink-0 ${className}`}>
      <div
        className="relative overflow-hidden rounded-md bg-black"
        style={{ width: size, height: size }}
      >
        {showFallback && (
          <div
            className="flex h-full w-full items-center justify-center rounded-md bg-[#E50914]/10"
          >
            <Film
              className="text-[#E50914]"
              style={{ width: Math.round(size * 0.65), height: Math.round(size * 0.65) }}
            />
          </div>
        )}

        {!pngErrored && (
          <img
            src="/logo.png"
            alt="Cine Tracker Logo"
            width={size}
            height={size}
            loading="eager"
            onLoad={() => setPngLoaded(true)}
            onError={() => setPngErrored(true)}
            className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-200 ${
              pngLoaded ? 'opacity-100' : 'opacity-0'
            }`}
          />
        )}

        {pngErrored && !svgErrored && (
          <img
            src="/logo.svg"
            alt="Cine Tracker Logo"
            width={size}
            height={size}
            loading="eager"
            onLoad={() => setSvgLoaded(true)}
            onError={() => setSvgErrored(true)}
            className={`absolute inset-0 h-full w-full object-contain transition-opacity duration-200 ${
              svgLoaded ? 'opacity-100' : 'opacity-0'
            }`}
          />
        )}
      </div>

      {showText ? (
        <span
          className={`hidden sm:block font-black text-white ${textSizeClass}`}
        >
          CINE<span className="text-[#E50914]">TRACKER</span>
        </span>
      ) : null}
    </div>
  );
}
