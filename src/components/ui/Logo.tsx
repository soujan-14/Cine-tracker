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
  const [loaded, setLoaded] = useState(false);
  const [errored, setErrored] = useState(false);
  const [startedLoad, setStartedLoad] = useState(false);

  const textSizeClass =
    textSize === 'sm'
      ? 'text-sm tracking-[0.15em]'
      : textSize === 'lg'
        ? 'text-lg tracking-[0.1em]'
        : 'text-base tracking-wider';

  const showImage = startedLoad && !errored;
  const showFallback = !showImage || !loaded;

  return (
    <div className={`flex items-center gap-2 flex-shrink-0 ${className}`}>
      <div
        className="relative overflow-hidden rounded-md"
        style={{ width: size, height: size }}
      >
        {showFallback && (
          <div
            className="flex h-full w-full items-center justify-center rounded-md bg-[#E50914]/10"
            aria-hidden={showImage && loaded}
          >
            <Film
              className="text-[#E50914]"
              style={{ width: Math.round(size * 0.65), height: Math.round(size * 0.65) }}
            />
          </div>
        )}

        {!errored && (
          <img
            src="/logo.svg"
            alt="Cine Tracker Logo"
            width={size}
            height={size}
            loading="eager"
            onLoadStart={() => setStartedLoad(true)}
            onLoad={() => setLoaded(true)}
            onError={() => {
              setErrored(true);
            }}
            className={`absolute inset-0 h-full w-full object-contain transition-opacity duration-200 ${
              loaded ? 'opacity-100' : 'opacity-0'
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
