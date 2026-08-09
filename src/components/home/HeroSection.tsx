'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Play, Plus, Star } from 'lucide-react';
import { useTrendingMovies } from '@/hooks/useTmdbMovies';
import { getImageUrl } from '@/services/tmdb';

export function HeroSection() {
  const { data } = useTrendingMovies();
  const movie = data?.results?.[0];

  return (
    <section className="relative h-[90vh] w-full overflow-hidden">
      {/* Backdrop */}
      {movie?.backdrop_path ? (
        <Image
          src={getImageUrl(movie.backdrop_path, 'original')}
          alt={movie.title}
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
      ) : (
        <div className="absolute inset-0 bg-neutral-900" />
      )}

      {/* Gradients */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#0B0B0B] via-[#0B0B0B]/40 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#0B0B0B]/80 via-transparent to-transparent" />

      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 px-6 pb-20 lg:px-16 lg:pb-24">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-2xl"
        >
          {movie && (
            <>
              <div className="mb-3 flex items-center gap-2 text-sm text-white/70">
                <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                <span className="font-semibold text-amber-400">{movie.vote_average.toFixed(1)}</span>
                <span>·</span>
                <span>{movie.release_date?.slice(0, 4)}</span>
              </div>

              <h1 className="text-4xl font-black leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
                {movie.title}
              </h1>

              {movie.overview && (
                <p className="mt-4 line-clamp-3 max-w-xl text-sm leading-relaxed text-white/70 sm:text-base">
                  {movie.overview}
                </p>
              )}

              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href={`/movie/${movie.id}`}
                  className="flex items-center gap-2 rounded bg-white px-6 py-2.5 text-sm font-bold text-black transition hover:bg-white/90"
                >
                  <Play className="h-4 w-4 fill-black" />
                  Play
                </Link>
                <Link
                  href={`/movie/${movie.id}`}
                  className="flex items-center gap-2 rounded bg-white/20 px-6 py-2.5 text-sm font-bold text-white backdrop-blur-sm transition hover:bg-white/30"
                >
                  <Plus className="h-4 w-4" />
                  Add to Watchlist
                </Link>
              </div>
            </>
          )}

          {!movie && (
            <div className="space-y-4 animate-pulse">
              <div className="h-12 w-96 rounded bg-white/10" />
              <div className="h-4 w-80 rounded bg-white/10" />
              <div className="h-4 w-64 rounded bg-white/10" />
              <div className="flex gap-3 pt-2">
                <div className="h-10 w-28 rounded bg-white/10" />
                <div className="h-10 w-36 rounded bg-white/10" />
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </section>
  );
}
