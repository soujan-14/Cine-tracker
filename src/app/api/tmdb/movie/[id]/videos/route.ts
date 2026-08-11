import { NextRequest, NextResponse } from 'next/server';
import { getMovieVideosMerged } from '@/services/movieCatalog';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    return NextResponse.json(await getMovieVideosMerged(id));
  } catch (error) {
    console.error('[movie/videos]', error);
    return NextResponse.json({ error: 'Movie videos are unavailable.' }, { status: 404 });
  }
}
