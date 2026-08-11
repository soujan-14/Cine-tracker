import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Movie, MovieCredits, MovieDetails, MovieVideosResponse, TmdbPaginatedResponse, WatchProvidersResult } from '@/types/tmdb';
import { DiscoverParams } from '@/services/tmdb';

async function fetcher<T>(url: string, signal?: AbortSignal): Promise<T> {
  try {
    const response = await axios.get<T>(url, { signal, timeout: 15000 });
    return response.data;
  } catch (error: any) {
    if (error.name === 'CanceledError' || signal?.aborted) throw new DOMException('Request aborted', 'AbortError');
    throw error;
  }
}

function createQueryFn<T>(url: string) {
  return ({ signal }: { signal: AbortSignal }) => fetcher<T>(url, signal);
}

function retryDelay(attemptIndex: number): number {
  return Math.min(1000 * 2 ** attemptIndex, 8000);
}

export function useTrendingMovies(page = 1) {
  return useQuery<TmdbPaginatedResponse<Movie>>({
    queryKey: ['movies', 'trending', page],
    queryFn: createQueryFn<TmdbPaginatedResponse<Movie>>(`/api/tmdb/trending?page=${page}`),
    staleTime: 1000 * 60 * 10,
    refetchOnWindowFocus: false,
    retry: 2,
    retryDelay,
  });
}

export function useRegionalTrendingMovies(region: string | null, page = 1) {
  const normalizedRegion = region?.trim().toUpperCase() ?? '';
  return useQuery<TmdbPaginatedResponse<Movie>>({
    queryKey: ['movies', 'regional-trending', normalizedRegion, page],
    queryFn: createQueryFn<TmdbPaginatedResponse<Movie>>(`/api/tmdb/trending/regional?region=${encodeURIComponent(normalizedRegion)}&page=${page}`),
    enabled: /^[A-Z]{2}$/.test(normalizedRegion),
    staleTime: 1000 * 60 * 10,
    refetchOnWindowFocus: false,
    retry: 1,
    retryDelay,
  });
}

export function useTopRatedMovies(page = 1) {
  return useQuery<TmdbPaginatedResponse<Movie>>({ queryKey: ['movies', 'top-rated', page], queryFn: createQueryFn<TmdbPaginatedResponse<Movie>>(`/api/tmdb/top-rated?page=${page}`), staleTime: 1000 * 60 * 10, refetchOnWindowFocus: false, retry: 2, retryDelay });
}

export function useUpcomingMovies(page = 1) {
  return useQuery<TmdbPaginatedResponse<Movie>>({ queryKey: ['movies', 'upcoming', page], queryFn: createQueryFn<TmdbPaginatedResponse<Movie>>(`/api/tmdb/upcoming?page=${page}`), staleTime: 1000 * 60 * 10, refetchOnWindowFocus: false, retry: 2, retryDelay });
}

export function useSearchMovies(query: string, page = 1) {
  return useQuery<TmdbPaginatedResponse<Movie>>({ queryKey: ['movies', 'search', query, page], queryFn: createQueryFn<TmdbPaginatedResponse<Movie>>(`/api/tmdb/search?query=${encodeURIComponent(query)}&page=${page}`), enabled: Boolean(query && query.trim().length > 0), staleTime: 1000 * 60 * 5, refetchOnWindowFocus: false, retry: 2, retryDelay });
}

export function useMovieDetails(id: string | number) {
  return useQuery<MovieDetails>({ queryKey: ['movie', 'details', id], queryFn: createQueryFn<MovieDetails>(`/api/tmdb/movie/${id}/details`), enabled: Boolean(id), staleTime: 1000 * 60 * 30, refetchOnWindowFocus: false, retry: 3, retryDelay });
}

export function useMovieCredits(id: string | number) {
  return useQuery<MovieCredits>({ queryKey: ['movie', 'credits', id], queryFn: createQueryFn<MovieCredits>(`/api/tmdb/movie/${id}/credits`), enabled: Boolean(id), staleTime: 1000 * 60 * 30, refetchOnWindowFocus: false, retry: 2, retryDelay });
}

