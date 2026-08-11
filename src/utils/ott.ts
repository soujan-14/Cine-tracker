import { WatchProvidersResult, WatchProvider } from '@/types/tmdb';

export type OttPlatform = 'netflix' | 'prime' | 'hotstar';
export interface OttPlatformInfo { name: string; urlTemplate: string; match: RegExp; }

const OTT_PLATFORMS: Record<OttPlatform, OttPlatformInfo> = {
  netflix: { name: 'Netflix', urlTemplate: 'https://www.netflix.com/search?q={movieName}', match: /netflix/i },
  prime: { name: 'Amazon Prime Video', urlTemplate: 'https://www.primevideo.com/search/ref=atv_nb_sr?phrase={movieName}', match: /amazon|prime/i },
  hotstar: { name: 'Disney+ Hotstar', urlTemplate: 'https://www.hotstar.com/in/search?q={movieName}', match: /hotstar|disney/i },
};

export function getOttSearchUrl(platform: OttPlatform, movieTitle: string): string {
  return OTT_PLATFORMS[platform].urlTemplate.replace('{movieName}', encodeURIComponent(movieTitle.trim()));
}

export function isOttAvailable(movie: { release_date?: string | null }): boolean {
  if (!movie.release_date) return false;
  const parsedDate = new Date(`${movie.release_date}T00:00:00`);
  if (Number.isNaN(parsedDate.getTime())) return false;
  return Math.floor((Date.now() - parsedDate.getTime()) / (1000 * 60 * 60 * 24)) > 90;
}

export function getDefaultOttUrl(movieTitle: string): string { return getOttSearchUrl('netflix', movieTitle); }
function getRegionData(providers: WatchProvidersResult | null | undefined, region = 'IN') { return providers?.results?.[region] ?? providers?.results?.US; }

export function hasWatchProviders(providers: WatchProvidersResult | null | undefined, region = 'IN'): boolean {
  const data = getRegionData(providers, region);
  return Boolean(data?.flatrate?.length || data?.rent?.length || data?.buy?.length);
}

export function detectOttPlatform(providers: WatchProvidersResult | null | undefined, region = 'IN'): OttPlatform | null {
  const data = getRegionData(providers, region);
  if (!data) return null;
  const all: WatchProvider[] = [...(data.flatrate ?? []), ...(data.rent ?? []), ...(data.buy ?? [])];
  for (const provider of all) for (const [key, info] of Object.entries(OTT_PLATFORMS)) if (info.match.test(provider.provider_name ?? '')) return key as OttPlatform;
  return null;
}

export function getBestOttUrl(providers: WatchProvidersResult | null | undefined, movieTitle: string, region = 'IN'): { url: string; platformName: string } | null {
  const data = getRegionData(providers, region);
  // TMDB's region link is the authoritative landing page for the movie's current providers.
  if (data?.link) {
    const detected = detectOttPlatform(providers, region);
    return { url: data.link, platformName: detected ? OTT_PLATFORMS[detected].name : 'Where to Watch' };
  }
  const detected = detectOttPlatform(providers, region);
  if (detected) return { url: getOttSearchUrl(detected, movieTitle), platformName: OTT_PLATFORMS[detected].name };
  return null;
}
