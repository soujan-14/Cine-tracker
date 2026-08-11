'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, X, Globe2 } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { MovieCard } from '@/components/movie/MovieCard';
import { MovieCardSkeleton } from '@/components/movie/MovieCardSkeleton';
import { ApiErrorMessage } from '@/components/movie/ApiErrorMessage';
import { useDiscoverMovies, useRegionalTrendingMovies, useTrendingMovies } from '@/hooks/useTmdbMovies';
import { clearStoredRegion, getLocationPreference, getStoredRegion, requestUserRegion, setLocationPreference, LocationPreference } from '@/utils/location';
import { Movie } from '@/types/tmdb';

const regionNames: Record<string, string> = { IN: 'India', US: 'United States', GB: 'United Kingdom', UK: 'United Kingdom' };
const uniqueMovies = (movies: Movie[]) => Array.from(new Map(movies.map((movie) => [movie.id, movie])).values());

function rankRegionalMovies(regional: Movie[], global: Movie[]): Movie[] {
  const globalRank = new Map(global.map((movie, index) => [movie.id, index]));
  return uniqueMovies(regional).sort((a, b) => {
    const score = (movie: Movie) => (movie.popularity ?? 0) * 0.55 + movie.vote_average * 4 + Math.max(0, 50 - (globalRank.get(movie.id) ?? 50)) * 0.15;
    return score(b) - score(a);
  });
}

function LocationDialog({ onAllow, onNotNow, busy }: { onAllow: () => void; onNotNow: () => void; busy: boolean }) {
  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="location-title">
      <motion.div initial={{ opacity: 0, y: 12, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} className="w-full max-w-md rounded-2xl border border-white/10 bg-[#141414] p-6 shadow-2xl">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#E50914]/10 text-[#E50914]"><MapPin className="h-6 w-6" /></div>
        <h2 id="location-title" className="text-xl font-bold text-white">Allow Cine Tracker to use your location to show movies relevant to your region?</h2>
        <p className="mt-2 text-sm leading-6 text-white/50">We use your location only to determine a country/region code. Your precise coordinates are not stored.</p>
        <div className="mt-6 flex gap-3">
          <button disabled={busy} onClick={onAllow} className="flex-1 rounded-lg bg-[#E50914] px-4 py-3 text-sm font-bold text-white transition hover:bg-[#f6121d] disabled:opacity-50" aria-label="Allow Location">{busy ? 'Finding region…' : 'Allow Location'}</button>
          <button disabled={busy} onClick={onNotNow} className="flex-1 rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white/80 transition hover:bg-white/10 disabled:opacity-50" aria-label="Not Now">Not Now</button>
        </div>
      </motion.div>
    </div>
  );
}

function Section({ title, movies, loading }: { title: string; movies: Movie[]; loading?: boolean }) {
  return (
    <motion.section initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-70px' }} transition={{ duration: 0.35 }}>
      <h2 className="mb-4 text-lg font-bold text-white">{title}</h2>
      <div className="flex snap-x gap-3 overflow-x-auto pb-2 scroll-smooth scrollbar-hide">
        {loading ? <MovieCardSkeleton count={8} /> : movies.slice(0, 10).map((movie, index) => <MovieCard key={movie.id} movie={movie} index={index} />)}
      </div>
    </motion.section>
  );
}

