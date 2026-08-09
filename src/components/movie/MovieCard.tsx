'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Star, Ticket } from 'lucide-react';
import { useMemo } from 'react';
import { Movie } from '@/types/tmdb';
import { BoxOfficeData } from '@/types/boxoffice';
import { getImageUrl } from '@/services/tmdb';
import { BoxOfficeBadge } from '@/components/movie/BoxOfficeBadge';
import { getBookingAvailability } from '@/utils/booking';
import { predictMovieSuccess } from '@/lib/predictor';

interface MovieCardProps {
  movie: Movie;
  index?: number;
  /** When true, card fills its container width (for grid). Default: fixed width for scroll rows. */
  fluid?: boolean;
  boxOffice?: BoxOfficeData;
  /** Unused legacy props — kept for compatibility */
  badge?: string;
  badgeColor?: string;
}

export function MovieCard({ movie, index = 0, fluid = false, boxOffice }: MovieCardProps) {
  const rating = typeof movie.vote_average === 'number' ? movie.vote_average.toFixed(1) : 'N/A';
  const bookingState = useMemo(() => getBookingAvailability(movie.release_date), [movie.release_date]);
  const prediction = useMemo(() => predictMovieSuccess(movie), [movie]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.3, delay: Math.min(index * 0.05, 0.25) }}
      className={fluid ? 'w-full' : 'flex-shrink-0 w-[140px] sm:w-[160px]'}
    >
      <Link href={`/movie/${movie.id}`} className="group block focus:outline-none">
        <div className="relative aspect-[2/3] w-full overflow-hidden rounded-md bg-neutral-900">
          <Image
            src={getImageUrl(movie.poster_path, 'w500')}
            alt={movie.title || 'Movie Poster'}
            fill
            sizes={fluid ? '(max-width:640px) 50vw, (max-width:1024px) 33vw, 20vw' : '160px'}
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
          {/* Hover overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          {/* Rating on hover */}
          <div className="absolute bottom-2 left-2 flex items-center gap-1 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
            <span className="text-xs font-bold text-white">{rating}</span>
          </div>
          {bookingState.isEligible ? (
            <div className="absolute right-2 top-2 rounded-full bg-[#E50914]/95 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-white shadow-lg">
              <span className="flex items-center gap-1">
                <Ticket className="h-3 w-3" />
                Book Now
              </span>
            </div>
          ) : null}
          <div
            className={`absolute left-2 top-2 rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-wide shadow-lg ${
              prediction.verdict === 'Blockbuster'
                ? 'bg-emerald-500/90 text-white'
                : prediction.verdict === 'Hit'
                  ? 'bg-amber-500/90 text-black'
                  : 'bg-rose-500/90 text-white'
            }`}
          >
            {prediction.verdict}
          </div>
        </div>

        <p className="mt-2 line-clamp-1 text-xs font-medium text-white/70 transition-colors group-hover:text-white">
          {movie.title}
        </p>

        <BoxOfficeBadge data={boxOffice} />
      </Link>
    </motion.div>
  );
}
