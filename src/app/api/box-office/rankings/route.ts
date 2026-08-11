import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = Math.min(50, Math.max(1, Number(searchParams.get('limit') ?? 12)));
    const year = Number(searchParams.get('year') ?? 0);

    const records = await prisma.boxOffice.findMany({
      include: { movie: true },
      orderBy: { collectionDate: 'desc' },
      take: 500,
    });

    const grouped = new Map<number, { movie: typeof records[number]['movie']; daily: number; latestWeekend: number | null; total: number | null; verified: boolean; latestDate: Date }>();

    for (const record of records) {
      const releaseYear = record.movie.releaseDate?.getFullYear() ?? record.collectionDate.getFullYear();
      if (year && releaseYear !== year) continue;
      const current = grouped.get(record.movieId);
      const daily = Number(record.dailyCollection ?? 0);
      const weekend = record.weekendCollection == null ? null : Number(record.weekendCollection);
      if (!current) {
        grouped.set(record.movieId, {
          movie: record.movie,
          daily,
          latestWeekend: weekend,
          total: record.movie.customBoxOffice != null ? Number(record.movie.customBoxOffice) : null,
          verified: record.verified,
          latestDate: record.collectionDate,
        });
      } else {
        current.daily += daily;
        if (current.latestWeekend === null && weekend !== null) current.latestWeekend = weekend;
        current.verified ||= record.verified;
      }
    }

    const results = Array.from(grouped.values())
      .map((entry) => ({
        movie: {
          id: entry.movie.id,
          title: entry.movie.title,
          poster_path: entry.movie.customPoster,
          backdrop_path: entry.movie.customBackdrop,
          release_date: entry.movie.releaseDate?.toISOString().slice(0, 10) ?? '',
        },
        collection: entry.total ?? (entry.daily > 0 ? entry.daily : entry.latestWeekend),
        dailyTotal: entry.daily,
        weekend: entry.latestWeekend,
        verified: entry.verified,
        latestDate: entry.latestDate,
      }))
      .filter((entry) => entry.collection !== null)
      .sort((a, b) => Number(b.collection) - Number(a.collection))
      .slice(0, limit);

    return NextResponse.json({ results, source: 'local' });
  } catch (error) {
    console.error('[box-office/rankings]', error);
    return NextResponse.json({ error: 'Box office rankings are unavailable.' }, { status: 500 });
  }
}
