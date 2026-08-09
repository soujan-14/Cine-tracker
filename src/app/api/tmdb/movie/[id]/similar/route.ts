import { NextRequest, NextResponse } from 'next/server';
import { getSimilarMovies } from '@/services/tmdb';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const page = Number(req.nextUrl.searchParams.get('page') ?? 1);
    const data = await getSimilarMovies(id, page);
    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
