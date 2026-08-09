import { NextResponse } from 'next/server';
import { getUpcomingMovies } from '@/services/tmdb';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const data = await getUpcomingMovies(page);
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch upcoming movies' },
      { status: 500 }
    );
  }
}
