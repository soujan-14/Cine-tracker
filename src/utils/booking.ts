export type BookingPlatform = 'bookmyshow' | 'paytm';

export interface BookingAvailability {
  isEligible: boolean;
  status: 'eligible' | 'not-released' | 'too-old' | 'unknown';
  daysSinceRelease?: number;
}

export function getBookingAvailability(
  releaseDate: string | null | undefined,
  status?: string | null
): BookingAvailability {
  if (!releaseDate) {
    return { isEligible: false, status: 'unknown' };
  }

  const normalizedStatus = status?.toLowerCase();
  if (normalizedStatus && normalizedStatus !== 'released') {
    return { isEligible: false, status: 'not-released' };
  }

  const parsedDate = new Date(`${releaseDate}T00:00:00`);

  if (Number.isNaN(parsedDate.getTime())) {
    return { isEligible: false, status: 'unknown' };
  }

  const now = new Date();
  const diffMs = now.getTime() - parsedDate.getTime();
  const daysSinceRelease = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (daysSinceRelease < 0) {
    return { isEligible: false, status: 'not-released' };
  }

  if (daysSinceRelease > 90) {
    return { isEligible: false, status: 'too-old' };
  }

  return { isEligible: true, status: 'eligible', daysSinceRelease };
}

export function getBookingUrl(movieTitle: string, platform: BookingPlatform): string {
  const query = encodeURIComponent(movieTitle.trim());

  if (platform === 'paytm') {
    return `https://paytm.com/movies/search?search=${query}`;
  }

  return `https://in.bookmyshow.com/search?query=${query}`;
}
