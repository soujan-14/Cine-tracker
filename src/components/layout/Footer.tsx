import { Film } from 'lucide-react';
import Link from 'next/link';

const links = [
  { label: 'Home', href: '/' },
  { label: 'Discover', href: '/discover' },
  { label: 'Profile', href: '/profile' },
];

export function Footer() {
  return (
    <footer className="border-t border-white/5 bg-[#141414] px-6 py-10 lg:px-12">
      <div className="mx-auto max-w-[1800px]">
        <div className="flex flex-col items-center gap-6 sm:flex-row sm:justify-between">
          <div className="flex items-center gap-2">
            <Film className="h-5 w-5 text-[#E50914]" />
            <span className="text-sm font-black tracking-[0.15em] text-white">CINE TRACKER</span>
          </div>

          <nav className="flex flex-wrap items-center gap-6">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-white/40 transition hover:text-white"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <p className="text-xs text-white/30">© {new Date().getFullYear()} Cine Tracker</p>
        </div>
      </div>
    </footer>
  );
}
