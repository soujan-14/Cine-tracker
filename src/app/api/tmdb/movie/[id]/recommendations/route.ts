import { NextRequest, NextResponse } from 'next/server';
import { getRecommendedMoviesMerged } from '@/services/movieCatalog';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const page = Math.max(1, Number(req.nextUrl.searchParams.get('page') ?? 1));
    return NextResponse.json(await getRecommendedMoviesMerged(id, page));
  } catch (error) {
    console.error('[movie/recommendations]', error);
    return NextResponse.json({ error: 'Recommendations are unavailable.' }, { status: 404 });
  }
}
