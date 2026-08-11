export type BookingPlatform = 'bookmyshow' | 'paytm' | 'fandango' | 'odeon';

export type BookingCountry = 'IN' | 'US' | 'UK';

export function getBookingUrl(movieTitle: string, country: BookingCountry): string {
  const query = encodeURIComponent(movieTitle.trim());

  switch (country) {
    case 'US':
      return `https://www.fandango.com/search?q=${query}`;
    case 'UK':
      return `https://www.odeon.co.uk/search?q=${query}`;
    case 'IN':
    default:
      return `https://in.bookmyshow.com/search?query=${query}`;
  }
}

export function getSecondaryBookingUrl(movieTitle: string, country: BookingCountry): string | null {
  if (country !== 'IN') return null;
  return `https://paytm.com/movies/search?q=${encodeURIComponent(movieTitle.trim())}`;
}

export interface BookingAvailability {
  isEligible: boolean;
  status: 'eligible' | 'not-released' | 'too-old' | 'unknown';
  daysSinceRelease?: number;
}

export function getBookingAvailability(
  releaseDate: string | null | undefined,
  status?: string | null
): BookingAvailability {
  if (!releaseDate) return { isEligible: false, status: 'unknown' };
  const normalizedStatus = status?.toLowerCase();
  if (normalizedStatus && normalizedStatus !== 'released') {
    return { isEligible: false, status: 'not-released' };
  }
  const parsedDate = new Date(`${releaseDate}T00:00:00`);
  if (Number.isNaN(parsedDate.getTime())) return { isEligible: false, status: 'unknown' };
  const daysSinceRelease = Math.floor((Date.now() - parsedDate.getTime()) / 86400000);
  if (daysSinceRelease < 0) return { isEligible: false, status: 'not-released', daysSinceRelease };
  return { isEligible: true, status: 'eligible', daysSinceRelease };
}
