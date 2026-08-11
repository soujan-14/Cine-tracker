import { NextRequest, NextResponse } from 'next/server';
import { getMovieDetailsMerged } from '@/services/movieCatalog';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    return NextResponse.json(await getMovieDetailsMerged(id));
  } catch (error) {
    console.error('[movie/details]', error);
    return NextResponse.json({ error: 'Movie details are unavailable.' }, { status: 404 });
  }
}
