'use client';

import { useEffect, useState } from 'react';
import { useUpcomingMovies, useTrendingMovies } from '@/hooks/useTmdbMovies';
import { useFavorites } from '@/hooks/useUserLists';
import { useAuth } from '@/contexts/AuthContext';

const LAST_KEY = 'ct_notification_last_check';
const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

export function NotificationManager() {
  const { token } = useAuth();
  const { data: upcoming } = useUpcomingMovies();
  const { data: trending } = useTrendingMovies();
  const { data: favorites } = useFavorites(token);
  const [permissionGranted, setPermissionGranted] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || !('Notification' in window)) return;
    setPermissionGranted(Notification.permission === 'granted');
    const bell = document.querySelector('[aria-label="Notifications"]');
    if (!bell) return;
    const onBellClick = async () => setPermissionGranted((await Notification.requestPermission()) === 'granted');
    bell.addEventListener('click', onBellClick);
    return () => bell.removeEventListener('click', onBellClick);
  }, []);

  useEffect(() => {
    if (!permissionGranted) return;
    const now = Date.now();
    const last = Number(localStorage.getItem(LAST_KEY) || 0);
    if (now - last < WEEK_MS) return;

    const favoriteIds = new Set((favorites ?? []).map((movie) => movie.movieId));
    const favoriteUpcoming = (upcoming?.results ?? []).find((movie) => favoriteIds.has(movie.id));
    const firstUpcoming = upcoming?.results?.[0];
    const trendingMovie = trending?.results?.[0];

    if (favoriteUpcoming) {
      new Notification('⭐ Your favorite movie is coming soon!', { body: `${favoriteUpcoming.title} releases ${favoriteUpcoming.release_date || 'soon'}.` });
    } else if (firstUpcoming) {
      new Notification('🎬 New movie released!', { body: `${firstUpcoming.title} is coming soon.` });
    } else if (trendingMovie) {
      new Notification('🔥 Trending on Cine Tracker', { body: `${trendingMovie.title} is trending right now.` });
    }
    localStorage.setItem(LAST_KEY, String(now));
  }, [permissionGranted, favorites, upcoming, trending]);

  return null;
}
