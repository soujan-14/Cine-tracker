import { WatchProvidersResult, WatchProvider } from '@/types/tmdb';

export type OttPlatform = 'netflix' | 'prime' | 'hotstar';

export interface OttPlatformInfo {
  name: string;
  urlTemplate: string;
  match: RegExp;
}

const OTT_PLATFORMS: Record<OttPlatform, OttPlatformInfo> = {
  netflix: {
    name: 'Netflix',
    urlTemplate: 'https://www.netflix.com/search?q={movieName}',
    match: /netflix/i,
  },
  prime: {
    name: 'Amazon Prime Video',
    urlTemplate: 'https://www.primevideo.com/search/ref=atv_nb_sr?phrase={movieName}',
    match: /amazon|prime/i,
  },
  hotstar: {
    name: 'Disney+ Hotstar',
    urlTemplate: 'https://www.hotstar.com/in/search?q={movieName}',
    match: /hotstar|disney/i,
  },
};

export function getOttSearchUrl(platform: OttPlatform, movieTitle: string): string {
  const encodedTitle = encodeURIComponent(movieTitle.trim());
  return OTT_PLATFORMS[platform].urlTemplate.replace('{movieName}', encodedTitle);
}

export function isOttAvailable(movie: { release_date?: string | null }): boolean {
  if (!movie.release_date) return false;
  const parsedDate = new Date(`${movie.release_date}T00:00:00`);
  if (Number.isNaN(parsedDate.getTime())) return false;
  const now = new Date();
  const daysSinceRelease = Math.floor(
    (now.getTime() - parsedDate.getTime()) / (1000 * 60 * 60 * 24)
  );
  return daysSinceRelease > 90;
}

export function getDefaultOttUrl(movieTitle: string): string {
  return getOttSearchUrl('netflix', movieTitle);
}

export function hasWatchProviders(
  providers: WatchProvidersResult | null | undefined,
  region: string = 'IN'
): boolean {
  const regionData = providers?.results?.[region] ?? providers?.results?.['US'];
  if (!regionData) return false;
  return Boolean(
    regionData.flatrate?.length ||
    regionData.rent?.length ||
    regionData.buy?.length
  );
}

export function detectOttPlatform(
  providers: WatchProvidersResult | null | undefined,
  region: string = 'IN'
): OttPlatform | null {
  const regionData = providers?.results?.[region] ?? providers?.results?.['US'];
  if (!regionData) return null;

  const allProviders: WatchProvider[] = [
    ...(regionData.flatrate ?? []),
    ...(regionData.rent ?? []),
    ...(regionData.buy ?? []),
  ];

  for (const provider of allProviders) {
    const name = provider.provider_name ?? '';
    for (const [key, info] of Object.entries(OTT_PLATFORMS)) {
      if (info.match.test(name)) {
        return key as OttPlatform;
      }
    }
  }
  return null;
}

export function getBestOttUrl(
  providers: WatchProvidersResult | null | undefined,
  movieTitle: string,
  region: string = 'IN'
): { url: string; platformName: string } | null {
  const detected = detectOttPlatform(providers, region);
  if (detected) {
    return {
      url: getOttSearchUrl(detected, movieTitle),
      platformName: OTT_PLATFORMS[detected].name,
    };
  }
  if (providers && hasWatchProviders(providers, region)) {
    return {
      url: getDefaultOttUrl(movieTitle),
      platformName: 'OTT',
    };
  }
  return null;
}
