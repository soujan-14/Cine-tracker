import { BoxOfficeData, OmdbResponse } from '@/types/boxoffice';

const OMDB_API_KEY = process.env.OMDB_API_KEY;
const OMDB_BASE = 'https://www.omdbapi.com';

/** Parse OMDb dollar string like "$701,729,206" → number */
function parseDollar(value: string | undefined): number | null {
  if (!value || value === 'N/A') return null;
  const n = Number(value.replace(/[$,]/g, ''));
  return isNaN(n) ? null : n;
}

/** Derive hit/flop status from worldwide gross vs budget */
function deriveStatus(worldwide: number | null, budget: number | null): BoxOfficeData['status'] {
  if (!worldwide) return null;
  if (!budget || budget === 0) {
    if (worldwide >= 500_000_000) return 'Blockbuster';
    if (worldwide >= 100_000_000) return 'Hit';
    return null;
  }
  const ratio = worldwide / budget;
  if (ratio >= 3) return 'Blockbuster';
  if (ratio >= 1.5) return 'Hit';
  if (ratio >= 0.8) return 'Average';
  return 'Flop';
}

export async function getBoxOfficeData(
  imdbId: string | null,
  tmdbRevenue: number,
  tmdbBudget: number
): Promise<BoxOfficeData> {
  const worldwide = tmdbRevenue > 0 ? tmdbRevenue : null;
  const budget = tmdbBudget > 0 ? tmdbBudget : null;

  let domestic: number | null = null;
  let source: BoxOfficeData['source'] = worldwide ? 'tmdb' : 'none';

  if (OMDB_API_KEY && imdbId) {
    try {
      const url = `${OMDB_BASE}/?i=${imdbId}&apikey=${OMDB_API_KEY}`;
      const res = await fetch(url, { next: { revalidate: 3600 } });
      if (res.ok) {
        const data: OmdbResponse = await res.json();
        if (data.Response === 'True') {
          domestic = parseDollar(data.BoxOffice);
          source = worldwide ? 'tmdb+omdb' : domestic ? 'omdb' : 'tmdb';
        }
      }
    } catch {
      // OMDb failed — fall back to TMDB only
    }
  }

  return {
    domestic,
    worldwide,
    budget,
    openingWeekend: null,
    status: deriveStatus(worldwide, budget),
    source,
  };
}
