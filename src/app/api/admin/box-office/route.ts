export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/roleGuard';

export async function POST(request: NextRequest) {
  const auth = requireRole(request, ['ADMIN', 'DISTRIBUTOR']);
  if (auth instanceof NextResponse) return auth;
  try {
    const body = await request.json();
    const movieId = Number(body.movieId);
    if (!Number.isInteger(movieId)) return NextResponse.json({ error: 'Valid movieId is required.' }, { status: 400 });

    const movie = await prisma.movie.upsert({ where: { id: movieId }, create: { id: movieId, title: String(body.title ?? `TMDB Movie ${movieId}`) }, update: {} });
    const distributorId = auth.role === 'DISTRIBUTOR' ? auth.userId : String(body.distributorId ?? auth.userId);

    if (auth.role === 'ADMIN' && body.customBoxOffice !== undefined) {
      await prisma.movie.update({ where: { id: movie.id }, data: { customBoxOffice: body.customBoxOffice } });
    }

    const record = await prisma.boxOffice.create({
      data: {
        movieId,
        distributorId,
        dailyCollection: body.dailyCollection ?? null,
        weekendCollection: body.weekendCollection ?? null,
      },
    });
    return NextResponse.json(record, { status: 201 });
  } catch (error) {
    console.error('[box-office]', error);
    return NextResponse.json({ error: 'Failed to update box office.' }, { status: 500 });
  }
}
