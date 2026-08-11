import { NextRequest, NextResponse } from 'next/server';
import { getSimilarMoviesMerged } from '@/services/movieCatalog';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const page = Math.max(1, Number(req.nextUrl.searchParams.get('page') ?? 1));
    return NextResponse.json(await getSimilarMoviesMerged(id, page));
  } catch (error) {
    console.error('[movie/similar]', error);
    return NextResponse.json({ error: 'Similar movies are unavailable.' }, { status: 404 });
  }
}
