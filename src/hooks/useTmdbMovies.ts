import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Movie, MovieCredits, MovieDetails, MovieVideosResponse, TmdbPaginatedResponse, WatchProvidersResult } from '@/types/tmdb';
import { DiscoverParams } from '@/services/tmdb';

async function fetcher<T>(url: string): Promise<T> {
  const response = await axios.get<T>(url);
  return response.data;
}

export function useTrendingMovies(page = 1) {
  return useQuery<TmdbPaginatedResponse<Movie>>({
    queryKey: ['movies', 'trending', page],
    queryFn: () => fetcher<TmdbPaginatedResponse<Movie>>(`/api/tmdb/trending?page=${page}`),
    staleTime: 1000 * 60 * 10, // 10 minutes cache
    refetchOnWindowFocus: false,
  });
}

export function useTopRatedMovies(page = 1) {
  return useQuery<TmdbPaginatedResponse<Movie>>({
    queryKey: ['movies', 'top-rated', page],
    queryFn: () => fetcher<TmdbPaginatedResponse<Movie>>(`/api/tmdb/top-rated?page=${page}`),
    staleTime: 1000 * 60 * 10, // 10 minutes cache
    refetchOnWindowFocus: false,
  });
}

export function useUpcomingMovies(page = 1) {
  return useQuery<TmdbPaginatedResponse<Movie>>({
    queryKey: ['movies', 'upcoming', page],
    queryFn: () => fetcher<TmdbPaginatedResponse<Movie>>(`/api/tmdb/upcoming?page=${page}`),
    staleTime: 1000 * 60 * 10, // 10 minutes cache
    refetchOnWindowFocus: false,
  });
}

export function useSearchMovies(query: string, page = 1) {
  return useQuery<TmdbPaginatedResponse<Movie>>({
    queryKey: ['movies', 'search', query, page],
    queryFn: () => fetcher<TmdbPaginatedResponse<Movie>>(`/api/tmdb/search?query=${encodeURIComponent(query)}&page=${page}`),
    enabled: Boolean(query && query.trim().length > 0),
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });
}

export function useMovieDetails(id: string | number) {
  return useQuery<MovieDetails>({
    queryKey: ['movie', 'details', id],
    queryFn: () => fetcher<MovieDetails>(`/api/tmdb/movie/${id}/details`),
    enabled: Boolean(id),
    staleTime: 1000 * 60 * 30,
    refetchOnWindowFocus: false,
  });
}

export function useMovieCredits(id: string | number) {
  return useQuery<MovieCredits>({
    queryKey: ['movie', 'credits', id],
    queryFn: () => fetcher<MovieCredits>(`/api/tmdb/movie/${id}/credits`),
    enabled: Boolean(id),
    staleTime: 1000 * 60 * 30,
    refetchOnWindowFocus: false,
  });
}

export function useMovieVideos(id: string | number) {
  return useQuery<MovieVideosResponse>({
    queryKey: ['movie', 'videos', id],
    queryFn: () => fetcher<MovieVideosResponse>(`/api/tmdb/movie/${id}/videos`),
    enabled: Boolean(id),
    staleTime: 1000 * 60 * 30,
    refetchOnWindowFocus: false,
  });
}

export function useSimilarMovies(id: string | number) {
  return useQuery<TmdbPaginatedResponse<Movie>>({
    queryKey: ['movie', 'similar', id],
    queryFn: () => fetcher<TmdbPaginatedResponse<Movie>>(`/api/tmdb/movie/${id}/similar`),
    enabled: Boolean(id),
    staleTime: 1000 * 60 * 30,
    refetchOnWindowFocus: false,
  });
}

export function useRecommendedMovies(id: string | number) {
  return useQuery<TmdbPaginatedResponse<Movie>>({
    queryKey: ['movie', 'recommendations', id],
    queryFn: () => fetcher<TmdbPaginatedResponse<Movie>>(`/api/tmdb/movie/${id}/recommendations`),
    enabled: Boolean(id),
    staleTime: 1000 * 60 * 30,
    refetchOnWindowFocus: false,
  });
}

export function useDiscoverMovies(params: DiscoverParams) {
  const searchParams = new URLSearchParams();
  searchParams.set('sort_by', params.sort_by ?? 'popularity.desc');
  searchParams.set('page', String(params.page ?? 1));
  if (params.with_genres) searchParams.set('with_genres', params.with_genres);
  if (params.primary_release_year) searchParams.set('primary_release_year', String(params.primary_release_year));
  if (params['vote_average.gte']) searchParams.set('vote_average.gte', String(params['vote_average.gte']));

  return useQuery<TmdbPaginatedResponse<Movie>>({
    queryKey: ['movies', 'discover', params],
    queryFn: () => fetcher<TmdbPaginatedResponse<Movie>>(`/api/tmdb/discover?${searchParams.toString()}`),
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });
}

export function useRevenueMovies(year?: number) {
  const searchParams = new URLSearchParams();
  searchParams.set('sort_by', 'revenue.desc');
  searchParams.set('page', '1');
  searchParams.set('vote_count.gte', '200');
  if (year) searchParams.set('primary_release_year', String(year));

  return useQuery<TmdbPaginatedResponse<Movie>>({
    queryKey: ['movies', 'revenue', year ?? 'all'],
    queryFn: () => fetcher<TmdbPaginatedResponse<Movie>>(`/api/tmdb/discover?${searchParams.toString()}`),
    staleTime: 1000 * 60 * 30,
    refetchOnWindowFocus: false,
  });
}

export function usePopularMovies(page = 1) {
  return useQuery<TmdbPaginatedResponse<Movie>>({
    queryKey: ['movies', 'popular', page],
    queryFn: () => fetcher<TmdbPaginatedResponse<Movie>>(`/api/tmdb/discover?sort_by=popularity.desc&page=${page}&vote_count.gte=100`),
    staleTime: 1000 * 60 * 10,
    refetchOnWindowFocus: false,
  });
}

export function useWatchProviders(id: string | number) {
  return useQuery<WatchProvidersResult>({
    queryKey: ['movie', 'watch-providers', id],
    queryFn: () => fetcher<WatchProvidersResult>(`/api/tmdb/movie/${id}/watch/providers`),
    enabled: Boolean(id),
    staleTime: 1000 * 60 * 60 * 6,
    refetchOnWindowFocus: false,
  });
}
