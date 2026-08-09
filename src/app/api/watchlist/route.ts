import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, isNextResponse } from '@/lib/requireAuth';

export async function GET(req: NextRequest) {
  const auth = requireAuth(req);
  if (isNextResponse(auth)) return auth;

  const watchlist = await prisma.watchlist.findMany({
    where: { userId: auth.userId },
    orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json(watchlist);
}

export async function POST(req: NextRequest) {
  const auth = requireAuth(req);
  if (isNextResponse(auth)) return auth;

  const { movieId } = await req.json();
  if (!movieId) return NextResponse.json({ error: 'movieId is required.' }, { status: 400 });

  const item = await prisma.watchlist.upsert({
    where: { userId_movieId: { userId: auth.userId, movieId: Number(movieId) } },
    update: {},
    create: { userId: auth.userId, movieId: Number(movieId) },
  });
  return NextResponse.json(item, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  const auth = requireAuth(req);
  if (isNextResponse(auth)) return auth;

  const { movieId } = await req.json();
  if (!movieId) return NextResponse.json({ error: 'movieId is required.' }, { status: 400 });

  await prisma.watchlist.deleteMany({
    where: { userId: auth.userId, movieId: Number(movieId) },
  });
  return NextResponse.json({ success: true });
}
