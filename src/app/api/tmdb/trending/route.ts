import { NextResponse } from 'next/server';
import { getTrendingMovies } from '@/services/tmdb';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const data = await getTrendingMovies(page);
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch trending movies' },
      { status: 500 }
    );
  }
}
