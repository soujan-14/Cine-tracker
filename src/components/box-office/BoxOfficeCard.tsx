'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Movie } from '@/types/tmdb';
import { getImageUrl } from '@/services/tmdb';
import { getHitStatus } from '@/utils/hitStatus';

interface Props {
  movie: Movie;
  rank: number;
  revenue: number | null;
  index?: number;
}

const RANK_MEDALS: Record<number, string> = { 1: '🥇', 2: '🥈', 3: '🥉' };

function fmtRevenue(n: number): string {
  if (n >= 1_000_000_000) return `$${(n / 1_000_000_000).toFixed(2)}B`;
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(0)}M`;
  return `$${n.toLocaleString()}`;
}

export function BoxOfficeCard({ movie, rank, revenue, index = 0 }: Props) {
  const medal = RANK_MEDALS[rank];
  const hitStatus = getHitStatus(movie);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.3, delay: Math.min(index * 0.05, 0.3) }}
      className="flex-shrink-0 w-[150px] sm:w-[170px]"
    >
      <Link href={`/movie/${movie.id}`} className="group block focus:outline-none">
        {/* Poster */}
        <div className="relative aspect-[2/3] w-full overflow-hidden rounded-md bg-neutral-900">
          <Image
            src={getImageUrl(movie.poster_path, 'w500')}
            alt={movie.title}
            fill
            sizes="170px"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />

          {/* Hover overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/10 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

          {/* Rank badge */}
          <div className="absolute top-2 left-2">
            {medal ? (
              <span className="text-xl leading-none">{medal}</span>
            ) : (
              <span className="rounded bg-black/70 px-1.5 py-0.5 text-xs font-black text-white/80 backdrop-blur-sm">
                #{rank}
              </span>
            )}
          </div>

          {/* Hit Status badge — bottom of poster */}
          <div className="absolute bottom-2 right-2">
            <span
              className={`flex items-center gap-1 rounded-full bg-black/70 px-2 py-0.5 text-[10px] font-bold backdrop-blur-sm ${hitStatus.color}`}
            >
              <span
                className={`inline-block h-1.5 w-1.5 flex-shrink-0 rounded-full ${hitStatus.dot}`}
              />
              {hitStatus.label}
            </span>
          </div>
        </div>

        {/* Info */}
        <p className="mt-2 line-clamp-1 text-xs font-semibold text-white/80 transition-colors group-hover:text-white">
          {movie.title}
        </p>

        {revenue ? (
          <p className="mt-0.5 text-xs font-black text-[#E50914]">
            💰 {fmtRevenue(revenue)}
          </p>
        ) : (
          <p className="mt-0.5 text-[10px] text-white/30">No data</p>
        )}
      </Link>
    </motion.div>
  );
}
