import axios from 'axios';

const TMDB_BASE_URL = process.env.TMDB_BASE_URL || process.env.NEXT_PUBLIC_TMDB_BASE_URL || 'https://api.tmdb.org/3';
const TMDB_API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY || 'e6f111bca55e80ef8ba6b00fc6aaf9ef';
const TMDB_ACCESS_TOKEN = process.env.TMDB_ACCESS_TOKEN;

export const tmdbClient = axios.create({
  baseURL: TMDB_BASE_URL,
  timeout: 10000,
  headers: {
    Accept: 'application/json',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    ...(TMDB_ACCESS_TOKEN ? { Authorization: `Bearer ${TMDB_ACCESS_TOKEN}` } : {}),
  },
  params: TMDB_ACCESS_TOKEN ? {} : { api_key: TMDB_API_KEY },
});

export const TMDB_IMAGE_BASE_URL = process.env.NEXT_PUBLIC_TMDB_IMAGE_BASE_URL || 'https://image.tmdb.org/t/p';

export const getImageUrl = (path: string | null | undefined, size: 'w300' | 'w500' | 'w780' | 'w1280' | 'original' = 'w500') => {
  if (!path) return 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=1000&auto=format&fit=crop';
  if (path.startsWith('http')) return path;
  return `${TMDB_IMAGE_BASE_URL}/${size}${path}`;
};

export const MOCK_MOVIES = [
  {
    id: 550,
    title: 'Fight Club',
    overview: 'A ticking-time-bomb insomniac and a slippery soap salesman channel primal male aggression into a shocking new form of therapy.',
    poster_path: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=1000&auto=format&fit=crop',
    backdrop_path: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=1000&auto=format&fit=crop',
    vote_average: 8.4,
    release_date: '1999-10-15',
    genre_ids: [18, 53],
  },
  {
    id: 27205,
    title: 'Inception',
    overview: 'Cobb, a skilled thief who steals corporate secrets through dream-sharing technology, is given the inverse task of planting an idea.',
    poster_path: 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?q=80&w=1000&auto=format&fit=crop',
    backdrop_path: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1000&auto=format&fit=crop',
    vote_average: 8.8,
    release_date: '2010-07-16',
    genre_ids: [28, 878, 12],
  },
  {
    id: 157336,
    title: 'Interstellar',
    overview: 'The adventures of a group of explorers who make use of a newly discovered wormhole to surpass the limitations on human space travel.',
    poster_path: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?q=80&w=1000&auto=format&fit=crop',
    backdrop_path: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1000&auto=format&fit=crop',
    vote_average: 8.7,
    release_date: '2014-11-05',
    genre_ids: [12, 18, 878],
  },
  {
    id: 155,
    title: 'The Dark Knight',
    overview: 'Batman raises the stakes in his war on crime. With the help of Lt. Jim Gordon and District Attorney Harvey Dent, Batman sets out to dismantle crime organizations.',
    poster_path: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=1000&auto=format&fit=crop',
    backdrop_path: 'https://images.unsplash.com/photo-1514539079130-25950c84af65?q=80&w=1000&auto=format&fit=crop',
    vote_average: 9.0,
    release_date: '2008-07-18',
    genre_ids: [18, 28, 80],
  },
];

export async function fetchTmdbData<T>(endpoint: string, params: Record<string, any> = {}): Promise<{ data: T; isFallback: boolean; error?: string }> {
  try {
    const res = await tmdbClient.get(endpoint, { params: { api_key: TMDB_API_KEY, ...params } });
    return { data: res.data, isFallback: false };
  } catch (error: any) {
    const isNetworkError = error.code === 'ECONNRESET' || error.code === 'ENOTFOUND' || error.code === 'ETIMEDOUT' || !error.response;
    const errorMsg = isNetworkError
      ? `Network Error (${error.code || 'ECONNRESET'}). Your ISP/firewall is blocking api.themoviedb.org.`
      : `TMDB API error ${error.response?.status}: ${error.response?.data?.status_message || error.message}`;

    console.warn(`[TMDB API Warning] ${errorMsg}. Using fallback mock data.`);

    return {
      data: { results: MOCK_MOVIES, page: 1, total_pages: 1, total_results: MOCK_MOVIES.length } as unknown as T,
      isFallback: true,
      error: errorMsg,
    };
  }
}

export async function testTmdbConnection(): Promise<{ success: boolean; message: string; data?: any }> {
  try {
    const res = await tmdbClient.get('/movie/popular', {
      params: { api_key: TMDB_API_KEY, page: 1 },
    });
    if (res.data && res.data.results) {
      return {
        success: true,
        message: `Successfully connected to TMDB API! Loaded ${res.data.results.length} movies.`,
        data: res.data.results.slice(0, 3),
      };
    }
    return { success: false, message: 'Received unexpected response format from TMDB.' };
  } catch (error: any) {
    const isNetworkError = error.code === 'ECONNRESET' || error.code === 'ENOTFOUND' || error.code === 'ETIMEDOUT' || !error.response;
    return {
      success: false,
      message: isNetworkError
        ? `Network connection error (${error.code || 'ECONNRESET'}). Your ISP or network firewall is blocking requests to api.themoviedb.org.`
        : `TMDB API returned HTTP error ${error.response?.status}: ${error.response?.data?.status_message || error.message}`,
    };
  }
}
