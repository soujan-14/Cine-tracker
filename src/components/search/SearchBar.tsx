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
  const [activeIndex, setActiveIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { data, isFetching, isError } = useSearchMovies(query);
  const results = data?.results?.slice(0, 8) ?? [];

  // Debounce input → query
  const handleInput = useCallback((value: string) => {
    setInput(value);
    setActiveIndex(-1);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setQuery(value.trim());
      setOpen(value.trim().length > 0);
    }, 350);
  }, []);

  // Close on outside click
  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  function navigate(id: number) {
    setOpen(false);
    setInput('');
    setQuery('');
    router.push(`/movie/${id}`);
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (!open) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && activeIndex >= 0 && results[activeIndex]) {
      navigate(results[activeIndex].id);
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  }

  const showDropdown = open && query.length > 0;

  return (
    <div ref={containerRef} className="relative w-full max-w-xs sm:max-w-sm">
      {/* Input */}
      <div className="flex items-center gap-2 rounded-full border border-white/10 bg-neutral-900/80 px-3 py-2 backdrop-blur-md transition focus-within:border-white/30">
        {isFetching ? (
          <Loader2 className="h-4 w-4 flex-shrink-0 animate-spin text-white/60" />
        ) : (
          <Search className="h-4 w-4 flex-shrink-0 text-slate-400" />
        )}
        <input
          type="text"
          value={input}
          onChange={(e) => handleInput(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => query.length > 0 && setOpen(true)}
          placeholder="Search movies…"
          className="w-full bg-transparent text-sm text-slate-200 placeholder-slate-500 outline-none"
          aria-label="Search movies"
          aria-autocomplete="list"
        />
        {input && (
          <button
            onClick={() => { setInput(''); setQuery(''); setOpen(false); }}
            className="flex-shrink-0 text-slate-500 hover:text-slate-300 transition"
            aria-label="Clear search"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* Dropdown */}
      <AnimatePresence>
        {showDropdown && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="absolute left-0 right-0 top-[calc(100%+8px)] z-50 overflow-hidden rounded-xl border border-white/10 bg-[#141414] shadow-2xl shadow-black/80 backdrop-blur-xl"
            role="listbox"
          >
            {/* Error */}
            {isError && (
              <div className="flex items-center gap-2 px-4 py-5 text-sm text-red-400">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                Failed to load results. Try again.
              </div>
            )}

            {/* No results */}
            {!isError && !isFetching && results.length === 0 && (
              <div className="px-4 py-5 text-center text-sm text-slate-500">
                No results found for &ldquo;{query}&rdquo;
              </div>
            )}

            {/* Results */}
            {results.map((movie, i) => {
              const year = movie.release_date ? movie.release_date.slice(0, 4) : '—';
              const isActive = i === activeIndex;
              return (
                <button
                  key={movie.id}
                  role="option"
                  aria-selected={isActive}
                  onClick={() => navigate(movie.id)}
                  onMouseEnter={() => setActiveIndex(i)}
                  className={`flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors ${
                    isActive ? 'bg-white/10' : 'hover:bg-white/5'
                  } ${i !== 0 ? 'border-t border-white/5' : ''}`}
                >
                  {/* Poster thumbnail */}
                  <div className="relative h-12 w-8 flex-shrink-0 overflow-hidden rounded-md bg-slate-800">
                    <Image
                      src={getImageUrl(movie.poster_path, 'w300')}
                      alt={movie.title}
                      fill
                      sizes="32px"
                      className="object-cover"
                    />
                  </div>
                  {/* Text */}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-slate-200">{movie.title}</p>
                    <p className="text-xs text-slate-500">{year}</p>
                  </div>
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
