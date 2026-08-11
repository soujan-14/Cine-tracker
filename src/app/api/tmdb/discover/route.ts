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
    const releaseGte = searchParams.get('primary_release_date_gte');
    const releaseLte = searchParams.get('primary_release_date_lte');
    const releaseType = searchParams.get('with_release_type');
    const region = searchParams.get('region');
    const rating = searchParams.get('vote_average.gte');
    const voteCount = searchParams.get('vote_count.gte');
    if (genre) params.with_genres = genre;
    if (year) params.primary_release_year = Number(year);
    if (releaseGte) params.primary_release_date_gte = releaseGte;
    if (releaseLte) params.primary_release_date_lte = releaseLte;
    if (releaseType) params.with_release_type = releaseType;
    if (region) params.region = region.toUpperCase();
    if (rating) params['vote_average.gte'] = Number(rating);
    if (voteCount) params['vote_count.gte'] = Number(voteCount);

    const data = await discoverMovies(params);
    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to fetch movies' }, { status: 500 });
  }
}
