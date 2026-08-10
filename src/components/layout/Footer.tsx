'use client';

import Link from 'next/link';
import { Logo } from '@/components/ui/Logo';

export function Footer() {
  return (
    <footer className="border-t border-white/5 bg-[#0F0F0F]">
      <div className="mx-auto max-w-[1800px] px-4 py-8 sm:px-6 lg:px-12 lg:py-10">
        <div className="flex flex-col items-center gap-4 text-center">
          <Link href="/" className="focus:outline-none" aria-label="Cine Tracker Home">
            <Logo size={28} showText textSize="sm" />
          </Link>
          <p className="text-xs text-white/35 max-w-sm leading-relaxed">
            Track trending movies, box office collections, and discover new films.
          </p>
          <div className="border-t border-white/5 w-full max-w-xs pt-4 mt-2">
            <div className="flex flex-col items-center gap-2">
              <p className="text-xs text-white/30">
                © {new Date().getFullYear()} Cine Tracker. All rights reserved.
              </p>
              <p className="text-xs text-white/40 tracking-wide">
                Developed by Soujan
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
