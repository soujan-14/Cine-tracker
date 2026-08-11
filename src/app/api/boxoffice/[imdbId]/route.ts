import { NextResponse } from 'next/server';
import { getBoxOfficeData } from '@/services/boxoffice';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ imdbId: string }> },
) {
  try {
    const { imdbId } = await params;
    const { searchParams } = new URL(request.url);
    const movieIdParam = Number(searchParams.get('movieId') ?? '0');
    const revenue = Number(searchParams.get('revenue') ?? '0');
    const budget = Number(searchParams.get('budget') ?? '0');
    const data = await getBoxOfficeData(imdbId === 'null' ? null : imdbId, revenue, budget, Number.isInteger(movieIdParam) && movieIdParam !== 0 ? movieIdParam : null);
    return NextResponse.json(data);
  } catch (error) {
    console.error('[boxoffice]', error);
    return NextResponse.json({ error: 'Failed to fetch box office data.' }, { status: 500 });
  }
}
