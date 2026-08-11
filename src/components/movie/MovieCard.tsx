'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Play, Star, Ticket, XCircle } from 'lucide-react';
import { MouseEvent, useMemo } from 'react';
import { Movie } from '@/types/tmdb';
import { BoxOfficeData } from '@/types/boxoffice';
import { getImageUrl } from '@/services/tmdb';
import { getBookingAvailability, getBookingUrl } from '@/utils/booking';
import { detectUserCountry } from '@/utils/location';
import { predictMovieSuccess } from '@/lib/predictor';
import { isOttAvailable, getDefaultOttUrl } from '@/utils/ott';

interface MovieCardProps { movie: Movie; index?: number; fluid?: boolean; boxOffice?: BoxOfficeData; badge?: string; badgeColor?: string; }
function formatBoxOffice(n: number): string { if (n >= 1_000_000_000) return `$${(n / 1_000_000_000).toFixed(1)}B`; if (n >= 1_000_000) return `$${Math.round(n / 1_000_000)}M`; if (n >= 1_000) return `$${Math.round(n / 1_000)}K`; return `$${n}`; }

export function MovieCard({ movie, index = 0, fluid = false, boxOffice }: MovieCardProps) {
  const rating = typeof movie.vote_average === 'number' ? movie.vote_average.toFixed(1) : 'N/A';
  const bookingState = useMemo(() => getBookingAvailability(movie.release_date), [movie.release_date]);
  const prediction = useMemo(() => predictMovieSuccess(movie), [movie]);
  const ottAvailable = useMemo(() => isOttAvailable(movie), [movie]);
  const gross = boxOffice?.worldwide ?? boxOffice?.domestic;
  const boxOfficeDisplay = gross ? formatBoxOffice(gross) : null;
  const ottUrl = getDefaultOttUrl(movie.title);

  const handleBooking = async (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault(); event.stopPropagation();
    const country = await detectUserCountry();
    window.open(getBookingUrl(movie.title, country), '_blank', 'noopener,noreferrer');
  };

  return <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-40px' }} transition={{ duration: 0.3, delay: Math.min(index * 0.05, 0.25) }} className={fluid ? 'w-full' : 'flex-shrink-0 w-[140px] sm:w-[170px] md:w-[180px]'}>
    <div className="group flex h-full flex-col rounded-md bg-[#141414] transition-all duration-300 hover:bg-[#1a1a1a]">
      <Link href={`/movie/${movie.id}`} className="block focus:outline-none"><div className="relative aspect-[2/3] w-full overflow-hidden rounded-t-md bg-neutral-900"><Image src={getImageUrl(movie.poster_path, 'w500')} alt={movie.title || 'Movie Poster'} fill sizes={fluid ? '(max-width:640px) 50vw, (max-width:1024px) 33vw, 20vw' : '180px'} className="object-cover transition-transform duration-300 group-hover:scale-105" /><div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity duration-300 md:group-hover:opacity-100" /><div className="absolute left-2 top-2 rounded-full px-2 py-1 text-[9px] font-semibold uppercase tracking-wide shadow-lg backdrop-blur-sm md:text-[10px]" style={prediction.verdict === 'Blockbuster' ? { backgroundColor: 'rgba(16,185,129,.9)', color: 'white' } : prediction.verdict === 'Hit' ? { backgroundColor: 'rgba(245,158,11,.9)', color: 'black' } : { backgroundColor: 'rgba(244,63,94,.9)', color: 'white' }}>{prediction.verdict}</div></div></Link>
      <div className="flex flex-1 flex-col gap-2 p-2 md:p-3"><Link href={`/movie/${movie.id}`}><h3 className="line-clamp-1 text-xs font-semibold text-white md:text-sm">{movie.title}</h3></Link><div className="flex flex-wrap items-center gap-x-2 text-[10px] md:text-[11px]"><span className="flex items-center gap-1 text-amber-400"><Star className="h-3 w-3 fill-amber-400" />{rating}</span>{boxOfficeDisplay && <span className="font-semibold text-[#E50914]">💰 {boxOfficeDisplay}</span>}</div>
        <div className="mt-1 flex flex-col gap-2 sm:flex-row">{ottAvailable ? <a href={ottUrl} target="_blank" rel="noopener noreferrer" className="flex flex-1 items-center justify-center gap-1 rounded bg-[#E50914] px-2 py-1.5 text-[10px] font-bold text-white hover:bg-[#f6121d] md:text-[11px]"><Play className="h-3 w-3 fill-white" />Play Now</a> : bookingState.isEligible ? <button onClick={handleBooking} title="Book tickets in your city" className="flex flex-1 items-center justify-center gap-1 rounded bg-[#E50914] px-2 py-1.5 text-[10px] font-bold text-white hover:bg-[#f6121d] md:text-[11px]"><Ticket className="h-3 w-3" />Book</button> : <span className="flex flex-1 items-center justify-center gap-1 rounded bg-white/10 px-2 py-1.5 text-[10px] font-semibold text-white/40 md:text-[11px]"><XCircle className="h-3 w-3" />N/A</span>}
          {bookingState.isEligible && ottAvailable ? <button onClick={handleBooking} title="Book tickets in your city" className="flex flex-1 items-center justify-center gap-1 rounded border border-white/20 bg-white/5 px-2 py-1.5 text-[10px] font-semibold text-white hover:bg-white/10 md:text-[11px]"><Ticket className="h-3 w-3" />Book</button> : null}</div>
      </div>
    </div>
  </motion.div>;
}
