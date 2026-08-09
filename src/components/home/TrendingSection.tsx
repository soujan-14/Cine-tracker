'use client';

import { motion } from 'framer-motion';
import { useTrendingMovies } from '@/hooks/useTmdbMovies';
import { MovieCard } from '@/components/movie/MovieCard';
import { MovieCardSkeleton } from '@/components/movie/MovieCardSkeleton';
import { ApiErrorMessage } from '@/components/movie/ApiErrorMessage';
import { SectionHeader } from '@/components/ui/SectionHeader';

export function TrendingSection() {
  const { data, isLoading, isError, error, refetch } = useTrendingMovies();
  const movies = data?.results?.slice(0, 10) ?? [];

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.4 }}
    >
      <SectionHeader label="🔥 Trending Now" href="/discover?sort_by=popularity.desc" />

      {isError && (
        <div className="px-6 lg:px-12">
          <ApiErrorMessage
            title="Failed to load trending movies"
            message={error?.message ?? 'Unable to connect to TMDB service.'}
            onRetry={refetch}
          />
        </div>
      )}

      <div className="flex gap-3 overflow-x-auto px-6 pb-2 scrollbar-hide lg:px-12">
        {isLoading
          ? <MovieCardSkeleton count={8} />
          : movies.map((movie, i) => (
              <MovieCard key={movie.id} movie={movie} index={i} />
            ))}
      </div>
    </motion.section>
  );
}
