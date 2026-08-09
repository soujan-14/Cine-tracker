'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Star, Clock, Calendar, Play, ChevronLeft, AlertCircle } from 'lucide-react';
import { ActionButtons } from '@/components/movie/ActionButtons';
import { BoxOfficeSection } from '@/components/movie/BoxOfficeSection';
import {
  useMovieDetails,
  useMovieCredits,
  useMovieVideos,
  useSimilarMovies,
  useRecommendedMovies,
} from '@/hooks/useTmdbMovies';
import { useBoxOffice } from '@/hooks/useBoxOffice';
import { getImageUrl } from '@/services/tmdb';
import { Movie } from '@/types/tmdb';
import { predictMovieSuccess } from '@/lib/predictor';

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.45 } }),
};

function formatRuntime(mins: number | null) {
  if (!mins) return 'N/A';
  return `${Math.floor(mins / 60)}h ${mins % 60}m`;
}

function HeroSkeleton() {
  return (
    <div className="relative h-[70vh] w-full animate-pulse bg-neutral-900">
      <div className="absolute bottom-10 left-8 space-y-4 md:left-16">
        <div className="h-8 w-64 rounded bg-neutral-800" />
        <div className="h-4 w-40 rounded bg-neutral-800/60" />
        <div className="flex gap-3">
          {[1, 2, 3].map((i) => <div key={i} className="h-6 w-20 rounded bg-neutral-800/60" />)}
        </div>
      </div>
    </div>
  );
}

function SectionSkeleton({ rows = 1 }: { rows?: number }) {
  return (
    <div className="space-y-3 animate-pulse">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-4 rounded bg-neutral-800" style={{ width: `${85 - i * 10}%` }} />
      ))}
    </div>
  );
}

function CastSkeleton() {
  return (
    <div className="flex gap-4 overflow-hidden">
      {Array.from({ length: 10 }).map((_, i) => (
        <div key={i} className="flex-shrink-0 w-24 animate-pulse space-y-2">
          <div className="h-24 w-24 rounded-full bg-neutral-800" />
          <div className="h-3 w-20 rounded bg-neutral-800" />
          <div className="h-3 w-16 rounded bg-neutral-800/60" />
        </div>
      ))}
    </div>
  );
}

function CardRowSkeleton() {
  return (
    <div className="flex gap-4 overflow-hidden">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex-shrink-0 w-36 animate-pulse space-y-2">
          <div className="aspect-[2/3] w-36 rounded-md bg-neutral-800" />
          <div className="h-3 w-28 rounded bg-neutral-800" />
        </div>
      ))}
    </div>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
      <AlertCircle className="h-12 w-12 text-red-500" />
      <p className="text-lg font-semibold text-white">Something went wrong</p>
      <p className="text-sm text-white/50">{message}</p>
      <Link href="/" className="mt-2 rounded bg-[#E50914] px-5 py-2 text-sm font-semibold text-white transition hover:bg-[#B20710]">
        ← Back to Home
      </Link>
    </div>
  );
}

function MovieRow({ movies }: { movies: Movie[] }) {
  if (!movies.length) return <p className="text-sm text-white/40">Nothing to show.</p>;
  return (
    <div className="flex gap-4 overflow-x-auto pb-3 scrollbar-hide">
      {movies.map((m, i) => (
        <motion.div
          key={m.id}
          custom={i}
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="flex-shrink-0 w-36"
        >
          <Link href={`/movie/${m.id}`} className="group block">
            <div className="relative aspect-[2/3] w-36 overflow-hidden rounded-md bg-neutral-900">
              <Image
                src={getImageUrl(m.poster_path, 'w300')}
                alt={m.title}
                fill
                sizes="144px"
                className="object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              <div className="absolute bottom-2 left-2 flex items-center gap-1 text-xs font-bold text-amber-400 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                <Star className="h-3 w-3 fill-amber-400" />
                {m.vote_average.toFixed(1)}
              </div>
            </div>
            <p className="mt-2 line-clamp-2 text-xs text-white/70 transition-colors group-hover:text-white">
              {m.title}
            </p>
          </Link>
        </motion.div>
      ))}
    </div>
  );
}

