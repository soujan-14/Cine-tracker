export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/roleGuard';

function numberOrNull(value: unknown): number | null {
  if (value === undefined || value === null || value === '') return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
}

export async function POST(request: NextRequest) {
  const auth = await requireRole(request, ['ADMIN']);
  if (auth instanceof NextResponse) return auth;

  try {
    const body = await request.json();
    const movieId = Number(body.movieId);
    const dailyCollection = numberOrNull(body.dailyCollection);
    const weekendCollection = numberOrNull(body.weekendCollection);
    const collectionDate = body.collectionDate ? new Date(body.collectionDate) : new Date();

    if (!Number.isInteger(movieId)) return NextResponse.json({ error: 'Valid movieId is required.' }, { status: 400 });
    if (Number.isNaN(collectionDate.getTime())) return NextResponse.json({ error: 'Invalid collection date.' }, { status: 400 });
    if (dailyCollection === null && weekendCollection === null && body.customBoxOffice === undefined) {
      return NextResponse.json({ error: 'At least one collection value is required.' }, { status: 400 });
    }

    const movie = await prisma.movie.upsert({
      where: { id: movieId },
      create: { id: movieId, tmdbId: movieId > 0 ? movieId : null, title: String(body.title ?? `Movie ${movieId}`) },
      update: {},
    });

    if (body.customBoxOffice !== undefined) {
      const customBoxOffice = numberOrNull(body.customBoxOffice);
      await prisma.movie.update({ where: { id: movie.id }, data: { customBoxOffice } });
    }

    const record = await prisma.boxOffice.create({
      data: {
        movieId,
        distributorId: auth.userId,
        dailyCollection,
        weekendCollection,
        collectionDate,
        territory: typeof body.territory === 'string' ? body.territory.trim() || null : null,
        verified: true,
      },
    });

    return NextResponse.json(record, { status: 201 });
  } catch (error) {
    console.error('[admin/box-office]', error);
    return NextResponse.json({ error: 'Failed to update box office.' }, { status: 500 });
  }
}
