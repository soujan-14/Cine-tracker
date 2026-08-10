import { NextRequest, NextResponse } from 'next/server';
import { getWatchProviders } from '@/services/tmdb';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const data = await getWatchProviders(id);
    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
