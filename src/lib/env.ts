function getEnv(name: string): string | undefined {
  const value = process.env[name];
  return value && value.trim() ? value : undefined;
}

export function getDatabaseUrl(): string | undefined {
  return getEnv('DATABASE_URL');
}

export function getAuthSecret(): string {
  return getEnv('NEXTAUTH_SECRET') || getEnv('JWT_SECRET') || 'dev-secret-change-in-production';
}

export function getAppUrl(): string {
  return getEnv('NEXTAUTH_URL') || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');
}

export function hasDatabaseConfig(): boolean {
  return Boolean(getDatabaseUrl());
}
