import { NextResponse } from 'next/server';
import { searchMovieCatalog } from '@/services/movieCatalog';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query') || '';
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    return NextResponse.json(await searchMovieCatalog(query, page));
  } catch (error) {
    console.error('[tmdb/search]', error);
    return NextResponse.json({ error: 'Failed to search movies.' }, { status: 500 });
  }
}
