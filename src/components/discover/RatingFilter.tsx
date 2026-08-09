'use client';

import { Star } from 'lucide-react';

interface Props {
  value: string;
  onChange: (rating: string) => void;
}

const RATINGS = ['', '5', '6', '7', '8', '9'];
const LABELS: Record<string, string> = {
  '': 'Any',
  '5': '5+',
  '6': '6+',
  '7': '7+',
  '8': '8+',
  '9': '9+',
};

export function RatingFilter({ value, onChange }: Props) {
  return (
    <div>
      <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-white/50">Min Rating</p>
      <div className="flex gap-2">
        {RATINGS.map((r) => {
          const active = value === r;
          return (
            <button
              key={r}
              onClick={() => onChange(r)}
              className={`flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-all duration-200 ${
                active
                  ? 'border-amber-400/50 bg-amber-400/15 text-amber-300'
                  : 'border-white/10 bg-white/5 text-white/50 hover:border-white/20 hover:text-white'
              }`}
            >
              {r && <Star className="h-3 w-3 fill-current" />}
              {LABELS[r]}
            </button>
          );
        })}
      </div>
    </div>
  );
}
