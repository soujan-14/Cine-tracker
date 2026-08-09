import { NextRequest, NextResponse } from 'next/server';
import { discoverMovies, DiscoverParams } from '@/services/tmdb';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const params: DiscoverParams = {
      sort_by: searchParams.get('sort_by') ?? 'popularity.desc',
      page: Number(searchParams.get('page') ?? 1),
    };
    const genre = searchParams.get('with_genres');
    const year = searchParams.get('primary_release_year');
    const rating = searchParams.get('vote_average.gte');
    if (genre) params.with_genres = genre;
    if (year) params.primary_release_year = Number(year);
    if (rating) params['vote_average.gte'] = Number(rating);
    const voteCount = searchParams.get('vote_count.gte');
    if (voteCount) params['vote_count.gte'] = Number(voteCount);

    const data = await discoverMovies(params);
    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
