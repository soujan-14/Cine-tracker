export type SupportedCountry = 'IN' | 'US' | 'UK';

const COUNTRY_BY_LANGUAGE: Record<string, SupportedCountry> = {
  'en-IN': 'IN',
  'hi-IN': 'IN',
  'kn-IN': 'IN',
  'en-US': 'US',
  'en-GB': 'UK',
};

async function detectCountryByIp(): Promise<SupportedCountry | null> {
  try {
    const response = await fetch('https://ipapi.co/json/', { cache: 'no-store' });
    if (!response.ok) return null;
    const data = (await response.json()) as { country_code?: string };
    const country = data.country_code?.toUpperCase();
    return country === 'IN' || country === 'US' || country === 'GB' ? (country === 'GB' ? 'UK' : country) : null;
  } catch {
    return null;
  }
}

export async function detectUserCountry(): Promise<SupportedCountry> {
  if (typeof window === 'undefined') return 'IN';

  try {
    const country = await new Promise<SupportedCountry | null>((resolve) => {
      if (!navigator.geolocation) return resolve(null);
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const response = await fetch(
              `https://geocode.maps.co/reverse?lat=${position.coords.latitude}&lon=${position.coords.longitude}`,
              { cache: 'no-store' }
            );
            if (!response.ok) return resolve(null);
            const data = (await response.json()) as { address?: { country_code?: string } };
            const code = data.address?.country_code?.toUpperCase();
            resolve(code === 'IN' ? 'IN' : code === 'US' ? 'US' : code === 'GB' ? 'UK' : null);
          } catch {
            resolve(null);
          }
        },
        () => resolve(null),
        { enableHighAccuracy: false, timeout: 5000, maximumAge: 15 * 60 * 1000 }
      );
    });
    if (country) return country;
  } catch {
    // Fall through to IP/language fallback.
  }

  const ipCountry = await detectCountryByIp();
  if (ipCountry) return ipCountry;

  return COUNTRY_BY_LANGUAGE[navigator.language] ?? 'IN';
}
