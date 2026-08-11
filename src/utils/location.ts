export type SupportedCountry = string;

const LOCATION_PREFERENCE_KEY = 'cine-tracker-location-preference';
const LOCATION_REGION_KEY = 'cine-tracker-region';

export type LocationPreference = 'allow' | 'denied' | 'not-now';

export function getLocationPreference(): LocationPreference | null {
  if (typeof window === 'undefined') return null;
  const value = window.localStorage.getItem(LOCATION_PREFERENCE_KEY);
  return value === 'allow' || value === 'denied' || value === 'not-now' ? value : null;
}

export function setLocationPreference(preference: LocationPreference): void {
  if (typeof window !== 'undefined') window.localStorage.setItem(LOCATION_PREFERENCE_KEY, preference);
}

export function getStoredRegion(): string | null {
  if (typeof window === 'undefined') return null;
  const value = window.localStorage.getItem(LOCATION_REGION_KEY)?.toUpperCase() ?? null;
  return value && /^[A-Z]{2}$/.test(value) ? value : null;
}

function storeRegion(region: string): string {
  const normalized = region.trim().toUpperCase();
  if (!/^[A-Z]{2}$/.test(normalized)) throw new Error('Invalid region code');
  window.localStorage.setItem(LOCATION_REGION_KEY, normalized);
  return normalized;
}

export function clearStoredRegion(): void {
  if (typeof window !== 'undefined') window.localStorage.removeItem(LOCATION_REGION_KEY);
}

export function requestUserRegion(): Promise<string> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      reject(new Error('Geolocation is unavailable'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const response = await fetch(`https://geocode.maps.co/reverse?lat=${encodeURIComponent(position.coords.latitude)}&lon=${encodeURIComponent(position.coords.longitude)}`, { cache: 'no-store' });
          if (!response.ok) throw new Error('Reverse geocoding failed');
          const data = (await response.json()) as { address?: { country_code?: string } };
          const region = data.address?.country_code;
          if (!region) throw new Error('Country code unavailable');
          resolve(storeRegion(region));
        } catch (error) {
          reject(error);
        }
      },
      (error) => reject(error),
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 0 }
    );
  });
}

export async function detectUserCountry(): Promise<SupportedCountry> {
  if (typeof window === 'undefined') return 'IN';
  const stored = getStoredRegion();
  if (stored) return stored;
  try {
    return await requestUserRegion();
  } catch {
    return 'IN';
  }
}
