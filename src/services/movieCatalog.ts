import { prisma } from '@/lib/prisma';
import {
  getMovieCredits,
  getMovieDetails,
  getMovieVideos,
  getRecommendedMovies,
  getSimilarMovies,
  getWatchProviders,
  searchMovies,
} from '@/services/tmdb';
import { CastMember, CrewMember, Movie, MovieCredits, MovieDetails, MovieVideosResponse, TmdbPaginatedResponse, WatchProvidersResult } from '@/types/tmdb';

function asString(value: unknown): string | null {
  return typeof value === 'string' && value.trim() ? value.trim() : null;
}

function asNumber(value: unknown): number | null {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function normalizeGenreList(value: unknown): { id: number; name: string }[] {
  if (!Array.isArray(value)) return [];
  return value.map((item, index) => {
    if (typeof item === 'string') return { id: -(index + 1), name: item };
    if (item && typeof item === 'object') {
      const record = item as Record<string, unknown>;
      return { id: Number(record.id) || -(index + 1), name: String(record.name ?? '') };
    }
    return { id: -(index + 1), name: '' };
  }).filter((genre) => genre.name);
}

function normalizeCast(value: unknown): CastMember[] {
  if (!Array.isArray(value)) return [];
  return value.map((item, index) => {
    if (typeof item === 'string') return { id: -(index + 1), name: item, original_name: item, character: '', profile_path: null, order: index };
    const record = item as Record<string, unknown>;
    const name = String(record.name ?? record.original_name ?? '');
    return { id: Number(record.id) || -(index + 1), name, original_name: String(record.original_name ?? name), character: String(record.character ?? ''), profile_path: asString(record.profile_path), order: Number(record.order) || index };
  }).filter((member) => member.name);
}

function normalizeCrew(value: unknown): CrewMember[] {
  if (!Array.isArray(value)) return [];
  return value.map((item, index) => {
    if (typeof item === 'string') return { id: -(index + 1), name: item, original_name: item, job: '', department: '', profile_path: null };
    const record = item as Record<string, unknown>;
    const name = String(record.name ?? record.original_name ?? '');
    return { id: Number(record.id) || -(index + 1), name, original_name: String(record.original_name ?? name), job: String(record.job ?? ''), department: String(record.department ?? ''), profile_path: asString(record.profile_path) };
  }).filter((member) => member.name);
}

function movieFromCustom(movie: any): Movie {
  const releaseDate = movie.releaseDate instanceof Date ? movie.releaseDate.toISOString().slice(0, 10) : '';
  const genres = normalizeGenreList(movie.customGenres);
  return {
    id: movie.id,
    title: movie.title,
    original_title: movie.originalTitle ?? movie.title,
    overview: movie.overview ?? '',
    poster_path: movie.customPoster ?? null,
    backdrop_path: movie.customBackdrop ?? null,
    vote_average: 0,
    vote_count: 0,
    release_date: releaseDate,
    genre_ids: genres.map((genre) => genre.id),
    popularity: 0,
    adult: false,
    video: Boolean(movie.customTrailer),
  };
}

export async function resolveMovieRecord(id: number | string) {
  const numericId = Number(id);
  if (!Number.isInteger(numericId)) return null;
  return prisma.movie.findFirst({ where: { OR: [{ id: numericId }, { tmdbId: numericId }] } });
}

export async function resolveTmdbId(id: number | string): Promise<number | null> {
  const record = await resolveMovieRecord(id);
  if (record?.tmdbId) return record.tmdbId;
  const numericId = Number(id);
  return Number.isInteger(numericId) && numericId > 0 ? numericId : null;
}

export async function searchMovieCatalog(query: string, page = 1): Promise<TmdbPaginatedResponse<Movie>> {
  const cleanQuery = query.trim();
  if (!cleanQuery) return { page: 1, results: [], total_pages: 0, total_results: 0 };

  const emptyTmdb: TmdbPaginatedResponse<Movie> = { page, results: [], total_pages: 0, total_results: 0 };
  const [customMovies, tmdb] = await Promise.all([
    prisma.movie.findMany({ orderBy: { updatedAt: 'desc' }, take: 200 }),
    searchMovies(cleanQuery, page).catch(() => emptyTmdb),
  ]);

  const normalized = cleanQuery.toLocaleLowerCase();
  const exactCustom: Movie[] = [];
  const partialCustom: Movie[] = [];
  for (const movie of customMovies) {
    const searchable = [movie.title, movie.originalTitle, JSON.stringify(movie.customCast ?? []), JSON.stringify(movie.customCrew ?? []), JSON.stringify(movie.customGenres ?? [])].filter(Boolean).join(' ').toLocaleLowerCase();
    if (movie.title.trim().toLocaleLowerCase() === normalized) exactCustom.push(movieFromCustom(movie));
    else if (searchable.includes(normalized)) partialCustom.push(movieFromCustom(movie));
  }

  const customIds = new Set(customMovies.filter((movie) => movie.tmdbId).map((movie) => movie.tmdbId as number));
  const exactTmdb: Movie[] = [];
  const partialTmdb: Movie[] = [];
  for (const movie of tmdb.results) {
    if (customIds.has(movie.id)) continue;
    if (movie.title.trim().toLocaleLowerCase() === normalized) exactTmdb.push(movie);
    else partialTmdb.push(movie);
  }

  const seen = new Set<string>();
  const results = [...exactCustom, ...exactTmdb, ...partialCustom, ...partialTmdb].filter((movie) => {
    const key = `${movie.title.trim().toLocaleLowerCase()}|${movie.release_date?.slice(0, 4) ?? ''}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  return { page, results, total_pages: tmdb.total_pages, total_results: results.length };
}

export async function getMovieDetailsMerged(id: number | string): Promise<MovieDetails & { localBoxOffice?: { dailyTotal: number; latestWeekend: number | null; totalCollection: number | null; verified: boolean; records: unknown[] }; custom?: { isCustom: boolean; tmdbId: number | null; trailer: string | null } }> {
  const record = await resolveMovieRecord(id);
  const tmdbId = record?.tmdbId ?? (Number(id) > 0 ? Number(id) : null);
  let tmdb: MovieDetails | null = null;
  if (tmdbId) {
    try { tmdb = await getMovieDetails(tmdbId); } catch { tmdb = null; }
  }
  if (!record && !tmdb) throw new Error('Movie not found.');

  const genres = record?.customGenres ? normalizeGenreList(record.customGenres) : (tmdb?.genres ?? []);
  const releaseDate = record?.releaseDate ? record.releaseDate.toISOString().slice(0, 10) : (tmdb?.release_date ?? '');
  const localRecords = record ? await prisma.boxOffice.findMany({ where: { movieId: record.id }, orderBy: { collectionDate: 'desc' }, take: 100 }) : [];
  const dailyTotal = localRecords.reduce((sum, item) => sum + (asNumber(item.dailyCollection) ?? 0), 0);
  const latestWeekendRecord = localRecords.find((item) => item.weekendCollection !== null);
  const latestWeekend = latestWeekendRecord ? asNumber(latestWeekendRecord.weekendCollection) : null;
  const customTotal = record?.customBoxOffice != null ? asNumber(record.customBoxOffice) : null;
  const totalCollection = customTotal ?? (dailyTotal > 0 ? dailyTotal : latestWeekend);
  const verified = Boolean(localRecords.some((item) => item.verified) || customTotal !== null);

  const merged: MovieDetails = {
    id: record?.id ?? tmdb!.id,
    title: record?.title ?? tmdb!.title,
    original_title: record?.originalTitle ?? tmdb?.original_title ?? record?.title ?? tmdb!.title,
    overview: record?.overview ?? tmdb?.overview ?? '',
    poster_path: record?.customPoster ?? tmdb?.poster_path ?? null,
    backdrop_path: record?.customBackdrop ?? tmdb?.backdrop_path ?? null,
    vote_average: tmdb?.vote_average ?? 0,
    vote_count: tmdb?.vote_count ?? 0,
    release_date: releaseDate,
    genre_ids: genres.map((genre) => genre.id),
    popularity: tmdb?.popularity ?? 0,
    adult: tmdb?.adult ?? false,
    video: Boolean(record?.customTrailer) || Boolean(tmdb?.video),
    genres,
    runtime: record?.runtime ?? tmdb?.runtime ?? null,
    tagline: tmdb?.tagline ?? null,
    budget: record?.budget != null ? asNumber(record.budget) ?? 0 : tmdb?.budget ?? 0,
    revenue: totalCollection ?? tmdb?.revenue ?? 0,
    status: tmdb?.status ?? (record?.releaseDate && record.releaseDate <= new Date() ? 'Released' : 'Planned'),
    homepage: tmdb?.homepage ?? null,
    imdb_id: tmdb?.imdb_id ?? null,
    production_companies: tmdb?.production_companies ?? [],
    spoken_languages: tmdb?.spoken_languages ?? [],
  };

  return Object.assign(merged, {
    custom: { isCustom: Boolean(record?.isCustom), tmdbId: record?.tmdbId ?? null, trailer: record?.customTrailer ?? null },
    localBoxOffice: {
      dailyTotal,
      latestWeekend,
      totalCollection,
      verified,
      records: localRecords.map((item) => ({ id: item.id, dailyCollection: asNumber(item.dailyCollection), weekendCollection: asNumber(item.weekendCollection), collectionDate: item.collectionDate, territory: item.territory, verified: item.verified })),
    },
  });
}

export async function getMovieCreditsMerged(id: number | string): Promise<MovieCredits> {
  const record = await resolveMovieRecord(id);
  const tmdbId = record?.tmdbId ?? (Number(id) > 0 ? Number(id) : null);
  const customCast = normalizeCast(record?.customCast);
  const customCrew = normalizeCrew(record?.customCrew);
  if (!tmdbId) return { id: Number(id), cast: customCast, crew: customCrew };
  const tmdb = await getMovieCredits(tmdbId);
  return { id: Number(id), cast: customCast.length ? customCast : tmdb.cast, crew: customCrew.length ? customCrew : tmdb.crew };
}

export async function getMovieVideosMerged(id: number | string): Promise<MovieVideosResponse> {
  const record = await resolveMovieRecord(id);
  const tmdbId = record?.tmdbId ?? (Number(id) > 0 ? Number(id) : null);
  if (!tmdbId) {
    return { id: Number(id), results: record?.customTrailer ? [{ id: `custom-${record.id}`, iso_639_1: 'en', iso_3166_1: 'US', name: 'Admin Trailer', key: record.customTrailer, site: record.customTrailer.includes('youtube.com') || record.customTrailer.includes('youtu.be') ? 'YouTube' : 'External', size: 1080, type: 'Trailer', official: true, published_at: new Date().toISOString() }] : [] };
  }
  const tmdb = await getMovieVideos(tmdbId);
  if (!record?.customTrailer) return { id: Number(id), results: tmdb.results };
  return { id: Number(id), results: [{ id: `custom-${record.id}`, iso_639_1: 'en', iso_3166_1: 'US', name: 'Admin Trailer', key: record.customTrailer, site: record.customTrailer.includes('youtube.com') || record.customTrailer.includes('youtu.be') ? 'YouTube' : 'External', size: 1080, type: 'Trailer', official: true, published_at: new Date().toISOString() }, ...tmdb.results] };
}

export async function getSimilarMoviesMerged(id: number | string, page = 1) {
  const tmdbId = await resolveTmdbId(id);
  if (!tmdbId) return { page, results: [], total_pages: 0, total_results: 0 };
  return getSimilarMovies(tmdbId, page);
}

export async function getRecommendedMoviesMerged(id: number | string, page = 1) {
  const tmdbId = await resolveTmdbId(id);
  if (!tmdbId) return { page, results: [], total_pages: 0, total_results: 0 };
  return getRecommendedMovies(tmdbId, page);
}

export async function getWatchProvidersMerged(id: number | string): Promise<WatchProvidersResult> {
  const tmdbId = await resolveTmdbId(id);
  if (!tmdbId) return { id: Number(id), results: {} };
  return getWatchProviders(tmdbId);
}
