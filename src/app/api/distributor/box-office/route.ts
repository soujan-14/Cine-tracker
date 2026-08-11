export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/roleGuard';

export async function GET(request: NextRequest) {
  const auth = requireRole(request, ['DISTRIBUTOR', 'ADMIN']);
  if (auth instanceof NextResponse) return auth;
  const where = auth.role === 'ADMIN' ? {} : { distributorId: auth.userId };
  return NextResponse.json(await prisma.boxOffice.findMany({ where, orderBy: { createdAt: 'desc' }, take: 100 }));
}

export async function POST(request: NextRequest) {
  const auth = requireRole(request, ['DISTRIBUTOR', 'ADMIN']);
  if (auth instanceof NextResponse) return auth;
  try {
    const body = await request.json();
    const movieId = Number(body.movieId);
    if (!Number.isInteger(movieId)) return NextResponse.json({ error: 'Valid movieId is required.' }, { status: 400 });
    await prisma.movie.upsert({ where: { id: movieId }, create: { id: movieId, title: String(body.title ?? `TMDB ${movieId}`) }, update: {} });
    const entry = await prisma.boxOffice.create({
      data: {
        movieId,
        distributorId: auth.userId,
        dailyCollection: body.dailyCollection == null ? null : Number(body.dailyCollection),
        weekendCollection: body.weekendCollection == null ? null : Number(body.weekendCollection),
      },
    });
    return NextResponse.json(entry, { status: 201 });
  } catch (error) {
    console.error('[distributor/box-office]', error);
    return NextResponse.json({ error: 'Failed to save collection.' }, { status: 500 });
  }
}
