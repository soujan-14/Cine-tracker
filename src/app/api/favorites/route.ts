import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, isNextResponse } from '@/lib/requireAuth';

export async function GET(req: NextRequest) {
  const auth = requireAuth(req);
  if (isNextResponse(auth)) return auth;

  const favorites = await prisma.favorite.findMany({
    where: { userId: auth.userId },
    orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json(favorites);
}

export async function POST(req: NextRequest) {
  const auth = requireAuth(req);
  if (isNextResponse(auth)) return auth;

  const { movieId } = await req.json();
  if (!movieId) return NextResponse.json({ error: 'movieId is required.' }, { status: 400 });

  const favorite = await prisma.favorite.upsert({
    where: { userId_movieId: { userId: auth.userId, movieId: Number(movieId) } },
    update: {},
    create: { userId: auth.userId, movieId: Number(movieId) },
  });
  return NextResponse.json(favorite, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  const auth = requireAuth(req);
  if (isNextResponse(auth)) return auth;

  const { movieId } = await req.json();
  if (!movieId) return NextResponse.json({ error: 'movieId is required.' }, { status: 400 });

  await prisma.favorite.deleteMany({
    where: { userId: auth.userId, movieId: Number(movieId) },
  });
  return NextResponse.json({ success: true });
}
