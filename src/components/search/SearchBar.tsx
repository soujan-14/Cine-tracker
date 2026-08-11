'use client';

import { useEffect, useRef, useState, useCallback, KeyboardEvent } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Loader2, AlertCircle } from 'lucide-react';
import { useSearchMovies } from '@/hooks/useTmdbMovies';
import { getImageUrl } from '@/services/tmdb';

export function SearchBar() {
  const router = useRouter();
  const [input, setInput] = useState('');
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { data, isFetching, isError } = useSearchMovies(query);
  const results = data?.results?.slice(0, 8) ?? [];

  const focusSearch = useCallback(() => {
    setOpen(true);
    requestAnimationFrame(() => inputRef.current?.focus());
  }, []);

  const handleInput = useCallback((value: string) => {
    setInput(value);
    setActiveIndex(0);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setQuery(value.trim()), 300);
  }, []);

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  useEffect(() => {
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key === '/' && !['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        e.preventDefault();
        focusSearch();
      }
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [focusSearch]);

  function navigate(id: number) {
    setOpen(false); setInput(''); setQuery(''); router.push(`/movie/${id}`);
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'ArrowDown') { e.preventDefault(); setActiveIndex((i) => Math.min(i + 1, Math.max(results.length - 1, 0))); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActiveIndex((i) => Math.max(i - 1, 0)); }
    else if (e.key === 'Enter' && results[activeIndex]) { e.preventDefault(); navigate(results[activeIndex].id); }
  }

  return <div ref={containerRef} className="relative">
    <button onClick={focusSearch} aria-label="Search movies" className="flex h-10 w-10 items-center justify-center rounded-full border border-white/5 text-white/70 transition hover:bg-white/10 hover:text-white"><Search className="h-[18px] w-[18px]" /></button>
    <AnimatePresence>{open && <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="fixed inset-0 z-[100] bg-black/90 p-4 backdrop-blur-xl sm:absolute sm:inset-auto sm:right-0 sm:top-12 sm:w-[430px] sm:rounded-2xl sm:border sm:border-white/10 sm:bg-[#111]/95 sm:p-3 sm:shadow-2xl">
      <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-3">{isFetching ? <Loader2 className="h-5 w-5 animate-spin text-white/50" /> : <Search className="h-5 w-5 text-white/50" />}<input ref={inputRef} value={input} onChange={(e) => handleInput(e.target.value)} onKeyDown={handleKeyDown} autoComplete="off" placeholder="Search movies..." className="w-full bg-transparent text-base text-white outline-none placeholder:text-white/35" aria-label="Search movies" aria-autocomplete="list" /><button onClick={() => setOpen(false)} aria-label="Close search" className="rounded-full p-1 text-white/50 hover:bg-white/10 hover:text-white"><X className="h-5 w-5" /></button></div>
      {query && <div className="mt-3 max-h-[calc(100vh-110px)] overflow-y-auto">{isError ? <div className="flex items-center gap-2 p-4 text-sm text-red-400"><AlertCircle className="h-4 w-4" /> Failed to load results.</div> : null}{!isError && !isFetching && results.length === 0 ? <div className="p-6 text-center text-sm text-white/40">No results found for “{query}”</div> : null}{results.length > 0 ? <><button onClick={() => navigate(results[0].id)} className="mb-2 flex w-full gap-3 rounded-xl border border-white/10 bg-white/5 p-3 text-left transition hover:scale-[1.01] hover:bg-white/10"><div className="relative h-32 w-22 shrink-0 overflow-hidden rounded-lg bg-white/5"><Image src={getImageUrl(results[0].poster_path, 'w300')} alt={results[0].title} fill sizes="88px" className="object-cover" /></div><div className="min-w-0 py-1"><p className="text-xs font-semibold uppercase tracking-wider text-[#E50914]">Best match</p><p className="mt-1 text-lg font-bold text-white">{results[0].title}</p><p className="mt-1 text-sm text-white/45">{results[0].release_date?.slice(0, 4) || '—'}</p><p className="mt-3 line-clamp-3 text-xs text-white/50">{results[0].overview || 'Open movie details'}</p></div></button>{results.slice(1).map((movie, i) => <button key={movie.id} onClick={() => navigate(movie.id)} onMouseEnter={() => setActiveIndex(i + 1)} className={`flex w-full items-center gap-3 rounded-lg border-t border-white/5 px-2 py-2.5 text-left transition ${activeIndex === i + 1 ? 'bg-white/10' : 'hover:bg-white/5'}`}><div className="relative h-14 w-10 shrink-0 overflow-hidden rounded bg-white/5"><Image src={getImageUrl(movie.poster_path, 'w300')} alt={movie.title} fill sizes="40px" className="object-cover" /></div><div className="min-w-0"><p className="truncate text-sm font-medium text-white">{movie.title}</p><p className="text-xs text-white/40">{movie.release_date?.slice(0, 4) || '—'}</p></div></button>)}</> : null}</div>}
    </motion.div>}</AnimatePresence>
  </div>;
}
