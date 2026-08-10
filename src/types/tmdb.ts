export interface Movie {
  id: number;
  title: string;
  original_title?: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  vote_average: number;
  vote_count: number;
  release_date: string;
  genre_ids?: number[];
  popularity?: number;
  adult?: boolean;
  video?: boolean;
}

export interface Genre {
  id: number;
  name: string;
}

export interface ProductionCompany {
  id: number;
  logo_path: string | null;
  name: string;
  origin_country: string;
}

export interface SpokenLanguage {
  english_name: string;
  iso_639_1: string;
  name: string;
}

export interface MovieDetails extends Movie {
  genres: Genre[];
  runtime: number | null;
  tagline: string | null;
  budget: number;
  revenue: number;
  status: string;
  homepage: string | null;
  imdb_id: string | null;
  production_companies: ProductionCompany[];
  spoken_languages: SpokenLanguage[];
}

export interface CastMember {
  id: number;
  name: string;
  original_name: string;
  character: string;
  profile_path: string | null;
  order: number;
}

export interface CrewMember {
  id: number;
  name: string;
  original_name: string;
  job: string;
  department: string;
  profile_path: string | null;
}

export interface MovieCredits {
  id: number;
  cast: CastMember[];
  crew: CrewMember[];
}

export interface VideoResult {
  id: string;
  iso_639_1: string;
  iso_3166_1: string;
  name: string;
  key: string;
  site: string;
  size: number;
  type: string;
  official: boolean;
  published_at: string;
}

export interface MovieVideosResponse {
  id: number;
  results: VideoResult[];
}

export interface TmdbPaginatedResponse<T = Movie> {
  page: number;
  results: T[];
  total_pages: number;
  total_results: number;
}

export interface WatchProvider {
  display_priority?: number;
  logo_path?: string;
  provider_id?: number;
  provider_name: string;
  display_priorities?: Record<string, number>;
}

export interface WatchProvidersResult {
  id?: number;
  results?: Record<string, {
    link?: string;
    flatrate?: WatchProvider[];
    rent?: WatchProvider[];
    buy?: WatchProvider[];
  }>;
}

export interface TmdbApiError {
  message: string;
  status_code?: number;
  status_message?: string;
}
