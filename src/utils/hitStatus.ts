import { Movie } from '@/types/tmdb';

export type HitStatus = 'Blockbuster' | 'Average' | 'Flop';

export interface HitStatusInfo {
  label: HitStatus;
  emoji: string;
  color: string; // Tailwind text color class
  dot: string;   // Tailwind bg color class for dot
}

const HIT_STATUS_MAP: Record<HitStatus, HitStatusInfo> = {
  Blockbuster: {
    label: 'Blockbuster',
    emoji: '🟢',
    color: 'text-emerald-400',
    dot: 'bg-emerald-500',
  },
  Average: {
    label: 'Average',
    emoji: '🟡',
    color: 'text-amber-400',
    dot: 'bg-amber-400',
  },
  Flop: {
    label: 'Flop',
    emoji: '🔴',
    color: 'text-rose-500',
    dot: 'bg-rose-500',
  },
};

/**
 * Derives a movie's "hit status" using TMDB's popularity score and vote_average
 * as a proxy for box office performance (since list endpoints don't include revenue).
 *
 * Thresholds are calibrated against typical TMDB popularity distributions:
 *   popularity > 200 AND vote_average >= 6.5  → Blockbuster
 *   popularity 50-200 OR  vote_average >= 5.5  → Average
 *   otherwise                                  → Flop
 */
export function getHitStatus(movie: Movie): HitStatusInfo {
  const pop = movie.popularity ?? 0;
  const avg = movie.vote_average ?? 0;
  const votes = movie.vote_count ?? 0;

  // Need at least some votes to be meaningful
  if (votes < 50) {
    return HIT_STATUS_MAP['Average'];
  }

  if (pop >= 200 && avg >= 6.5) return HIT_STATUS_MAP['Blockbuster'];
  if (pop >= 100 && avg >= 7.0) return HIT_STATUS_MAP['Blockbuster'];
  if (avg >= 7.5 && votes >= 1000) return HIT_STATUS_MAP['Blockbuster'];

  if (avg < 5.0 && votes >= 200) return HIT_STATUS_MAP['Flop'];
  if (pop < 30 && avg < 5.5) return HIT_STATUS_MAP['Flop'];

  return HIT_STATUS_MAP['Average'];
}
