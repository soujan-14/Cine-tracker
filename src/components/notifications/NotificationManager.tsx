'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { Search, X, Bell, Loader2 } from 'lucide-react';
import { useUpcomingMovies, useTrendingMovies, useSearchMovies } from '@/hooks/useTmdbMovies';
import { useFavorites } from '@/hooks/useUserLists';
import { useAuth } from '@/contexts/AuthContext';
import { getImageUrl } from '@/services/tmdb';

const LAST_KEY = 'ct_notification_last_check';
const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

export function NotificationManager() {
  const router = useRouter();
  const { token } = useAuth();
  const { data: upcoming } = useUpcomingMovies();
  const { data: trending } = useTrendingMovies();
  const { data: favorites } = useFavorites(token);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [input, setInput] = useState('');
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const { data: searchData, isFetching } = useSearchMovies(query);
  const results = searchData?.results?.slice(0, 8) ?? [];

  useEffect(() => {
    if (!('Notification' in window)) return;
    setPermissionGranted(Notification.permission === 'granted');
    const bell = document.querySelector('[aria-label="Notifications"]');
    if (!bell) return;
    const onBellClick = async () => {
      const permission = await Notification.requestPermission();
      setPermissionGranted(permission === 'granted');
    };
    bell.addEventListener('click', onBellClick);
    return () => bell.removeEventListener('click', onBellClick);
  }, []);

  useEffect(() => {
    const searchButton = document.querySelector('[aria-label="Search movies"]');
    if (!searchButton) return;
    const onSearchClick = (event: Event) => {
      event.preventDefault();
      setSearchOpen(true);
    };
    searchButton.addEventListener('click', onSearchClick);
    return () => searchButton.removeEventListener('click', onSearchClick);
  }, []);

  useEffect(() => {
    if (!searchOpen) return;
    inputRef.current?.focus();
    const timer = window.setTimeout(() => setQuery(input.trim()), 300);
    return () => window.clearTimeout(timer);
  }, [input, searchOpen]);

  useEffect(() => {
    if (!permissionGranted) return;
    const now = Date.now();
    const last = Number(localStorage.getItem(LAST_KEY) || 0);
    if (now - last < WEEK_MS) return;
    const favoriteIds = new Set((favorites ?? []).map((movie) => movie.movieId));
    const favoriteUpcoming = (upcoming?.results ?? []).find((movie) => favoriteIds.has(movie.id));
    const firstUpcoming = upcoming?.results?.[0];
    const trendingMovie = trending?.results?.[0];
    if (favoriteUpcoming) new Notification('🎬 New movie released!', { body: `${favoriteUpcoming.title} is coming soon.` });
    else if (firstUpcoming) new Notification('🎬 New movie released!', { body: `${firstUpcoming.title} is coming soon.` });
    else if (trendingMovie) new Notification('🔥 Trending on Cine Tracker', { body: `${trendingMovie.title} is trending right now.` });
    localStorage.setItem(LAST_KEY, String(now));
  }, [permissionGranted, favorites, upcoming, trending]);

  function closeSearch() { setSearchOpen(false); setInput(''); setQuery(''); }
  function openResult(id: number) { closeSearch(); router.push(`/movie/${id}`); }

  return <>
    <AnimatePresence>
      {searchOpen && <motion.div className="fixed inset-0 z-[100] bg-black/90 p-4 backdrop-blur-xl sm:p-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
        <div className="mx-auto w-full max-w-3xl pt-4 sm:pt-12">
          <div className="flex items-center gap-3 rounded-2xl border border-white/15 bg-[#141414] px-4 py-3 shadow-2xl">
            {isFetching ? <Loader2 className="h-5 w-5 animate-spin text-white/50" /> : <Search className="h-5 w-5 text-white/50" />}
            <input ref={inputRef} value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => { if (e.key === 'Escape') closeSearch(); if (e.key === 'Enter' && results[0]) openResult(results[0].id); }} placeholder="Search movies…" className="w-full bg-transparent text-lg text-white outline-none" aria-label="Movie search" />
            <button onClick={closeSearch} aria-label="Close search" className="rounded-full p-2 text-white/60 hover:bg-white/10 hover:text-white"><X className="h-5 w-5" /></button>
          </div>
          <div className="mt-4 overflow-hidden rounded-2xl border border-white/10 bg-[#141414]">
            {query && results.length === 0 && !isFetching ? <p className="p-6 text-center text-white/50">No movies found.</p> : results.map((movie, index) => <button key={movie.id} onClick={() => openResult(movie.id)} className={`flex w-full items-center gap-4 border-b border-white/5 p-3 text-left hover:bg-white/5 ${index === 0 ? 'bg-white/[0.04]' : ''}`}><div className="relative h-16 w-11 overflow-hidden rounded-md bg-white/5">{movie.poster_path && <Image src={getImageUrl(movie.poster_path, 'w300')} alt={movie.title} fill sizes="44px" className="object-cover" />}</div><div className="min-w-0"><p className={`${index === 0 ? 'text-base font-bold' : 'text-sm font-semibold'} truncate text-white`}>{movie.title}</p><p className="text-xs text-white/45">{movie.release_date?.slice(0, 4) || '—'}</p></div></button>)}
          </div>
        </div>
      </motion.div>}
    </AnimatePresence>
    {!permissionGranted && 'Notification' in window ? <button onClick={async () => setPermissionGranted((await Notification.requestPermission()) === 'granted')} className="fixed bottom-5 right-5 z-40 hidden rounded-full border border-white/10 bg-[#141414] p-3 text-white/60 shadow-xl hover:text-white sm:flex" title="Enable movie notifications" aria-label="Enable movie notifications"><Bell className="h-5 w-5" /></button> : null}
  </>;
}
