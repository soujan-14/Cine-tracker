'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { MovieCard } from '@/components/movie/MovieCard';
import { MovieCardSkeleton } from '@/components/movie/MovieCardSkeleton';
import { GenreFilter } from '@/components/discover/GenreFilter';
import { RatingFilter } from '@/components/discover/RatingFilter';
import { SortDropdown } from '@/components/discover/SortDropdown';
import { YearFilter } from '@/components/discover/YearFilter';
import { useDiscoverMovies } from '@/hooks/useTmdbMovies';

export default function DiscoverPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const sort_by = searchParams.get('sort_by') ?? 'popularity.desc';
  const with_genres = searchParams.get('with_genres') ?? '';
  const year = searchParams.get('primary_release_year') ?? '';
  const rating = searchParams.get('vote_average.gte') ?? '';
  const page = Number(searchParams.get('page') ?? '1');

  function update(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    params.delete('page');
    router.push(`/discover?${params.toString()}`);
  }

  const { data, isLoading } = useDiscoverMovies({
    sort_by,
    with_genres,
    primary_release_year: year ? Number(year) : undefined,
    'vote_average.gte': rating ? Number(rating) : undefined,
    page,
  });

  const movies = data?.results ?? [];
  const totalPages = Math.min(data?.total_pages ?? 1, 20);

  return (
    <div className="min-h-screen bg-[#0B0B0B] text-white">
      <Navbar />
      <div className="mx-auto max-w-[1800px] px-6 pt-28 pb-16 lg:px-12">
        <h1 className="mb-8 text-2xl font-black tracking-tight text-white">Discover Movies</h1>

        {/* Filters */}
        <div className="mb-8 space-y-6 rounded-xl border border-white/10 bg-[#141414] p-6">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <SortDropdown value={sort_by} onChange={(v) => update('sort_by', v)} />
            <YearFilter value={year} onChange={(v) => update('primary_release_year', v)} />
            <RatingFilter value={rating} onChange={(v) => update('vote_average.gte', v)} />
          </div>
          <GenreFilter value={with_genres} onChange={(v) => update('with_genres', v)} />
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-5">
          {isLoading ? (
            <MovieCardSkeleton count={20} fluid />
          ) : (
            movies.map((movie, i) => (
              <MovieCard key={movie.id} movie={movie} index={i} fluid />
            ))
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-10 flex items-center justify-center gap-3">
            <button
              disabled={page <= 1}
              onClick={() => update('page', String(page - 1))}
              className="rounded border border-white/10 bg-white/5 px-4 py-2 text-sm text-white transition hover:bg-white/10 disabled:opacity-30"
            >
              Previous
            </button>
            <span className="text-sm text-white/50">
              Page {page} of {totalPages}
            </span>
            <button
              disabled={page >= totalPages}
              onClick={() => update('page', String(page + 1))}
              className="rounded border border-white/10 bg-white/5 px-4 py-2 text-sm text-white transition hover:bg-white/10 disabled:opacity-30"
            >
              Next
            </button>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
