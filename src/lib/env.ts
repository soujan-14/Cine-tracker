export function getAuthSecret(): string {
  const secret = process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET;
  if (!secret) {
    console.warn('[auth] JWT_SECRET / NEXTAUTH_SECRET not set — using insecure fallback.');
    return 'cine-tracker-dev-insecure-secret-change-me';
  }
  return secret;
}

export function getDatabaseUrl(): string | undefined {
  return process.env.DATABASE_URL;
}

export function getTmdbApiKey(): string {
  return (
    process.env.NEXT_PUBLIC_TMDB_API_KEY ||
    process.env.TMDB_API_KEY ||
    'e6f111bca55e80ef8ba6b00fc6aaf9ef'
  );
}

export function getTmdbAccessToken(): string | undefined {
  return process.env.TMDB_ACCESS_TOKEN || process.env.NEXT_PUBLIC_TMDB_ACCESS_TOKEN;
}

export function getEnv(key: string, fallback?: string): string | undefined {
  return process.env[key] ?? fallback;
}