export function MovieDetailClient({ id }: { id: string }) {
  const { data: movie, isLoading: loadingMovie, error: movieError } = useMovieDetails(id);
  const { data: credits, isLoading: loadingCredits } = useMovieCredits(id);
  const { data: videos, isLoading: loadingVideos } = useMovieVideos(id);
  const { data: similar, isLoading: loadingSimilar } = useSimilarMovies(id);
  const { data: recommended, isLoading: loadingRecommended } = useRecommendedMovies(id);

  const { data: boxOffice, isLoading: loadingBoxOffice } = useBoxOffice(
    movie?.imdb_id ?? null,
    movie?.revenue ?? 0,
    movie?.budget ?? 0
  );

  const trailer = videos?.results.find(
    (v) => v.site === 'YouTube' && (v.type === 'Trailer' || v.type === 'Teaser')
  );
  const topCast = credits?.cast.slice(0, 10) ?? [];
  const prediction = movie ? predictMovieSuccess(movie) : null;

  if (movieError) return <ErrorState message={(movieError as Error).message} />;

  return (
    <div className="min-h-screen bg-[#0B0B0B] text-white">
      <div className="absolute top-6 left-6 z-50">
        <Link
          href="/"
          className="flex items-center gap-1.5 rounded-full border border-white/10 bg-black/70 px-4 py-2 text-sm text-white/70 backdrop-blur-md transition hover:text-white"
        >
          <ChevronLeft className="h-4 w-4" /> Back
        </Link>
      </div>

      {/* HERO */}
      {loadingMovie ? (
        <HeroSkeleton />
      ) : movie ? (
        <div className="relative h-[75vh] w-full overflow-hidden">
          <Image
            src={getImageUrl(movie.backdrop_path, 'w1280')}
            alt={movie.title}
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0B0B0B] via-[#0B0B0B]/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0B0B0B]/80 via-transparent to-transparent" />

          <div className="absolute bottom-0 left-0 right-0 flex items-end gap-8 px-6 pb-10 md:px-16">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="hidden flex-shrink-0 md:block"
            >
              <div className="relative h-64 w-44 overflow-hidden rounded-xl border border-white/10 shadow-2xl shadow-black/60">
                <Image
                  src={getImageUrl(movie.poster_path, 'w500')}
                  alt={movie.title}
                  fill
                  sizes="176px"
                  className="object-cover"
                />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="flex flex-col gap-3 pb-2"
            >
              <h1 className="text-3xl font-black tracking-tight text-white md:text-5xl">
                {movie.title}
              </h1>
              {movie.tagline && (
                <p className="text-sm italic text-white/50 md:text-base">&ldquo;{movie.tagline}&rdquo;</p>
              )}
              <div className="flex flex-wrap items-center gap-4 text-sm text-white/70">
                <span className="flex items-center gap-1.5 font-semibold text-amber-400">
                  <Star className="h-4 w-4 fill-amber-400" />
                  {movie.vote_average.toFixed(1)}
                  <span className="font-normal text-white/40">/ 10</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4 text-white/40" />
                  {formatRuntime(movie.runtime)}
                </span>
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4 text-white/40" />
                  {movie.release_date
                    ? new Date(movie.release_date).toLocaleDateString('en-US', {
                        year: 'numeric', month: 'long', day: 'numeric',
                      })
                    : 'Unknown'}
                </span>
                {/* Inline box office teaser in hero */}
                {boxOffice?.worldwide && (
                  <span className="flex items-center gap-1 font-semibold text-[#E50914]">
                    💰 {boxOffice.worldwide >= 1_000_000_000
                      ? `$${(boxOffice.worldwide / 1_000_000_000).toFixed(1)}B`
                      : `$${Math.round(boxOffice.worldwide / 1_000_000)}M`}
                  </span>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {movie.genres.map((g) => (
                  <span
                    key={g.id}
                    className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-medium text-white"
                  >
                    {g.name}
                  </span>
                ))}
              </div>
              <ActionButtons
                movieId={movie.id}
                movieTitle={movie.title}
                releaseDate={movie.release_date}
                status={movie.status}
              />
            </motion.div>
          </div>
        </div>
      ) : null}

      {/* BODY */}
      <div className="mx-auto max-w-7xl space-y-16 px-6 py-14 md:px-16">

        {/* AI Prediction */}
        {prediction ? (
          <motion.section variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}>
            <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-neutral-900 to-neutral-950 p-6 shadow-2xl shadow-black/30">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl font-bold text-white">AI Prediction</h2>
                  <p className="mt-1 text-sm text-white/55">Prediction based on ratings, popularity, and trends</p>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-sm font-semibold ${
                    prediction.verdict === 'Blockbuster'
                      ? 'bg-emerald-500/15 text-emerald-400'
                      : prediction.verdict === 'Hit'
                        ? 'bg-amber-500/15 text-amber-400'
                        : 'bg-rose-500/15 text-rose-400'
                  }`}
                >
                  {prediction.verdict}
                </span>
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-3">
                <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-white/40">Verdict</p>
                  <p className="mt-2 text-lg font-semibold text-white">{prediction.verdict}</p>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-white/40">Estimated collection</p>
                  <p className="mt-2 text-lg font-semibold text-white">{prediction.estimatedRevenue}</p>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-white/40">Confidence</p>
                  <p className="mt-2 text-lg font-semibold text-white">{prediction.confidenceLabel} ({prediction.confidence}%)</p>
                </div>
              </div>
            </div>
          </motion.section>
        ) : null}

        {/* Box Office */}
        <motion.section variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}>
          <BoxOfficeSection data={boxOffice} isLoading={loadingMovie || loadingBoxOffice} />
        </motion.section>

        {/* Overview */}
        <motion.section variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}>
          <h2 className="mb-4 text-xl font-bold text-white">Overview</h2>
          {loadingMovie ? (
            <SectionSkeleton rows={4} />
          ) : (
            <p className="max-w-3xl leading-relaxed text-white/60">
              {movie?.overview || 'No overview available.'}
            </p>
          )}
        </motion.section>

        {/* Cast */}
        <motion.section variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}>
          <h2 className="mb-6 text-xl font-bold text-white">Top Cast</h2>
          {loadingCredits ? (
            <CastSkeleton />
          ) : (
            <div className="flex gap-5 overflow-x-auto pb-3 scrollbar-hide">
              {topCast.map((member, i) => (
                <motion.div
                  key={member.id}
                  custom={i}
                  variants={fadeUp}
                  initial="hidden"
                  whileInView="show"
                  viewport={{ once: true }}
                  className="flex flex-shrink-0 flex-col items-center gap-2 text-center w-24"
                >
                  <div className="relative h-20 w-20 overflow-hidden rounded-full border-2 border-white/10 bg-neutral-800">
                    <Image
                      src={getImageUrl(member.profile_path, 'w300')}
                      alt={member.name}
                      fill
                      sizes="80px"
                      className="object-cover"
                    />
                  </div>
                  <p className="text-xs font-semibold text-white leading-tight">{member.name}</p>
                  <p className="text-xs text-white/40 leading-tight line-clamp-2">{member.character}</p>
                </motion.div>
              ))}
            </div>
          )}
        </motion.section>

        {/* Trailer */}
        <motion.section variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}>
          <h2 className="mb-6 text-xl font-bold text-white">Trailer</h2>
          {loadingVideos ? (
            <div className="aspect-video w-full max-w-3xl animate-pulse rounded-xl bg-neutral-800" />
          ) : trailer ? (
            <div className="relative aspect-video w-full max-w-3xl overflow-hidden rounded-xl border border-white/10 shadow-2xl shadow-black/50">
              <iframe
                src={`https://www.youtube.com/embed/${trailer.key}?rel=0&modestbranding=1`}
                title={trailer.name}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="h-full w-full"
              />
            </div>
          ) : (
            <div className="flex h-48 w-full max-w-3xl items-center justify-center rounded-xl border border-white/10 bg-neutral-900">
              <div className="flex flex-col items-center gap-2 text-white/30">
                <Play className="h-8 w-8" />
                <p className="text-sm">No trailer available</p>
              </div>
            </div>
          )}
        </motion.section>

        {/* Similar */}
        <motion.section variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}>
          <h2 className="mb-6 text-xl font-bold text-white">Similar Movies</h2>
          {loadingSimilar ? <CardRowSkeleton /> : <MovieRow movies={similar?.results ?? []} />}
        </motion.section>

        {/* Recommended */}
        <motion.section variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}>
          <h2 className="mb-6 text-xl font-bold text-white">Recommended For You</h2>
          {loadingRecommended ? <CardRowSkeleton /> : <MovieRow movies={recommended?.results ?? []} />}
        </motion.section>
      </div>
    </div>
  );
}
