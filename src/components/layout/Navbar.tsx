'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { UserCircle2, LogOut, Menu, X, ShieldCheck, Building2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { Logo } from '@/components/ui/Logo';
import { SearchBar } from '@/components/search/SearchBar';
import { NotificationBell } from '@/components/layout/NotificationBell';
import { useAuth } from '@/contexts/AuthContext';

const mainNavLinks = [
  { label: 'Home', href: '/' },
  { label: 'Trending', href: '/#trending' },
  { label: 'Discover', href: '/discover' },
  { label: 'Box Office', href: '/box-office' },
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
    if (href.startsWith('/#')) return pathname === '/';
    return href === '/' ? pathname === '/' : pathname === href || pathname?.startsWith(href + '/');
  }

  return (
    <>
      <header className={`sticky top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? 'border-b border-white/5 bg-[#0B0B0B]/98 shadow-2xl shadow-black/60 backdrop-blur-xl' : 'bg-gradient-to-b from-[#0B0B0B]/95 via-[#0B0B0B]/70 to-transparent'}`}>
        <div className="mx-auto flex max-w-[1800px] items-center justify-between px-4 py-3 sm:px-8 lg:px-16 lg:py-4">
          <div className="flex min-w-0 items-center gap-6 lg:gap-10">
            <Link href="/" aria-label="Cine Tracker Home" className="shrink-0">
              <motion.div whileHover={{ scale: 1.03 }}>
                <Logo size={42} />
              </motion.div>
            </Link>
            <nav className="hidden xl:flex items-center gap-1" aria-label="Primary navigation">
              {mainNavLinks.map((link) => (
                <Link key={link.href} href={link.href} className={`rounded-lg px-4 py-2 text-sm font-semibold tracking-wide transition ${isActive(link.href) ? 'text-white' : 'text-white/60 hover:bg-white/5 hover:text-white'}`}>
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <SearchBar />
            <NotificationBell />
            {!isLoading && user && (
              <div className="hidden items-center gap-2 lg:flex">
                {user.role === 'ADMIN' ? <Link href="/admin" title="Admin dashboard" className="flex h-10 w-10 items-center justify-center rounded-full border border-white/5 text-white/50 hover:bg-white/10 hover:text-white" aria-label="Admin dashboard"><ShieldCheck className="h-4 w-4" /></Link> : null}
                {user.role === 'DISTRIBUTOR' ? <Link href="/distributor" title="Distributor dashboard" className="flex h-10 w-10 items-center justify-center rounded-full border border-white/5 text-white/50 hover:bg-white/10 hover:text-white" aria-label="Distributor dashboard"><Building2 className="h-4 w-4" /></Link> : null}
                <Link href="/profile" className="flex min-h-10 items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/80 hover:bg-white/10" aria-label="Profile"><UserCircle2 className="h-4 w-4 text-[#E50914]" />{user.name}</Link>
                <button onClick={handleLogout} aria-label="Sign out" className="flex h-10 w-10 items-center justify-center rounded-full border border-white/5 text-white/50 hover:bg-red-500/10 hover:text-red-400"><LogOut className="h-4 w-4" /></button>
              </div>
            )}
            {!isLoading && !user && <div className="hidden items-center gap-3 sm:flex"><Link href="/login" className="text-sm font-semibold text-white/70 hover:text-white">Sign In</Link><Link href="/signup" className="rounded-md bg-[#E50914] px-5 py-2 text-sm font-bold text-white">Get Started</Link></div>}
            <button onClick={() => setMobileMenuOpen((v) => !v)} className="flex h-10 w-10 items-center justify-center rounded-full border border-white/5 text-white/80 xl:hidden" aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'} aria-expanded={mobileMenuOpen}>
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </header>

      {mobileMenuOpen && <div className="fixed inset-0 z-40 bg-black/70 xl:hidden" onClick={() => setMobileMenuOpen(false)} aria-hidden="true" />}
      <aside className={`fixed top-0 right-0 z-50 h-full w-[85%] max-w-sm bg-[#0B0B0B] shadow-2xl transition-transform duration-300 xl:hidden ${mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`} aria-label="Mobile navigation">
        <div className="flex h-full flex-col border-l border-white/10">
          <div className="flex items-center justify-between border-b border-white/10 p-5">
            <Logo size={42} />
            <button onClick={() => setMobileMenuOpen(false)} aria-label="Close menu" className="rounded-full p-2 text-white/70 hover:bg-white/10 hover:text-white"><X className="h-5 w-5" /></button>
          </div>
          <nav className="flex flex-col gap-1 p-4" aria-label="Mobile primary navigation">
            {mainNavLinks.map((link) => <Link key={link.href} href={link.href} onClick={() => setMobileMenuOpen(false)} className="rounded-xl px-4 py-4 text-base font-semibold text-white/80 hover:bg-white/5">{link.label}</Link>)}
            <Link href="/profile" onClick={() => setMobileMenuOpen(false)} className="rounded-xl px-4 py-4 text-base font-semibold text-white/80 hover:bg-white/5">Profile</Link>
            {user?.role === 'ADMIN' && <Link href="/admin" onClick={() => setMobileMenuOpen(false)} className="rounded-xl px-4 py-4 font-semibold text-white/80">Admin Dashboard</Link>}
            {user?.role === 'DISTRIBUTOR' && <Link href="/distributor" onClick={() => setMobileMenuOpen(false)} className="rounded-xl px-4 py-4 font-semibold text-white/80">Distributor Dashboard</Link>}
          </nav>
        </div>
      </aside>
    </>
  );
}
