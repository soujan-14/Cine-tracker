import { tmdbAxios } from '@/services/tmdb';

export interface TmdbTestResult {
  success: boolean;
  message: string;
  statusCode?: number;
  baseUrl?: string;
  latencyMs?: number;
  error?: string;
}

export async function testTmdbConnection(): Promise<TmdbTestResult> {
  const startedAt = Date.now();
  try {
    const response = await tmdbAxios.get('/movie/550', {
      timeout: 8000,
      params: { language: 'en-US' },
    });
    const latencyMs = Date.now() - startedAt;
    return {
      success: true,
      message: `TMDB reachable — returned "${response.data.title}" (${response.status})`,
      statusCode: response.status,
      baseUrl: tmdbAxios.defaults.baseURL,
      latencyMs,
    };
  } catch (err: any) {
    const latencyMs = Date.now() - startedAt;
    const message =
      err.response?.data?.status_message ||
      err.message ||
      'Unknown error while contacting TMDB API.';
    return {
      success: false,
      message,
      statusCode: err.response?.status,
      baseUrl: tmdbAxios.defaults.baseURL,
      latencyMs,
      error: message,
    };
  }
}
