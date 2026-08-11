'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { UserCircle2, LogOut, Menu, X, Bell, ShieldCheck, Building2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { Logo } from '@/components/ui/Logo';
import { SearchBar } from '@/components/search/SearchBar';
import { useAuth } from '@/contexts/AuthContext';

const desktopCenterLinks = [
  { label: 'Discover', href: '/discover' },
  { label: 'Box Office', href: '/box-office' },
  { label: 'Trending', href: '/trending' },
];

const mobileMenuLinks = [
  { label: 'Home', href: '/' },
  { label: 'Trending', href: '/trending' },
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

  useEffect(() => setMobileMenuOpen(false), [pathname]);

  function handleLogout() {
    logout();
    router.push('/');
  }

  function isActive(href: string): boolean {
    return href === '/' ? pathname === '/' : pathname === href || pathname?.startsWith(href + '/');
  }

  function requestNotifications() {
    if ('Notification' in window && Notification.permission === 'default') {
      void Notification.requestPermission();
    }
  }

  return (
    <>
      <header
        className={`sticky top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? 'border-b border-white/5 bg-[#0B0B0B]/98 shadow-2xl shadow-black/60 backdrop-blur-xl'
            : 'bg-gradient-to-b from-[#0B0B0B]/95 via-[#0B0B0B]/70 to-transparent'
        }`}
      >
        <div className="mx-auto flex max-w-[1800px] items-center justify-between gap-4 px-4 py-3 sm:px-8 lg:px-12 lg:py-4">
          <div className="flex min-w-0 items-center gap-5 lg:gap-8">
            <Link href="/" aria-label="Cine Tracker Home" className="shrink-0">
              <motion.div whileHover={{ scale: 1.03 }} transition={{ duration: 0.2 }}>
                <Logo size={40} showText={false} />
              </motion.div>
            </Link>
            <Link
              href="/"
              className={`hidden items-center px-2 py-2 text-sm font-semibold tracking-wide transition lg:flex ${
                isActive('/') ? 'text-white' : 'text-white/60 hover:text-white'
              }`}
            >
              <span className="relative">
                Home
                {isActive('/') && <motion.span layoutId="desktop-nav-active" className="absolute -bottom-2 left-0 right-0 h-0.5 rounded-full bg-[#E50914] shadow-[0_0_10px_rgba(229,9,20,0.65)]" />}
              </span>
            </Link>
          </div>

          <nav className="hidden items-center justify-center gap-1 lg:flex" aria-label="Primary navigation">
            {desktopCenterLinks.map((link) => {
              const active = isActive(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={active ? 'page' : undefined}
                  className={`relative rounded-lg px-4 py-2 text-sm font-semibold tracking-wide transition hover:bg-white/5 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E50914]/70 ${
                    active ? 'text-white' : 'text-white/60'
                  }`}
                >
                  {link.label}
                  {active && <motion.span layoutId="desktop-nav-active" className="absolute -bottom-1 left-3 right-3 h-0.5 rounded-full bg-[#E50914] shadow-[0_0_10px_rgba(229,9,20,0.65)]" transition={{ duration: 0.2 }} />}
                </Link>
              );
            })}
          </nav>

          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <SearchBar />
            <button
              onClick={requestNotifications}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/5 text-white/50 transition hover:bg-white/10 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E50914]/70"
              aria-label="Notifications"
              title="Notifications"
            >
              <Bell className="h-[18px] w-[18px]" />
            </button>

            <div className="hidden items-center gap-2 lg:flex">
              {!isLoading && user?.role === 'ADMIN' ? (
                <Link href="/admin" title="Admin dashboard" aria-label="Admin dashboard" className="flex h-10 w-10 items-center justify-center rounded-full border border-white/5 text-white/50 hover:bg-white/10 hover:text-white">
                  <ShieldCheck className="h-4 w-4" />
                </Link>
              ) : null}
              {!isLoading && user?.role === 'DISTRIBUTOR' ? (
                <Link href="/distributor" title="Distributor dashboard" aria-label="Distributor dashboard" className="flex h-10 w-10 items-center justify-center rounded-full border border-white/5 text-white/50 hover:bg-white/10 hover:text-white">
                  <Building2 className="h-4 w-4" />
                </Link>
              ) : null}
              <Link
                href="/profile"
                aria-current={isActive('/profile') ? 'page' : undefined}
                className={`flex items-center gap-2 rounded-full border px-3 py-2 text-sm transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E50914]/70 ${
                  isActive('/profile') ? 'border-[#E50914]/30 bg-[#E50914]/10 text-white' : 'border-white/10 bg-white/5 text-white/80 hover:bg-white/10'
                }`}
              >
                <UserCircle2 className="h-4 w-4 text-[#E50914]" />
                <span className="max-w-[140px] truncate">{user?.name ?? 'Profile'}</span>
                {isActive('/profile') && <motion.span layoutId="profile-active" className="h-1.5 w-1.5 rounded-full bg-[#E50914] shadow-[0_0_8px_rgba(229,9,20,0.8)]" />}
              </Link>
              {!isLoading && user ? (
                <button onClick={handleLogout} aria-label="Sign out" className="flex h-10 w-10 items-center justify-center rounded-full border border-white/5 text-white/50 hover:bg-red-500/10 hover:text-red-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E50914]/70">
                  <LogOut className="h-4 w-4" />
                </button>
              ) : null}
            </div>

            <button
              onClick={() => setMobileMenuOpen((v) => !v)}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/5 text-white/80 transition hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E50914]/70 lg:hidden"
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-navigation"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </header>

      {mobileMenuOpen && <div className="fixed inset-0 z-40 bg-black/70 lg:hidden" onClick={() => setMobileMenuOpen(false)} aria-hidden="true" />}
      <aside
        id="mobile-navigation"
        className={`fixed top-0 right-0 z-50 h-full w-[85%] max-w-sm bg-[#0B0B0B] shadow-2xl transition-transform duration-300 lg:hidden ${mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}
        aria-label="Mobile navigation"
      >
        <div className="flex h-full flex-col border-l border-white/10">
          <div className="flex items-center justify-between border-b border-white/10 p-5">
            <Logo size={36} showText={false} />
            <button onClick={() => setMobileMenuOpen(false)} aria-label="Close menu" className="rounded-full p-2 text-white/70 hover:bg-white/10 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E50914]/70">
              <X />
            </button>
          </div>
          <nav className="flex flex-col gap-1 p-4" aria-label="Mobile primary navigation">
            {mobileMenuLinks.map((link) => {
              const active = isActive(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  aria-current={active ? 'page' : undefined}
                  className={`rounded-xl px-4 py-4 text-base font-semibold transition hover:bg-white/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E50914]/70 ${active ? 'bg-[#E50914]/10 text-white' : 'text-white/80'}`}
                >
                  <span className="flex items-center justify-between">
                    {link.label}
                    {active && <span className="h-1.5 w-1.5 rounded-full bg-[#E50914] shadow-[0_0_8px_rgba(229,9,20,0.8)]" />}
                  </span>
                </Link>
              );
            })}
            {user?.role === 'ADMIN' && <Link href="/admin" onClick={() => setMobileMenuOpen(false)} className="rounded-xl px-4 py-4 font-semibold text-white/80 hover:bg-white/5">Admin Dashboard</Link>}
            {user?.role === 'DISTRIBUTOR' && <Link href="/distributor" onClick={() => setMobileMenuOpen(false)} className="rounded-xl px-4 py-4 font-semibold text-white/80 hover:bg-white/5">Distributor Dashboard</Link>}
            {user && <button onClick={handleLogout} className="mt-2 rounded-xl px-4 py-4 text-left font-semibold text-red-400 hover:bg-red-500/10">Sign out</button>}
          </nav>
        </div>
      </aside>
    </>
  );
}
