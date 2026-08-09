'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { Movie } from '@/types/tmdb';
import { BoxOfficeCard } from './BoxOfficeCard';

interface Props {
  label: string;
  movies: Movie[];
  isLoading: boolean;
  isError?: boolean;
  /** Extract revenue value from a movie for display */
  getRevenue: (movie: Movie) => number | null;
  href?: string;
}

function RowSkeleton() {
  return (
    <div className="flex gap-3 overflow-hidden">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="flex-shrink-0 w-[150px] sm:w-[170px]">
          <div className="skeleton aspect-[2/3] w-full rounded-md" />
          <div className="mt-2 skeleton h-3 w-3/4 rounded" />
          <div className="mt-1 skeleton h-3 w-1/2 rounded" />
        </div>
      ))}
    </div>
  );
}

export function BoxOfficeRow({ label, movies, isLoading, isError, getRevenue, href }: Props) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.4 }}
    >
      {/* Header */}
      <div className="mb-4 flex items-center justify-between px-6 lg:px-12">
        <h2 className="text-lg font-bold text-white">{label}</h2>
        {href && (
          <Link
            href={href}
            className="flex items-center gap-1 text-xs font-medium text-white/40 transition hover:text-white"
          >
            See all <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        )}
      </div>

      {/* Content */}
      <div className="px-6 lg:px-12">
        {isError ? (
          <p className="py-8 text-sm text-white/40">Box office data unavailable.</p>
        ) : isLoading ? (
          <RowSkeleton />
        ) : movies.length === 0 ? (
          <p className="py-8 text-sm text-white/40">No data available.</p>
        ) : (
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {movies.map((movie, i) => (
              <BoxOfficeCard
                key={movie.id}
                movie={movie}
                rank={i + 1}
                revenue={getRevenue(movie)}
                index={i}
              />
            ))}
          </div>
        )}
      </div>
    </motion.section>
  );
}
