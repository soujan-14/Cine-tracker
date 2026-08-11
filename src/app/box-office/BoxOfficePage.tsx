'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { BoxOfficeRow } from '@/components/box-office/BoxOfficeRow';
import { LocalBoxOfficeRow } from '@/components/box-office/LocalBoxOfficeRow';
import { useLocalBoxOffice } from '@/hooks/useLocalBoxOffice';
import { useRevenueMovies, useTrendingMovies, useTopRatedMovies } from '@/hooks/useTmdbMovies';

const YEARS = [
  { label: 'All Time', value: undefined },
  ...Array.from({ length: 10 }, (_, i) => {
    const y = new Date().getFullYear() - i;
    return { label: String(y), value: y };
  }),
];

export default function BoxOfficePage() {
  const [year, setYear] = useState<number | undefined>(undefined);
  const { data: localData, isLoading: loadingLocal } = useLocalBoxOffice(year);
  const { data: allTimeData, isLoading: loadingAllTime, isError: errAllTime } = useRevenueMovies();
  const { data: yearData, isLoading: loadingYear, isError: errYear } = useRevenueMovies(year);
  const { data: trendingData, isLoading: loadingTrending, isError: errTrending } = useTrendingMovies();
  const { data: topRatedData, isLoading: loadingTopRated, isError: errTopRated } = useTopRatedMovies();

  const allTimeMovies = (allTimeData?.results ?? []).slice(0, 12);
  const worldwideMovies = (yearData?.results ?? []).slice(0, 12);
  const trendingMovies = (trendingData?.results ?? []).slice(0, 12);
  const topRatedMovies = [...(topRatedData?.results ?? [])].sort((a, b) => (b.vote_count ?? 0) - (a.vote_count ?? 0)).slice(0, 12);

  return (
    <div className="min-h-screen bg-[#0B0B0B] text-white">
      <Navbar />
      <div className="relative overflow-hidden bg-gradient-to-b from-[#1a0000] to-[#0B0B0B] px-6 pb-10 pt-28 lg:px-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="mb-2 flex items-center gap-3"><TrendingUp className="h-6 w-6 text-[#E50914]" /><span className="text-xs font-bold uppercase tracking-[0.2em] text-[#E50914]">Collection Rankings</span></div>
          <h1 className="text-4xl font-black tracking-tight text-white sm:text-5xl">Box Office</h1>
          <p className="mt-2 max-w-2xl text-sm text-white/50">Verified and reported distributor collections take priority. External TMDB data is used only when local collection data is unavailable.</p>
        </motion.div>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2, duration: 0.4 }} className="mt-6 flex flex-wrap gap-2">
          {YEARS.map((item) => <button key={item.label} onClick={() => setYear(item.value)} className={`min-h-10 rounded-full border px-4 py-1.5 text-xs font-semibold transition-all ${year === item.value ? 'border-[#E50914] bg-[#E50914] text-white' : 'border-white/10 bg-white/5 text-white/60 hover:border-white/30 hover:text-white'}`}>{item.label}</button>)}
        </motion.div>
      </div>

      <div className="space-y-12 pb-16 pt-4">
        {loadingLocal ? <div className="px-6 py-8 text-sm text-white/35 lg:px-12">Loading stored collections…</div> : <LocalBoxOfficeRow rankings={localData?.results ?? []} year={year} />}
        <BoxOfficeRow label="External Highest Grossing" movies={allTimeMovies} isLoading={loadingAllTime} isError={errAllTime} getRevenue={() => null} href="/discover?sort_by=revenue.desc" />
        <BoxOfficeRow label={`External Worldwide Rankings${year ? ` — ${year}` : ''}`} movies={worldwideMovies} isLoading={loadingYear} isError={errYear} getRevenue={() => null} href={`/discover?sort_by=revenue.desc${year ? `&primary_release_year=${year}` : ''}`} />
        <BoxOfficeRow label="Trending Now" movies={trendingMovies} isLoading={loadingTrending} isError={errTrending} getRevenue={() => null} href="/discover?sort_by=popularity.desc" />
        <BoxOfficeRow label="Most Voted" movies={topRatedMovies} isLoading={loadingTopRated} isError={errTopRated} getRevenue={() => null} href="/discover?sort_by=vote_count.desc" />
      </div>
      <Footer />
    </div>
  );
}
