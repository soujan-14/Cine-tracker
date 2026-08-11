export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/roleGuard';

function collectionValue(value: unknown): number | null {
  if (value === undefined || value === null || value === '') return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
}

export async function GET(request: NextRequest) {
  const auth = await requireRole(request, ['DISTRIBUTOR', 'ADMIN']);
  if (auth instanceof NextResponse) return auth;
  const where = auth.role === 'ADMIN' ? {} : { distributorId: auth.userId };
  const records = await prisma.boxOffice.findMany({
    where,
    include: {
      movie: { select: { id: true, title: true } },
      distributor: { select: { name: true, email: true } },
    },
    orderBy: [{ updatedAt: 'desc' }, { collectionDate: 'desc' }, { createdAt: 'desc' }],
    take: 100,
  });
  return NextResponse.json(records);
}

export async function POST(request: NextRequest) {
  const auth = await requireRole(request, ['DISTRIBUTOR', 'ADMIN']);
  if (auth instanceof NextResponse) return auth;

  try {
    const body = await request.json();
    const movieId = Number(body.movieId);
    const dailyCollection = collectionValue(body.dailyCollection);
    const weekendCollection = collectionValue(body.weekendCollection);
    const collectionDate = body.collectionDate ? new Date(body.collectionDate) : new Date();
    const territory = typeof body.territory === 'string' ? body.territory.trim() || null : null;

    if (!Number.isInteger(movieId)) return NextResponse.json({ error: 'Valid movieId is required.' }, { status: 400 });
    if (dailyCollection === null && weekendCollection === null) return NextResponse.json({ error: 'Add a daily or weekend collection.' }, { status: 400 });
    if (Number.isNaN(collectionDate.getTime())) return NextResponse.json({ error: 'Invalid collection date.' }, { status: 400 });

    let movie = await prisma.movie.findUnique({ where: { id: movieId } });
    if (!movie) {
      const title = typeof body.title === 'string' ? body.title.trim() : '';
      if (!title) return NextResponse.json({ error: 'Movie title is required for a new movie association.' }, { status: 400 });
      movie = await prisma.movie.create({ data: { id: movieId, tmdbId: movieId > 0 ? movieId : null, title } });
    }

    const start = new Date(collectionDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(end.getDate() + 1);

    const existing = await prisma.boxOffice.findFirst({ where: { movieId, distributorId: auth.userId, territory, collectionDate: { gte: start, lt: end } } });
    const record = existing
      ? await prisma.boxOffice.update({ where: { id: existing.id }, data: { dailyCollection, weekendCollection, collectionDate, territory, verified: auth.role === 'ADMIN' ? true : existing.verified } })
      : await prisma.boxOffice.create({ data: { movieId, distributorId: auth.userId, dailyCollection, weekendCollection, collectionDate, territory, verified: auth.role === 'ADMIN' } });

    return NextResponse.json(record, { status: existing ? 200 : 201 });
  } catch (error) {
    console.error('[distributor/box-office]', error);
    return NextResponse.json({ error: 'Failed to save collection.' }, { status: 500 });
  }
}