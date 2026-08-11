'use client';

import Link from 'next/link';
import { LocalBoxOfficeRanking } from '@/hooks/useLocalBoxOffice';

function formatCollection(value: number) {
  if (value >= 1_000_000_000) return `₹${(value / 1_000_000_000).toFixed(2)}B`;
  if (value >= 1_000_000) return `₹${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 100_000) return `₹${(value / 100_000).toFixed(1)}L`;
  return `₹${value.toLocaleString('en-IN')}`;
}

export function LocalBoxOfficeRow({ rankings, year }: { rankings: LocalBoxOfficeRanking[]; year?: number }) {
  if (!rankings.length) return null;
  return (
    <section>
      <div className="mb-4 flex items-center justify-between px-6 lg:px-12">
        <div><h2 className="text-lg font-bold text-white">Verified / Reported Collections{year ? ` — ${year}` : ''}</h2><p className="mt-1 text-xs text-white/35">Stored distributor and admin data takes priority over external sources.</p></div>
      </div>
      <div className="flex gap-3 overflow-x-auto px-6 pb-2 scrollbar-hide lg:px-12">
        {rankings.map((item, index) => (
          <Link key={item.movie.id} href={`/movie/${item.movie.id}`} className="group w-[150px] shrink-0 sm:w-[170px]">
            <div className="relative aspect-[2/3] overflow-hidden rounded-md bg-white/5">
              {item.movie.poster_path ? <img src={item.movie.poster_path} alt={item.movie.title} loading="lazy" className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" /> : <div className="flex h-full items-center justify-center p-4 text-center text-xs text-white/30">No poster</div>}
              <span className="absolute left-2 top-2 rounded-full bg-black/80 px-2 py-1 text-xs font-black text-white">#{index + 1}</span>
              <span className="absolute bottom-2 left-2 rounded-md bg-black/80 px-2 py-1 text-[11px] font-bold text-white">{item.verified ? 'Verified' : 'Reported'}</span>
            </div>
            <p className="mt-2 line-clamp-2 text-sm font-semibold text-white/80 group-hover:text-white">{item.movie.title}</p>
            <p className="mt-1 text-xs font-bold text-[#E50914]">{formatCollection(item.collection)}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
