export function getAuthSecret(): string {
  const secret = process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET;
  if (!secret) throw new Error('JWT_SECRET / NEXTAUTH_SECRET must be configured.');
  return secret;
}

export function getDatabaseUrl(): string | undefined {
  return process.env.DATABASE_URL;
}

export function getTmdbApiKey(): string | undefined {
  return process.env.NEXT_PUBLIC_TMDB_API_KEY || process.env.TMDB_API_KEY;
}

export function getTmdbAccessToken(): string | undefined {
  return process.env.TMDB_ACCESS_TOKEN || process.env.NEXT_PUBLIC_TMDB_ACCESS_TOKEN;
}

export function getEnv(key: string, fallback?: string): string | undefined {
  return process.env[key] ?? fallback;
}
