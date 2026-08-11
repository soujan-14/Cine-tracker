import { NextRequest, NextResponse } from 'next/server';
import { getWatchProvidersMerged } from '@/services/movieCatalog';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    return NextResponse.json(await getWatchProvidersMerged(id));
  } catch (error) {
    console.error('[movie/watch-providers]', error);
    return NextResponse.json({ results: {} }, { status: 200 });
  }
}
