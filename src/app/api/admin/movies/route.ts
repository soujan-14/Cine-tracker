export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/roleGuard';

export async function GET(request: NextRequest) {
  const auth = requireRole(request, ['ADMIN']);
  if (auth instanceof NextResponse) return auth;
  return NextResponse.json(await prisma.movie.findMany({ orderBy: { updatedAt: 'desc' } }));
}

export async function POST(request: NextRequest) {
  const auth = requireRole(request, ['ADMIN']);
  if (auth instanceof NextResponse) return auth;
  try {
    const body = await request.json();
    const id = Number(body.id);
    const title = String(body.title ?? '').trim();
    if (!Number.isInteger(id) || !title) return NextResponse.json({ error: 'Valid movie id and title are required.' }, { status: 400 });

    const movie = await prisma.movie.upsert({
      where: { id },
      create: { id, title, customPoster: body.customPoster || null, customTrailer: body.customTrailer || null, customCast: body.customCast ?? null, customBoxOffice: body.customBoxOffice ?? null },
      update: { title, customPoster: body.customPoster || null, customTrailer: body.customTrailer || null, customCast: body.customCast ?? null, customBoxOffice: body.customBoxOffice ?? null },
    });
    return NextResponse.json(movie, { status: 201 });
  } catch (error) {
    console.error('[admin/movies]', error);
    return NextResponse.json({ error: 'Failed to save movie.' }, { status: 500 });
  }
}
