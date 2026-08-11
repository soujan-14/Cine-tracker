'use client';

import { useEffect, useState } from 'react';
import { Bell } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useFavorites } from '@/hooks/useUserLists';

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

export function NotificationBell() {
  const { token } = useAuth();
  const { data: favorites } = useFavorites(token);
  const [enabled, setEnabled] = useState(false);

  async function requestPermission() {
    if (!('Notification' in window)) return;
    const permission = await Notification.requestPermission();
    setEnabled(permission === 'granted');
    if (permission === 'granted') await sendDigest();
  }

  async function sendDigest() {
    try {
      const last = Number(localStorage.getItem('ct_last_notification') || 0);
      if (Date.now() - last < WEEK_MS) return;
      const [upcomingResponse, trendingResponse] = await Promise.all([
        fetch('/api/tmdb/upcoming?page=1'),
        fetch('/api/tmdb/trending?page=1'),
      ]);
      const upcoming = upcomingResponse.ok ? await upcomingResponse.json() : { results: [] };
      const trending = trendingResponse.ok ? await trendingResponse.json() : { results: [] };
      const nextMovie = upcoming.results?.[0];
      const trendingMovie = trending.results?.[0];
      if (nextMovie) new Notification('🎬 New movie release coming up!', { body: nextMovie.title });
      else if (trendingMovie) new Notification('🔥 Trending movies on Cine Tracker', { body: trendingMovie.title });
      const favorite = favorites?.[0];
      if (favorite) setTimeout(() => new Notification('⭐ Your favorite movie is on your radar', { body: `Movie ID ${favorite.movieId}` }), 1500);
      localStorage.setItem('ct_last_notification', String(Date.now()));
    } catch (error) {
      console.error('[notifications]', error);
    }
  }

  useEffect(() => {
    if (!enabled) return;
    const timer = window.setInterval(sendDigest, WEEK_MS);
    return () => window.clearInterval(timer);
  }, [enabled, favorites]);

  return <button onClick={requestPermission} className="hidden h-10 w-10 sm:flex shrink-0 items-center justify-center rounded-full text-white/50 transition-all duration-300 hover:bg-white/10 hover:text-white border border-white/5 hover:border-white/15" aria-label="Enable notifications" title="Enable movie notifications"><Bell className="h-[18px] w-[18px]" /></button>;
}
