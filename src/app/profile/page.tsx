'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Heart, Bookmark, UserCircle2, Film, LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useFavorites, useWatchlist } from '@/hooks/useUserLists';
import { useQueries } from '@tanstack/react-query';
import axios from 'axios';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { MovieCard } from '@/components/movie/MovieCard';
import { MovieCardSkeleton } from '@/components/movie/MovieCardSkeleton';
import { Movie } from '@/types/tmdb';

function useMoviesByIds(ids: number[]) {
  return useQueries({
    queries: ids.map((id) => ({
      queryKey: ['movie', 'details', id],
      queryFn: () =>
        axios.get<Movie>(`/api/tmdb/movie/${id}/details`).then((r) => r.data),
      staleTime: 1000 * 60 * 30,
      refetchOnWindowFocus: false,
    })),
  });
}

function EmptyState({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center gap-3 py-16 text-center">
      <Film className="h-10 w-10 text-white/20" />
      <p className="text-sm text-white/40">{label}</p>
    </div>
  );
}

function MovieGrid({ ids, loading }: { ids: number[]; loading: boolean }) {
  const queries = useMoviesByIds(ids);
  const isFetching = loading || queries.some((q) => q.isLoading);

  if (isFetching) {
    return (
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        <MovieCardSkeleton count={5} fluid />
      </div>
    );
  }

  const movies = queries.map((q) => q.data).filter(Boolean) as Movie[];
  if (!movies.length) return null;

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
      {movies.map((m) => (
        <MovieCard key={m.id} movie={m} fluid />
      ))}
    </div>
  );
}

export default function ProfilePage() {
  const router = useRouter();
  const { user, token, isLoading, logout } = useAuth();

  const { data: favorites, isLoading: loadingFavs } = useFavorites(token);
  const { data: watchlist, isLoading: loadingWatch } = useWatchlist(token);

  const favIds = favorites?.map((f) => f.movieId) ?? [];
  const watchIds = watchlist?.map((w) => w.movieId) ?? [];

  useEffect(() => {
    if (!isLoading && !user) router.replace('/login');
  }, [isLoading, user, router]);

  if (isLoading || !user) return null;

  return (
    <main className="min-h-screen bg-[#0B0B0B] text-white">
      <Navbar />

      <div className="mx-auto max-w-[1800px] px-6 pt-28 pb-16 lg:px-12">
        <div className="space-y-12">
          {/* User card */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between rounded-xl border border-white/10 bg-[#141414] p-6"
          >
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/10 text-white">
                <UserCircle2 className="h-7 w-7" />
              </div>
              <div>
                <p className="text-lg font-bold text-white">{user.name}</p>
                <p className="text-sm text-white/50">{user.email}</p>
              </div>
            </div>
            <button
              onClick={() => { logout(); router.push('/'); }}
              className="flex items-center gap-2 rounded border border-white/10 px-4 py-2 text-sm text-white/50 transition hover:border-red-500/40 hover:text-red-400"
            >
              <LogOut className="h-4 w-4" /> Logout
            </button>
          </motion.div>

          {/* Favorites */}
          <section>
            <div className="mb-5 flex items-center gap-2">
              <Heart className="h-5 w-5 fill-rose-400 text-rose-400" />
              <h2 className="text-xl font-bold text-white">Favorites</h2>
              {favorites && (
                <span className="rounded-full bg-rose-500/15 px-2.5 py-0.5 text-xs font-medium text-rose-400">
                  {favorites.length}
                </span>
              )}
            </div>
            {!loadingFavs && favIds.length === 0 ? (
              <EmptyState label="No favorites yet. Heart a movie to save it here." />
            ) : (
              <MovieGrid ids={favIds} loading={loadingFavs} />
            )}
          </section>

          {/* Watchlist */}
          <section>
            <div className="mb-5 flex items-center gap-2">
              <Bookmark className="h-5 w-5 fill-[#E50914] text-[#E50914]" />
              <h2 className="text-xl font-bold text-white">Watchlist</h2>
              {watchlist && (
                <span className="rounded-full bg-[#E50914]/15 px-2.5 py-0.5 text-xs font-medium text-[#E50914]">
                  {watchlist.length}
                </span>
              )}
            </div>
            {!loadingWatch && watchIds.length === 0 ? (
              <EmptyState label="Your watchlist is empty. Bookmark movies to watch later." />
            ) : (
              <MovieGrid ids={watchIds} loading={loadingWatch} />
            )}
          </section>
        </div>
      </div>

      <Footer />
    </main>
  );
}
