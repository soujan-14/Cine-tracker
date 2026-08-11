'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { useTrendingMovies } from '@/hooks/useTmdbMovies';
import { MovieCard } from '@/components/movie/MovieCard';
import { MovieCardSkeleton } from '@/components/movie/MovieCardSkeleton';
import { ApiErrorMessage } from '@/components/movie/ApiErrorMessage';

export function TrendingSection() {
  const { data, isLoading, isError, error, refetch } = useTrendingMovies();
  const movies = data?.results?.slice(0, 10) ?? [];

  return (
    <motion.section
      id="trending"
      className="scroll-mt-28"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.4 }}
    >
      <div className="mb-4 flex items-center justify-between px-6 lg:px-12">
        <h2 className="text-lg font-bold text-white">🔥 Trending</h2>
        <Link
          href="/trending"
          className="group flex items-center gap-1 rounded-md px-2 py-1 text-xs font-semibold text-white/55 transition hover:bg-white/5 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E50914]/70"
        >
          View All
          <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
        </Link>
      </div>
      {isError && <div className="px-6 lg:px-12"><ApiErrorMessage title="Failed to load trending movies" message={error?.message ?? 'Unable to connect to TMDB service.'} onRetry={refetch} /></div>}
      <div className="flex snap-x gap-3 overflow-x-auto px-6 pb-2 scroll-smooth scrollbar-hide lg:px-12">
        {isLoading ? <MovieCardSkeleton count={8} /> : movies.map((movie, i) => <MovieCard key={movie.id} movie={movie} index={i} />)}
      </div>
    </motion.section>
  );
}
