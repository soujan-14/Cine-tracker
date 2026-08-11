import { prisma } from '@/lib/prisma';
import { BoxOfficeData, OmdbResponse } from '@/types/boxoffice';

const OMDB_API_KEY = process.env.OMDB_API_KEY;
const OMDB_BASE = 'https://www.omdbapi.com';

function parseDollar(value: string | undefined): number | null {
  if (!value || value === 'N/A') return null;
  const n = Number(value.replace(/[$,]/g, ''));
  return Number.isNaN(n) ? null : n;
}

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
  tmdbBudget: number,
  movieId?: number | null,
): Promise<BoxOfficeData> {
  const budget = tmdbBudget > 0 ? tmdbBudget : null;

  if (movieId) {
    const [movie, records] = await Promise.all([
      prisma.movie.findUnique({ where: { id: movieId }, select: { customBoxOffice: true, budget: true } }),
      prisma.boxOffice.findMany({ where: { movieId }, orderBy: { collectionDate: 'desc' }, take: 100 }),
    ]);

    const dailyTotal = records.reduce((sum, record) => sum + Number(record.dailyCollection ?? 0), 0);
    const latestWeekend = records.find((record) => record.weekendCollection !== null);
    const localWeekend = latestWeekend ? Number(latestWeekend.weekendCollection) : null;
    const customTotal = movie?.customBoxOffice != null ? Number(movie.customBoxOffice) : null;
    const localTotal = customTotal ?? (dailyTotal > 0 ? dailyTotal : localWeekend);
    const localVerified = records.some((record) => record.verified) || customTotal !== null;

    if (localTotal !== null) {
      const localBudget = movie?.budget != null ? Number(movie.budget) : budget;
      return {
        domestic: null,
        worldwide: localTotal,
        budget: localBudget,
        openingWeekend: localWeekend,
        status: deriveStatus(localTotal, localBudget),
        source: 'local',
        verified: localVerified,
        localDailyTotal: dailyTotal,
        localWeekend,
      };
    }
  }

  const worldwide = tmdbRevenue > 0 ? tmdbRevenue : null;
  let domestic: number | null = null;
  let source: BoxOfficeData['source'] = worldwide ? 'tmdb' : 'none';

  if (OMDB_API_KEY && imdbId) {
    try {
      const res = await fetch(`${OMDB_BASE}/?i=${encodeURIComponent(imdbId)}&apikey=${OMDB_API_KEY}`, { next: { revalidate: 3600 } });
      if (res.ok) {
        const data: OmdbResponse = await res.json();
        if (data.Response === 'True') {
          domestic = parseDollar(data.BoxOffice);
          source = worldwide ? 'tmdb+omdb' : domestic ? 'omdb' : 'tmdb';
        }
      }
    } catch {
      // External box-office enrichment is optional; TMDB remains the fallback.
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
