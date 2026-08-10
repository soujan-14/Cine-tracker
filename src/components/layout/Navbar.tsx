'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Search, UserCircle2, LogOut, Menu, X } from 'lucide-react';
import { Logo } from '@/components/ui/Logo';
import { useAuth } from '@/contexts/AuthContext';

const navLinks = [
  { label: 'Home', href: '/' },
  { label: 'Discover', href: '/discover' },
  { label: 'Box Office', href: '/box-office' },
];

const subLinks = [
  { label: 'Home', href: '/' },
  { label: 'Discover', href: '/discover' },
  { label: 'Box Office', href: '/box-office' },
  { label: 'Profile', href: '/profile' },
];

export function Navbar() {
  const { user, logout, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  function handleLogout() {
    logout();
    router.push('/');
  }

  return (
    <>
      <header
        className={`sticky top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-[#141414]/95 backdrop-blur-md shadow-lg shadow-black/40 border-b border-white/5'
            : 'bg-gradient-to-b from-black/90 via-black/60 to-transparent'
        }`}
      >
        <div className="mx-auto flex max-w-[1800px] items-center justify-between px-4 py-3 sm:px-6 lg:px-12 lg:py-4">
          {/* Left: Logo */}
          <Link href="/" className="group focus:outline-none shrink-0" aria-label="Cine Tracker Home">
            <Logo size={36} showText textSize="lg" />
          </Link>

          {/* Center nav (desktop) */}
          <nav className="hidden items-center gap-6 lg:flex">
            {navLinks.map((link) => {
              const active =
                link.href === '/'
                  ? pathname === '/'
                  : pathname === link.href || pathname?.startsWith(link.href + '/');
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`relative text-sm font-medium transition-colors py-1 ${
                    active ? 'text-white' : 'text-white/60 hover:text-white'
                  }`}
                >
                  {link.label}
                  {active && (
                    <span className="absolute -bottom-0.5 left-0 right-0 h-0.5 bg-[#E50914] rounded-full" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right */}
          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/discover"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white/70 transition hover:bg-white/10 hover:text-white"
              aria-label="Search movies"
            >
              <Search className="h-5 w-5" />
            </Link>

            {/* Auth - show across all sizes but adjust */}
            {!isLoading && (
              <>
                {user ? (
                  <div className="flex items-center gap-2">
                    <Link
                      href="/profile"
                      className="hidden items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-white/80 transition hover:bg-white/10 hover:text-white sm:flex"
                    >
                      <UserCircle2 className="h-4 w-4 shrink-0" />
                      <span className="hidden max-w-[100px] truncate font-medium sm:inline">
                        {user.name}
                      </span>
                    </Link>
                    <Link
                      href="/profile"
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white/70 transition hover:bg-white/10 hover:text-white sm:hidden"
                      aria-label="Profile"
                    >
                      <UserCircle2 className="h-5 w-5" />
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white/50 transition hover:bg-white/10 hover:text-white"
                      aria-label="Sign out"
                      title="Sign out"
                    >
                      <LogOut className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 sm:gap-3">
                    <Link
                      href="/login"
                      className="shrink-0 text-xs font-medium text-white/70 transition hover:text-white sm:text-sm"
                    >
                      Sign in
                    </Link>
                    <Link
                      href="/signup"
                      className="shrink-0 rounded-md bg-[#E50914] px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-[#B20710] active:scale-95 sm:px-4 sm:text-sm"
                    >
                      Sign up
                    </Link>
                  </div>
                )}
              </>
            )}

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileMenuOpen((v) => !v)}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white/80 transition hover:bg-white/10 hover:text-white lg:hidden"
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Sub-header / Secondary nav */}
        <div className="border-t border-white/5 bg-black/20 backdrop-blur-sm">
          <div className="mx-auto max-w-[1800px] px-4 sm:px-6 lg:px-12">
            <nav className="flex items-center gap-1 overflow-x-auto py-2 sm:gap-2">
              {subLinks.map((link) => {
                const active =
                  link.href === '/'
                    ? pathname === '/'
                    : pathname === link.href || pathname?.startsWith(link.href + '/');
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`shrink-0 rounded-md px-3 py-1.5 text-xs font-medium transition sm:text-sm min-h-[36px] inline-flex items-center ${
                      active
                        ? 'bg-[#E50914]/10 text-[#E50914]'
                        : 'text-white/55 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      </header>

      {/* Mobile slide-in overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Mobile drawer */}
      <aside
        className={`fixed top-0 right-0 z-50 h-full w-[80%] max-w-sm transform bg-[#141414] shadow-2xl shadow-black/60 transition-transform duration-300 lg:hidden ${
          mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="Main navigation"
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
            <Link href="/" onClick={() => setMobileMenuOpen(false)} className="focus:outline-none">
              <Logo size={32} showText textSize="sm" />
            </Link>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="flex h-9 w-9 items-center justify-center rounded-full text-white/70 hover:bg-white/10 hover:text-white"
              aria-label="Close menu"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <nav className="flex flex-col gap-1 px-3 py-5">
            {subLinks.map((link) => {
              const active =
                link.href === '/'
                  ? pathname === '/'
                  : pathname === link.href || pathname?.startsWith(link.href + '/');
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`rounded-md px-4 py-3 text-base font-medium min-h-[48px] flex items-center transition ${
                    active
                      ? 'bg-[#E50914]/15 text-[#E50914]'
                      : 'text-white/80 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <div className="mt-auto border-t border-white/10 px-5 py-5 space-y-3">
            {!isLoading && (
              <>
                {user ? (
                  <>
                    <Link
                      href="/profile"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 rounded-md border border-white/10 bg-white/5 px-4 py-3 min-h-[48px]"
                    >
                      <UserCircle2 className="h-5 w-5 text-[#E50914] flex-shrink-0" />
                      <div className="flex flex-col min-w-0">
                        <span className="truncate text-sm font-semibold text-white">
                          {user.name}
                        </span>
                        <span className="truncate text-xs text-white/50">
                          {user.email}
                        </span>
                      </div>
                    </Link>
                    <button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        handleLogout();
                      }}
                      className="flex w-full items-center gap-3 rounded-md border border-white/10 bg-white/5 px-4 py-3 min-h-[48px] text-white/80 hover:bg-white/10"
                    >
                      <LogOut className="h-5 w-5 flex-shrink-0" />
                      <span className="text-sm font-medium">Sign out</span>
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/login"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex w-full items-center justify-center rounded-md border border-white/15 px-4 py-3 min-h-[48px] text-sm font-semibold text-white transition hover:bg-white/5"
                    >
                      Sign in
                    </Link>
                    <Link
                      href="/signup"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex w-full items-center justify-center rounded-md bg-[#E50914] px-4 py-3 min-h-[48px] text-sm font-semibold text-white transition hover:bg-[#B20710] active:scale-[0.98]"
                    >
                      Get Started Free
                    </Link>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