export default function TrendingPage() {
  const [preference, setPreference] = useState<LocationPreference | null>(null);
  const [region, setRegion] = useState<string | null>(null);
  const [locationBusy, setLocationBusy] = useState(false);
  const [locationError, setLocationError] = useState(false);

  useEffect(() => {
    const savedPreference = getLocationPreference();
    const savedRegion = getStoredRegion();
    setPreference(savedPreference);
    setRegion(savedRegion);
  }, []);

  const allowLocation = useCallback(async () => {
    setLocationBusy(true);
    setLocationError(false);
    try {
      const detectedRegion = await requestUserRegion();
      setLocationPreference('allow');
      setPreference('allow');
      setRegion(detectedRegion);
    } catch {
      setLocationPreference('denied');
      setPreference('denied');
      clearStoredRegion();
      setRegion(null);
      setLocationError(true);
    } finally {
      setLocationBusy(false);
    }
  }, []);

  const notNow = () => {
    setLocationPreference('not-now');
    setPreference('not-now');
  };

  const changeLocation = () => {
    setLocationPreference('allow');
    setPreference('allow');
    void allowLocation();
  };

  const globalTrending = useTrendingMovies();
  const regionalTrending = useRegionalTrendingMovies(region);
  const popular = useDiscoverMovies({ sort_by: 'popularity.desc', page: 1, region: region ?? undefined, 'vote_count.gte': 100 });
  const rated = useDiscoverMovies({ sort_by: 'vote_average.desc', page: 1, region: region ?? undefined, 'vote_count.gte': 300, 'vote_average.gte': 7 });
  const theaters = useDiscoverMovies({ sort_by: 'popularity.desc', page: 1, region: region ?? undefined, primary_release_date_gte: new Date(Date.now() - 1000 * 60 * 60 * 24 * 21).toISOString().slice(0, 10), primary_release_date_lte: new Date().toISOString().slice(0, 10), with_release_type: '2|3', 'vote_count.gte': 10 });

  const regionalMovies = useMemo(() => rankRegionalMovies(regionalTrending.data?.results ?? [], globalTrending.data?.results ?? []), [regionalTrending.data, globalTrending.data]);
  const risingMovies = useMemo(() => uniqueMovies([...(regionalTrending.data?.results ?? []), ...(globalTrending.data?.results ?? [])]).sort((a, b) => (b.popularity ?? 0) - (a.popularity ?? 0)), [regionalTrending.data, globalTrending.data]);
  const global = !region || regionalTrending.isError;
  const loadingRegional = Boolean(region && regionalTrending.isLoading);
  const displayedTrending = global ? globalTrending.data?.results ?? [] : regionalMovies;

  return (
    <main className="min-h-screen bg-[#0B0B0B] text-white">
      <Navbar />
      <div className="mx-auto max-w-[1800px] px-6 pb-20 pt-10 lg:px-12 lg:pt-14">
        <header className="mb-10">
          <div className="flex flex-wrap items-start justify-between gap-5">
            <div>
              <div className="flex items-center gap-3"><h1 className="text-3xl font-black tracking-tight sm:text-4xl">🔥 {global ? 'Global Trending' : 'Trending in Your Region'}</h1><span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-white/60">{global ? <Globe2 className="h-3.5 w-3.5" /> : <MapPin className="h-3.5 w-3.5" />}{global ? 'Global' : regionNames[region ?? ''] ?? region}</span></div>
              <p className="mt-2 text-sm text-white/50">{global ? 'Global Trending movies' : 'Popular around your region'}</p>
            </div>
            <button onClick={changeLocation} className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-white/65 transition hover:bg-white/10 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E50914]/70" aria-label="Change location">Change location</button>
          </div>
          {locationError && <p className="mt-4 rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-xs text-white/55">We could not determine your region. Showing global trending movies.</p>}
        </header>

        <div className="space-y-12">
          <Section title="🔥 Trending Now" movies={displayedTrending} loading={global ? globalTrending.isLoading : loadingRegional} />
          <Section title="🎬 Popular This Week" movies={popular.data?.results ?? []} loading={popular.isLoading} />
          <Section title="🎟️ In Theaters" movies={theaters.data?.results ?? []} loading={theaters.isLoading} />
          <Section title="⭐ Highest Rated" movies={rated.data?.results ?? []} loading={rated.isLoading} />
          <Section title="📈 Rising Movies" movies={risingMovies} loading={globalTrending.isLoading && regionalTrending.isLoading} />
        </div>

        {(popular.isError || theaters.isError || rated.isError) && <div className="mt-8"><ApiErrorMessage title="Some trending sections could not load" message="Showing the sections that are available. Please try again later." onRetry={() => { void popular.refetch(); void theaters.refetch(); void rated.refetch(); }} /></div>}
      </div>

      {preference === null && <LocationDialog onAllow={() => void allowLocation()} onNotNow={notNow} busy={locationBusy} />}
    </main>
  );
}
