import { NextRequest, NextResponse } from 'next/server';
import { getRegionalTrendingMovies } from '@/services/tmdb';

export async function GET(request: NextRequest) {
  try {
    const region = request.nextUrl.searchParams.get('region')?.toUpperCase() ?? '';
    const page = Number(request.nextUrl.searchParams.get('page') ?? 1);
    if (!/^[A-Z]{2}$/.test(region)) return NextResponse.json({ error: 'Invalid region code' }, { status: 400 });
    const data = await getRegionalTrendingMovies(region, page);
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch regional trending movies' }, { status: 500 });
  }
}
