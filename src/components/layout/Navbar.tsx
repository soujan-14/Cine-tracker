'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Search, UserCircle2, LogOut, Menu, X, Bell } from 'lucide-react';
import { motion } from 'framer-motion';
import { Logo } from '@/components/ui/Logo';
import { useAuth } from '@/contexts/AuthContext';

const mainNavLinks = [
  { label: 'Home', href: '/' },
  { label: 'Discover', href: '/discover' },
  { label: 'Box Office', href: '/box-office' },
  { label: 'Profile', href: '/profile' },
];

const subNavLinks = [
  { label: 'Home', href: '/' },
  { label: 'Trending', href: '/#trending' },
  { label: 'Top Rated', href: '/#top-rated' },
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

  function isActive(href: string): boolean {
    if (href.startsWith('/#')) return false;
    return href === '/'
      ? pathname === '/'
      : pathname === href || pathname?.startsWith(href + '/');
  }

  return (
    <>
      <header
        className={`sticky top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? 'bg-[#0B0B0B]/98 backdrop-blur-xl shadow-2xl shadow-black/60 border-b border-white/5'
            : 'bg-gradient-to-b from-[#0B0B0B]/95 via-[#0B0B0B]/70 to-transparent'
        }`}
      >
        <div className="mx-auto flex max-w-[1800px] items-center justify-between px-4 py-3 sm:px-8 lg:px-16 lg:py-4">
          <div className="flex items-center gap-10">
            <Link
              href="/"
              className="group focus:outline-none shrink-0 relative"
              aria-label="Cine Tracker Home"
            >
              <motion.div
                whileHover={{ scale: 1.03 }}
                transition={{ type: 'spring', stiffness: 400, damping: 20 }}
              >
                <Logo size={36} showText textSize="lg" />
              </motion.div>
            </Link>

            <nav className="hidden xl:flex items-center gap-1">
              {mainNavLinks.map((link) => {
                const active = isActive(link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="relative group px-4 py-2"
                  >
                    <motion.span
                      className={`relative inline-block text-sm font-semibold transition-all duration-300 ease-out tracking-wide ${
                        active
                          ? 'text-white'
                          : 'text-white/60 group-hover:text-white'
                      }`}
                      animate={active ? { letterSpacing: '0.05em' } : {}}
                      whileHover={{
                        letterSpacing: active ? '0.08em' : '0.05em',
                        y: -1,
                      }}
                      transition={{ duration: 0.3, ease: 'easeOut' }}
                    >
                      {link.label}
                    </motion.span>
                    <motion.span
                      className="absolute bottom-0 left-1/2 -translate-x-1/2 h-[2px] bg-[#E50914] rounded-full"
                      initial={false}
                      animate={{
                        width: active ? '60%' : '0%',
                        opacity: active ? 1 : 0,
                      }}
                      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                    />
                    <motion.span
                      className="absolute bottom-0 left-1/2 -translate-x-1/2 h-[2px] bg-white/30 rounded-full w-0 group-hover:w-[40%] group-hover:opacity-100 opacity-0"
                      whileHover={{
                        width: active ? '0%' : '40%',
                        opacity: active ? 0 : 1,
                      }}
                      transition={{ duration: 0.3 }}
                    />
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <motion.div whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.95 }}>
              <Link
                href="/discover"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white/70 transition-all duration-300 hover:bg-white/10 hover:text-white border border-white/5 hover:border-white/15"
                aria-label="Search movies"
              >
                <Search className="h-[18px] w-[18px]" />
              </Link>
            </motion.div>

            <button
              className="hidden h-10 w-10 sm:flex shrink-0 items-center justify-center rounded-full text-white/50 transition-all duration-300 hover:bg-white/10 hover:text-white border border-white/5 hover:border-white/15"
              aria-label="Notifications"
            >
              <Bell className="h-[18px] w-[18px]" />
            </button>

            {!isLoading && (
              <>
                {user ? (
                  <div className="flex items-center gap-2">
                    <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                      <Link
                        href="/profile"
                        className="hidden items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 sm:px-4 py-2 text-sm text-white/80 transition-all duration-300 hover:bg-white/10 hover:text-white hover:border-white/20 sm:flex"
                      >
                        <UserCircle2 className="h-4 w-4 shrink-0 text-[#E50914]" />
                        <span className="hidden max-w-[120px] truncate font-semibold sm:inline">
                          {user.name}
                        </span>
                      </Link>
                    </motion.div>
                    <motion.div whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.95 }}>
                      <Link
                        href="/profile"
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white/70 transition-all duration-300 hover:bg-white/10 hover:text-white sm:hidden border border-white/5 hover:border-white/15"
                        aria-label="Profile"
                      >
                        <UserCircle2 className="h-5 w-5" />
                      </Link>
                    </motion.div>
                    <motion.button
                      onClick={handleLogout}
                      whileHover={{ scale: 1.08 }}
                      whileTap={{ scale: 0.95 }}
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white/50 transition-all duration-300 hover:bg-red-500/10 hover:text-red-400 border border-white/5 hover:border-red-500/20"
                      aria-label="Sign out"
                      title="Sign out"
                    >
                      <LogOut className="h-[18px] w-[18px]" />
                    </motion.button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 sm:gap-3">
                    <motion.div whileHover={{ y: -1 }} whileTap={{ scale: 0.97 }}>
                      <Link
                        href="/login"
                        className="shrink-0 text-xs sm:text-sm font-semibold text-white/70 transition-all duration-300 hover:text-white tracking-wide"
                      >
                        Sign In
                      </Link>
                    </motion.div>
                    <motion.div
                      whileHover={{ scale: 1.04, boxShadow: '0 0 30px rgba(229, 9, 20, 0.35)' }}
                      whileTap={{ scale: 0.96 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                    >
                      <Link
                        href="/signup"
                        className="shrink-0 rounded-md bg-gradient-to-r from-[#E50914] to-[#ff1a25] px-4 sm:px-5 py-2 text-xs sm:text-sm font-bold text-white transition-all duration-300 shadow-lg shadow-red-900/30 tracking-wide"
                      >
                        Get Started
                      </Link>
                    </motion.div>
                  </div>
                )}
              </>
            )}

            <motion.button
              onClick={() => setMobileMenuOpen((v) => !v)}
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.95 }}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white/80 transition-all duration-300 hover:bg-white/10 hover:text-white xl:hidden border border-white/5 hover:border-white/15"
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </motion.button>
          </div>
        </div>

        <div className="border-t border-white/5 bg-gradient-to-b from-black/40 to-black/20 backdrop-blur-sm">
          <div className="mx-auto max-w-[1800px] px-4 sm:px-8 lg:px-16">
            <nav className="flex items-center justify-center gap-1 sm:gap-2 overflow-x-auto py-3 scrollbar-hide">
              {subNavLinks.map((link, index) => {
                const active = isActive(link.href);
                return (
                  <motion.div
                    key={link.href}
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.04, duration: 0.35, ease: 'easeOut' }}
                  >
                    <Link
                      href={link.href}
                      className={`group relative shrink-0 rounded-lg px-4 sm:px-5 py-2 text-xs sm:text-sm font-semibold transition-all duration-300 ease-out inline-flex items-center min-h-[40px] tracking-wide ${
                        active
                          ? 'bg-gradient-to-r from-[#E50914]/15 to-[#ff1a25]/10 text-white border border-[#E50914]/25 shadow-sm shadow-red-900/20'
                          : 'text-white/55 hover:bg-white/5 hover:text-white border border-transparent hover:border-white/10'
                      }`}
                    >
                      <motion.span
                        whileHover={{
                          letterSpacing: active ? '0.08em' : '0.04em',
                          y: -0.5,
                        }}
                        transition={{ duration: 0.25, ease: 'easeOut' }}
                      >
                        {link.label}
                      </motion.span>
                      {active && (
                        <motion.span
                          layoutId="activeSubNavPill"
                          className="absolute bottom-1 left-1/2 -translate-x-1/2 h-[3px] w-6 rounded-full bg-gradient-to-r from-[#E50914] to-[#ff3b47] shadow-[0_0_8px_rgba(229,9,20,0.6)]"
                          transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                        />
                      )}
                    </Link>
                  </motion.div>
                );
              })}
            </nav>
          </div>
        </div>
      </header>

      {mobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm xl:hidden"
          onClick={() => setMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed top-0 right-0 z-50 h-full w-[85%] max-w-sm transform bg-gradient-to-b from-[#0F0F0F] to-[#0B0B0B] shadow-2xl shadow-black/70 transition-transform duration-400 ease-out xl:hidden ${
          mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="Main navigation"
      >
        <div className="flex flex-col h-full border-l border-white/5">
          <div className="flex items-center justify-between border-b border-white/10 px-5 sm:px-6 py-4">
            <Link href="/" onClick={() => setMobileMenuOpen(false)} className="focus:outline-none">
              <Logo size={32} showText textSize="sm" />
            </Link>
            <motion.button
              onClick={() => setMobileMenuOpen(false)}
              whileHover={{ scale: 1.08, rotate: 90 }}
              whileTap={{ scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="flex h-10 w-10 items-center justify-center rounded-full text-white/70 hover:bg-white/10 hover:text-white border border-white/5"
              aria-label="Close menu"
            >
              <X className="h-5 w-5" />
            </motion.button>
          </div>

          <nav className="flex flex-col gap-1 px-3 sm:px-4 py-5">
            {mainNavLinks.map((link, index) => {
              const active = isActive(link.href);
              return (
                <motion.div
                  key={link.href}
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.06, duration: 0.3 }}
                >
                  <Link
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`group rounded-xl px-4 sm:px-5 py-3.5 text-base font-semibold min-h-[52px] flex items-center transition-all duration-300 tracking-wide ${
                      active
                        ? 'bg-gradient-to-r from-[#E50914]/20 to-transparent text-white border-l-4 border-[#E50914] pl-3'
                        : 'text-white/80 hover:bg-white/5 hover:text-white border-l-4 border-transparent hover:border-white/10 pl-3'
                    }`}
                  >
                    <span className="transition-all duration-300 group-hover:translate-x-1">
                      {link.label}
                    </span>
                  </Link>
                </motion.div>
              );
            })}
          </nav>

          <div className="mt-auto border-t border-white/10 px-5 sm:px-6 py-5 space-y-3">
            {!isLoading && (
              <>
                {user ? (
                  <>
                    <Link
                      href="/profile"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-4 min-h-[56px] transition-all duration-300 hover:bg-white/10 hover:border-white/20"
                    >
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#E50914] to-[#991318] flex items-center justify-center">
                        <UserCircle2 className="h-6 w-6 text-white flex-shrink-0" />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="truncate text-sm font-bold text-white tracking-wide">
                          {user.name}
                        </span>
                        <span className="truncate text-xs text-white/50">
                          {user.email}
                        </span>
                      </div>
                    </Link>
                    <motion.button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        handleLogout();
                      }}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3.5 min-h-[52px] text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all duration-300 font-semibold"
                    >
                      <LogOut className="h-5 w-5 flex-shrink-0" />
                      <span className="text-sm">Sign Out</span>
                    </motion.button>
                  </>
                ) : (
                  <div className="space-y-2.5">
                    <Link
                      href="/login"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex w-full items-center justify-center rounded-xl border border-white/15 px-4 py-3.5 min-h-[52px] text-sm font-bold text-white transition-all duration-300 hover:bg-white/5 hover:border-white/25 tracking-wide"
                    >
                      Sign In
                    </Link>
                    <Link
                      href="/signup"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-[#E50914] to-[#ff1a25] px-4 py-3.5 min-h-[52px] text-sm font-bold text-white transition-all duration-300 hover:shadow-lg hover:shadow-red-900/40 tracking-wide active:scale-[0.99]"
                    >
                      Get Started Free
                    </Link>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
