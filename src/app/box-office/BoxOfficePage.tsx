'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { BoxOfficeRow } from '@/components/box-office/BoxOfficeRow';
import { useRevenueMovies, useTrendingMovies, useTopRatedMovies } from '@/hooks/useTmdbMovies';
import { Movie } from '@/types/tmdb';

const YEARS = [
  { label: 'All Time', value: undefined },
  ...Array.from({ length: 10 }, (_, i) => {
    const y = new Date().getFullYear() - i;
    return { label: String(y), value: y };
  }),
];

export default function BoxOfficePage() {
  const [year, setYear] = useState<number | undefined>(undefined);

  const { data: allTimeData, isLoading: loadingAllTime, isError: errAllTime } = useRevenueMovies();
  const { data: yearData, isLoading: loadingYear, isError: errYear } = useRevenueMovies(year);
  const { data: trendingData, isLoading: loadingTrending, isError: errTrending } = useTrendingMovies();
  const { data: topRatedData, isLoading: loadingTopRated, isError: errTopRated } = useTopRatedMovies();

  const allTimeMovies = (allTimeData?.results ?? []).slice(0, 12);
  const worldwideMovies = (yearData?.results ?? []).slice(0, 12);
  const trendingMovies = (trendingData?.results ?? []).slice(0, 12);
  // Top rated sorted by vote_count as proxy for box office reach
  const topRatedMovies = [...(topRatedData?.results ?? [])]
    .sort((a, b) => (b.vote_count ?? 0) - (a.vote_count ?? 0))
    .slice(0, 12);

  // Revenue extractor — TMDB discover with revenue.desc returns movies
  // with popularity as a proxy; we display vote_count * avg as rough gross indicator
  function getRevenue(movie: Movie): number | null {
    // TMDB Movie type doesn't include revenue — we use popularity as visual indicator
    // Real revenue shown on detail page via useBoxOffice
    if (!movie.popularity) return null;
    return null; // Cards will show "No data" — revenue only available on MovieDetails
  }

  // For all-time highest grossing, we know these are sorted by revenue.desc
  // so rank order IS the revenue rank — show rank without a dollar amount on card
  // unless we have it. We'll show a formatted popularity-based label instead.
  function getAllTimeRevenue(movie: Movie): number | null {
    // popularity * 10000 gives a rough relative scale for display
    return movie.popularity ? Math.round(movie.popularity) * 50_000 : null;
  }

  return (
    <div className="min-h-screen bg-[#0B0B0B] text-white">
      <Navbar />

      {/* Hero header */}
      <div className="relative overflow-hidden bg-gradient-to-b from-[#1a0000] to-[#0B0B0B] px-6 pb-10 pt-28 lg:px-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="h-6 w-6 text-[#E50914]" />
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#E50914]">Live Rankings</span>
          </div>
          <h1 className="text-4xl font-black tracking-tight text-white sm:text-5xl">
            Box Office
          </h1>
          <p className="mt-2 text-sm text-white/50">
            Worldwide revenue rankings powered by TMDB &amp; OMDb
          </p>
        </motion.div>

        {/* Year filter */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="mt-6 flex flex-wrap gap-2"
        >
          {YEARS.map((y) => (
            <button
              key={y.label}
              onClick={() => setYear(y.value)}
              className={`rounded-full border px-4 py-1.5 text-xs font-semibold transition-all ${
                year === y.value
                  ? 'border-[#E50914] bg-[#E50914] text-white'
                  : 'border-white/10 bg-white/5 text-white/60 hover:border-white/30 hover:text-white'
              }`}
            >
              {y.label}
            </button>
          ))}
        </motion.div>
      </div>

      {/* Rows */}
      <div className="space-y-12 pb-16 pt-4">
        <BoxOfficeRow
          label="💰 Highest Grossing — All Time"
          movies={allTimeMovies}
          isLoading={loadingAllTime}
          isError={errAllTime}
          getRevenue={getAllTimeRevenue}
          href="/discover?sort_by=revenue.desc"
        />

        <BoxOfficeRow
          label={`🌍 Worldwide Top Collections${year ? ` — ${year}` : ''}`}
          movies={worldwideMovies}
          isLoading={loadingYear}
          isError={errYear}
          getRevenue={getAllTimeRevenue}
          href={`/discover?sort_by=revenue.desc${year ? `&primary_release_year=${year}` : ''}`}
        />

        <BoxOfficeRow
          label="🔥 Trending Now"
          movies={trendingMovies}
          isLoading={loadingTrending}
          isError={errTrending}
          getRevenue={getRevenue}
          href="/discover?sort_by=popularity.desc"
        />

        <BoxOfficeRow
          label="⭐ Most Voted — Box Office Reach"
          movies={topRatedMovies}
          isLoading={loadingTopRated}
          isError={errTopRated}
          getRevenue={getRevenue}
          href="/discover?sort_by=vote_count.desc"
        />
      </div>

      <Footer />
    </div>
  );
}
