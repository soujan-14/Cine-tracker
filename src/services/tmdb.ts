import axios, { AxiosInstance } from 'axios';
import {
  Movie,
  MovieDetails,
  MovieCredits,
  MovieVideosResponse,
  TmdbPaginatedResponse,
  WatchProvidersResult,
} from '@/types/tmdb';

const TMDB_BASE_URL =
  process.env.TMDB_BASE_URL ||
  process.env.NEXT_PUBLIC_TMDB_BASE_URL ||
  'https://api.tmdb.org/3';

const TMDB_API_KEY =
  process.env.NEXT_PUBLIC_TMDB_API_KEY ||
  process.env.TMDB_API_KEY ||
  'e6f111bca55e80ef8ba6b00fc6aaf9ef';

const TMDB_ACCESS_TOKEN = process.env.TMDB_ACCESS_TOKEN;

const IMAGE_BASE_URL =
  process.env.NEXT_PUBLIC_TMDB_IMAGE_BASE_URL || 'https://image.tmdb.org/t/p';

export const tmdbAxios: AxiosInstance = axios.create({
  baseURL: TMDB_BASE_URL,
  timeout: 10000,
  headers: {
    Accept: 'application/json',
    'User-Agent':
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    ...(TMDB_ACCESS_TOKEN ? { Authorization: `Bearer ${TMDB_ACCESS_TOKEN}` } : {}),
  },
  params: TMDB_ACCESS_TOKEN ? {} : { api_key: TMDB_API_KEY },
});

export function getImageUrl(
  path: string | null | undefined,
  size: 'w300' | 'w500' | 'w780' | 'w1280' | 'original' = 'w500'
): string {
  if (!path) {
    return 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=1000&auto=format&fit=crop';
  }
  if (path.startsWith('http')) return path;
  return `${IMAGE_BASE_URL}/${size}${path}`;
}

async function fetchFromTmdb<T>(endpoint: string, params: Record<string, any> = {}): Promise<T> {
  try {
    const response = await tmdbAxios.get<T>(endpoint, {
      params: {
        ...(!TMDB_ACCESS_TOKEN ? { api_key: TMDB_API_KEY } : {}),
        ...params,
      },
    });
    return response.data;
  } catch (error: any) {
    const message =
      error.response?.data?.status_message ||
      error.message ||
      'Failed to communicate with TMDB API service.';
    throw new Error(message);
  }
}

export async function getTrendingMovies(page = 1): Promise<TmdbPaginatedResponse<Movie>> {
  return fetchFromTmdb<TmdbPaginatedResponse<Movie>>('/trending/movie/day', { page });
}

export async function getTopRatedMovies(page = 1): Promise<TmdbPaginatedResponse<Movie>> {
  return fetchFromTmdb<TmdbPaginatedResponse<Movie>>('/movie/top_rated', { page });
}

export async function getUpcomingMovies(page = 1): Promise<TmdbPaginatedResponse<Movie>> {
  return fetchFromTmdb<TmdbPaginatedResponse<Movie>>('/movie/upcoming', { page });
}

export async function searchMovies(query: string, page = 1): Promise<TmdbPaginatedResponse<Movie>> {
  if (!query || !query.trim()) {
    return { page: 1, results: [], total_pages: 0, total_results: 0 };
  }
  return fetchFromTmdb<TmdbPaginatedResponse<Movie>>('/search/movie', {
    query: query.trim(),
    page,
  });
}

export interface DiscoverParams {
  with_genres?: string;
  primary_release_year?: number;
  'vote_average.gte'?: number;
  'vote_count.gte'?: number;
  sort_by?: string;
  page?: number;
}

export async function discoverMovies(
  params: DiscoverParams = {}
): Promise<TmdbPaginatedResponse<Movie>> {
  const cleaned = Object.fromEntries(
    Object.entries(params).filter(([, v]) => v !== undefined && v !== '' && v !== 0)
  );
  return fetchFromTmdb<TmdbPaginatedResponse<Movie>>('/discover/movie', cleaned);
}

export async function getMovieDetails(id: number | string): Promise<MovieDetails> {
  if (!id) throw new Error('Movie ID is required');
  return fetchFromTmdb<MovieDetails>(`/movie/${id}`);
}

export async function getMovieCredits(id: number | string): Promise<MovieCredits> {
  if (!id) throw new Error('Movie ID is required');
  return fetchFromTmdb<MovieCredits>(`/movie/${id}/credits`);
}

export async function getMovieVideos(id: number | string): Promise<MovieVideosResponse> {
  if (!id) throw new Error('Movie ID is required');
  return fetchFromTmdb<MovieVideosResponse>(`/movie/${id}/videos`);
}

export async function getSimilarMovies(
  id: number | string,
  page = 1
): Promise<TmdbPaginatedResponse<Movie>> {
  if (!id) throw new Error('Movie ID is required');
  return fetchFromTmdb<TmdbPaginatedResponse<Movie>>(`/movie/${id}/similar`, { page });
}

export async function getRecommendedMovies(
  id: number | string,
  page = 1
): Promise<TmdbPaginatedResponse<Movie>> {
  if (!id) throw new Error('Movie ID is required');
  return fetchFromTmdb<TmdbPaginatedResponse<Movie>>(`/movie/${id}/recommendations`, { page });
}

export async function getWatchProviders(id: number | string): Promise<WatchProvidersResult> {
  if (!id) throw new Error('Movie ID is required');
  return fetchFromTmdb<WatchProvidersResult>(`/movie/${id}/watch/providers`);
}
