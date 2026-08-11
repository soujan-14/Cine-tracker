'use client';

import { Heart, Bookmark, Loader2, Ticket, Play, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useFavorites, useWatchlist, useToggleFavorite, useToggleWatchlist } from '@/hooks/useUserLists';
import { useWatchProviders } from '@/hooks/useTmdbMovies';
import { detectUserCountry } from '@/utils/location';
import { getBookingUrl } from '@/utils/booking';
import { getBestOttUrl } from '@/utils/ott';

interface Props {
  movieId: number;
  movieTitle?: string;
  releaseDate?: string | null;
  status?: string | null;
}

export function ActionButtons({ movieId, movieTitle }: Props) {
  const { user, token } = useAuth();
  const { data: favorites } = useFavorites(token);
  const { data: watchlist } = useWatchlist(token);
  const toggleFav = useToggleFavorite(token);
  const toggleWatch = useToggleWatchlist(token);
  const { data: providers } = useWatchProviders(movieId);

  const isFav = favorites?.some((f) => f.movieId === movieId) ?? false;
  const isInWatchlist = watchlist?.some((w) => w.movieId === movieId) ?? false;
  const ottInfo = useMemo(() => (movieTitle ? getBestOttUrl(providers, movieTitle, 'IN') : null), [providers, movieTitle]);

  const handleBooking = async () => {
    if (!movieTitle) return;
    const country = await detectUserCountry();
    window.open(getBookingUrl(movieTitle, country), '_blank', 'noopener,noreferrer');
  };

  const handleWatch = () => {
    const url = ottInfo?.url;
    if (url) window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="flex flex-col flex-wrap items-stretch gap-2 sm:flex-row sm:items-center sm:gap-2">
      {!user ? (
        <Link href="/login" className="flex min-h-[44px] items-center justify-center rounded-md border border-white/20 bg-white/10 px-4 py-2 text-sm text-white transition hover:bg-white/20">Sign in to save</Link>
      ) : (
        <>
          <button onClick={() => toggleFav.mutate({ movieId, isFav })} disabled={toggleFav.isPending} title={isFav ? 'Remove from wishlist' : 'Add to wishlist'} className={`flex min-h-[44px] items-center gap-2 rounded-md border px-4 py-2 text-sm font-medium transition-all duration-200 ${isFav ? 'border-rose-500/40 bg-rose-500/15 text-rose-400 hover:bg-rose-500/25' : 'border-white/20 bg-white/10 text-white hover:bg-white/20'}`}>
            {toggleFav.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Heart className={`h-4 w-4 ${isFav ? 'fill-rose-400' : ''}`} />}
            <span>{isFav ? 'Wishlisted' : 'Wishlist'}</span>
          </button>
          <button onClick={() => toggleWatch.mutate({ movieId, isInList: isInWatchlist })} disabled={toggleWatch.isPending} title={isInWatchlist ? 'Remove from watchlist' : 'Add to watchlist'} className={`flex min-h-[44px] items-center gap-2 rounded-md border px-4 py-2 text-sm font-medium transition-all duration-200 ${isInWatchlist ? 'border-[#E50914]/40 bg-[#E50914]/15 text-[#E50914] hover:bg-[#E50914]/25' : 'border-white/20 bg-white/10 text-white hover:bg-white/20'}`}>
            {toggleWatch.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Bookmark className={`h-4 w-4 ${isInWatchlist ? 'fill-[#E50914]' : ''}`} />}
            <span>{isInWatchlist ? 'In Watchlist' : 'Watchlist'}</span>
          </button>
        </>
      )}

      {ottInfo ? (
        <button onClick={handleWatch} title={`Watch on ${ottInfo.platformName}`} className="flex min-h-[44px] items-center justify-center gap-2 rounded-md bg-[#E50914] px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-[#E50914]/25 transition hover:bg-[#B20710] active:scale-[0.98]">
          <Play className="h-4 w-4 fill-white" /> Watch Now <ExternalLink className="h-3.5 w-3.5 opacity-70" />
        </button>
      ) : null}

      {movieTitle ? (
        <button onClick={handleBooking} title="Book tickets in your city" className={`flex min-h-[44px] items-center justify-center gap-2 rounded-md px-5 py-2.5 text-sm font-semibold transition active:scale-[0.98] ${ottInfo ? 'border border-white/20 bg-white/5 text-white hover:bg-white/10' : 'bg-[#E50914] text-white shadow-lg shadow-[#E50914]/25 hover:bg-[#B20710]'}`}>
          <Ticket className="h-4 w-4" /> Book Tickets
        </button>
      ) : null}
    </div>
  );
}
