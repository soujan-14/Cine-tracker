'use client';

interface LogoProps {
  size?: number;
  showText?: boolean;
  textSize?: 'sm' | 'base' | 'lg';
  className?: string;
}

export function Logo({ size = 36, showText = true, textSize = 'base', className = '' }: LogoProps) {
  const textSizeClass = textSize === 'sm' ? 'text-sm tracking-[0.15em]' : textSize === 'lg' ? 'text-lg tracking-[0.1em]' : 'text-base tracking-wider';

  return (
    <div className={`flex shrink-0 items-center gap-2 ${className}`}>
      <img src="/logo.png" alt="Cine Tracker logo" width={size} height={size} loading="eager" draggable={false} className="block shrink-0 object-contain" style={{ width: size, height: size }} />
      {showText ? <span className={`hidden font-black text-white sm:block ${textSizeClass}`}>CINE <span className="text-[#E50914]">TRACKER</span></span> : null}
    </div>
  );
}
