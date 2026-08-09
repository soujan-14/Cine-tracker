'use client';

import { ArrowUpDown } from 'lucide-react';

interface Props {
  value: string;
  onChange: (sort: string) => void;
}

const OPTIONS = [
  { value: 'popularity.desc', label: 'Most Popular' },
  { value: 'vote_average.desc', label: 'Highest Rated' },
  { value: 'release_date.desc', label: 'Newest First' },
  { value: 'revenue.desc', label: 'Top Grossing' },
];

export function SortDropdown({ value, onChange }: Props) {
  return (
    <div>
      <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-white/50">Sort By</p>
      <div className="relative">
        <ArrowUpDown className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full appearance-none rounded-lg border border-white/10 bg-neutral-900 py-2 pl-8 pr-3 text-sm text-white outline-none transition focus:border-white/30"
        >
          {OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
