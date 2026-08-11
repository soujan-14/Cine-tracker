import { NextRequest, NextResponse } from 'next/server';
import { getMovieCreditsMerged } from '@/services/movieCatalog';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    return NextResponse.json(await getMovieCreditsMerged(id));
  } catch (error) {
    console.error('[movie/credits]', error);
    return NextResponse.json({ error: 'Movie credits are unavailable.' }, { status: 404 });
  }
}
