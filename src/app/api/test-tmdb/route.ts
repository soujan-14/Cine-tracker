import { NextResponse } from 'next/server';
import { testTmdbConnection } from '@/lib/tmdb';

export async function GET() {
  const result = await testTmdbConnection();
  return NextResponse.json(result, { status: result.success ? 200 : 200 });
}
