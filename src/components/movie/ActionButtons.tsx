'use client';

import { Heart, Bookmark, Loader2, Ticket } from 'lucide-react';
import Link from 'next/link';
import { useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {
  useFavorites,
  useWatchlist,
  useToggleFavorite,
  useToggleWatchlist,
} from '@/hooks/useUserLists';
import { getBookingAvailability, getBookingUrl } from '@/utils/booking';

interface Props {
  movieId: number;
  movieTitle?: string;
  releaseDate?: string | null;
  status?: string | null;
}

export function ActionButtons({ movieId, movieTitle, releaseDate, status }: Props) {
  const { user, token } = useAuth();

  const { data: favorites } = useFavorites(token);
  const { data: watchlist } = useWatchlist(token);
  const toggleFav = useToggleFavorite(token);
  const toggleWatch = useToggleWatchlist(token);

  const isFav = favorites?.some((f) => f.movieId === movieId) ?? false;
  const isInWatchlist = watchlist?.some((w) => w.movieId === movieId) ?? false;

  const bookingState = useMemo(() => getBookingAvailability(releaseDate, status), [releaseDate, status]);

  const handleBooking = (platform: 'bookmyshow' | 'paytm') => {
    if (!movieTitle) return;
    window.open(getBookingUrl(movieTitle, platform), '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      {!user ? (
        <Link
          href="/login"
          className="rounded border border-white/20 bg-white/10 px-4 py-2 text-xs text-white transition hover:bg-white/20"
        >
          Sign in to save
        </Link>
      ) : null}
      <button
        onClick={() => toggleFav.mutate({ movieId, isFav })}
        disabled={toggleFav.isPending}
        title={isFav ? 'Remove from favorites' : 'Add to favorites'}
        className={`flex items-center gap-2 rounded border px-4 py-2 text-sm font-medium transition-all duration-200 ${
          isFav
            ? 'border-rose-500/40 bg-rose-500/15 text-rose-400 hover:bg-rose-500/25'
            : 'border-white/20 bg-white/10 text-white hover:bg-white/20'
        }`}
      >
        {toggleFav.isPending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Heart className={`h-4 w-4 ${isFav ? 'fill-rose-400' : ''}`} />
        )}
        {isFav ? 'Favorited' : 'Favorite'}
      </button>

      <button
        onClick={() => toggleWatch.mutate({ movieId, isInList: isInWatchlist })}
        disabled={toggleWatch.isPending}
        title={isInWatchlist ? 'Remove from watchlist' : 'Add to watchlist'}
        className={`flex items-center gap-2 rounded border px-4 py-2 text-sm font-medium transition-all duration-200 ${
          isInWatchlist
            ? 'border-[#E50914]/40 bg-[#E50914]/15 text-[#E50914] hover:bg-[#E50914]/25'
            : 'border-white/20 bg-white/10 text-white hover:bg-white/20'
        }`}
      >
        {toggleWatch.isPending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Bookmark className={`h-4 w-4 ${isInWatchlist ? 'fill-[#E50914]' : ''}`} />
        )}
        {isInWatchlist ? 'In Watchlist' : 'Watchlist'}
      </button>

      {bookingState.isEligible && movieTitle ? (
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleBooking('bookmyshow')}
            title="Book tickets in your city"
            className="flex items-center gap-2 rounded bg-[#E50914] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#B20710]"
          >
            <Ticket className="h-4 w-4" />
            Book Tickets
          </button>
          <button
            onClick={() => handleBooking('paytm')}
            title="Book tickets in your city"
            className="rounded border border-[#E50914]/40 bg-[#E50914]/10 px-3 py-2 text-xs font-medium text-[#E50914] transition hover:bg-[#E50914]/20"
          >
            Paytm
          </button>
        </div>
      ) : null}
    </div>
  );
}