export function useMovieVideos(id: string | number) {
  return useQuery<MovieVideosResponse>({ queryKey: ['movie', 'videos', id], queryFn: createQueryFn<MovieVideosResponse>(`/api/tmdb/movie/${id}/videos`), enabled: Boolean(id), staleTime: 1000 * 60 * 30, refetchOnWindowFocus: false, retry: 2, retryDelay });
}

export function useSimilarMovies(id: string | number) {
  return useQuery<TmdbPaginatedResponse<Movie>>({ queryKey: ['movie', 'similar', id], queryFn: createQueryFn<TmdbPaginatedResponse<Movie>>(`/api/tmdb/movie/${id}/similar`), enabled: Boolean(id), staleTime: 1000 * 60 * 30, refetchOnWindowFocus: false, retry: 2, retryDelay });
}

export function useRecommendedMovies(id: string | number) {
  return useQuery<TmdbPaginatedResponse<Movie>>({ queryKey: ['movie', 'recommendations', id], queryFn: createQueryFn<TmdbPaginatedResponse<Movie>>(`/api/tmdb/movie/${id}/recommendations`), enabled: Boolean(id), staleTime: 1000 * 60 * 30, refetchOnWindowFocus: false, retry: 2, retryDelay });
}

export function useDiscoverMovies(params: DiscoverParams) {
  const searchParams = new URLSearchParams();
  searchParams.set('sort_by', params.sort_by ?? 'popularity.desc');
  searchParams.set('page', String(params.page ?? 1));
  if (params.with_genres) searchParams.set('with_genres', params.with_genres);
  if (params.primary_release_year) searchParams.set('primary_release_year', String(params.primary_release_year));
  if (params.primary_release_date_gte) searchParams.set('primary_release_date_gte', params.primary_release_date_gte);
  if (params.primary_release_date_lte) searchParams.set('primary_release_date_lte', params.primary_release_date_lte);
  if (params.with_release_type) searchParams.set('with_release_type', params.with_release_type);
  if (params.region) searchParams.set('region', params.region);
  if (params['vote_average.gte']) searchParams.set('vote_average.gte', String(params['vote_average.gte']));
  if (params['vote_count.gte']) searchParams.set('vote_count.gte', String(params['vote_count.gte']));

  return useQuery<TmdbPaginatedResponse<Movie>>({ queryKey: ['movies', 'discover', params], queryFn: createQueryFn<TmdbPaginatedResponse<Movie>>(`/api/tmdb/discover?${searchParams.toString()}`), staleTime: 1000 * 60 * 5, refetchOnWindowFocus: false, retry: 2, retryDelay });
}

export function useRevenueMovies(year?: number) {
  const searchParams = new URLSearchParams({ sort_by: 'revenue.desc', page: '1', 'vote_count.gte': '200' });
  if (year) searchParams.set('primary_release_year', String(year));
  return useQuery<TmdbPaginatedResponse<Movie>>({ queryKey: ['movies', 'revenue', year ?? 'all'], queryFn: createQueryFn<TmdbPaginatedResponse<Movie>>(`/api/tmdb/discover?${searchParams.toString()}`), staleTime: 1000 * 60 * 30, refetchOnWindowFocus: false, retry: 2, retryDelay });
}

export function usePopularMovies(page = 1) {
  return useQuery<TmdbPaginatedResponse<Movie>>({ queryKey: ['movies', 'popular', page], queryFn: createQueryFn<TmdbPaginatedResponse<Movie>>(`/api/tmdb/discover?sort_by=popularity.desc&page=${page}&vote_count.gte=100`), staleTime: 1000 * 60 * 10, refetchOnWindowFocus: false, retry: 2, retryDelay });
}

export function useWatchProviders(id: string | number) {
  return useQuery<WatchProvidersResult>({ queryKey: ['movie', 'watch-providers', id], queryFn: createQueryFn<WatchProvidersResult>(`/api/tmdb/movie/${id}/watch/providers`), enabled: Boolean(id), staleTime: 1000 * 60 * 60 * 6, refetchOnWindowFocus: false, retry: 2, retryDelay });
}
