export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/roleGuard';

function optionalInt(value: unknown): number | null {
  if (value === undefined || value === null || value === '') return null;
  const parsed = Number(value);
  return Number.isInteger(parsed) ? parsed : null;
}

function optionalNumber(value: unknown): number | null {
  if (value === undefined || value === null || value === '') return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export async function GET(request: NextRequest) {
  const auth = await requireRole(request, ['ADMIN']);
  if (auth instanceof NextResponse) return auth;
  return NextResponse.json(await prisma.movie.findMany({ orderBy: { updatedAt: 'desc' } }));
}

export async function POST(request: NextRequest) {
  const auth = await requireRole(request, ['ADMIN']);
  if (auth instanceof NextResponse) return auth;

  try {
    const body = await request.json();
    const title = typeof body.title === 'string' ? body.title.trim() : '';
    const suppliedId = optionalInt(body.id);
    const tmdbId = optionalInt(body.tmdbId);

    if (!title) {
      return NextResponse.json({ error: 'Movie title is required.' }, { status: 400 });
    }
    if (body.tmdbId !== undefined && body.tmdbId !== '' && (!tmdbId || tmdbId <= 0)) {
      return NextResponse.json({ error: 'TMDB Movie ID must be a positive integer.' }, { status: 400 });
    }

    let id = suppliedId;
    if (!id && tmdbId) {
      const linked = await prisma.movie.findUnique({ where: { tmdbId }, select: { id: true } });
      id = linked?.id ?? tmdbId;
    }
    if (!id) {
      const latestCustom = await prisma.movie.findFirst({
        where: { id: { lt: 0 } },
        orderBy: { id: 'asc' },
        select: { id: true },
      });
      id = latestCustom ? latestCustom.id - 1 : -1;
    }

    const releaseDate = body.releaseDate ? new Date(body.releaseDate) : null;
    if (releaseDate && Number.isNaN(releaseDate.getTime())) {
      return NextResponse.json({ error: 'Invalid release date.' }, { status: 400 });
    }

    const movie = await prisma.movie.upsert({
      where: { id },
      create: {
        id,
        tmdbId,
        title,
        originalTitle: body.originalTitle?.trim() || null,
        overview: body.overview?.trim() || null,
        customPoster: body.customPoster || null,
        customBackdrop: body.customBackdrop || null,
        customTrailer: body.customTrailer || null,
        customCast: body.customCast ?? null,
        customCrew: body.customCrew ?? null,
        customGenres: body.customGenres ?? null,
        releaseDate,
        runtime: optionalInt(body.runtime),
        language: body.language?.trim() || null,
        budget: optionalNumber(body.budget),
        customBoxOffice: optionalNumber(body.customBoxOffice),
        isCustom: true,
      },
      update: {
        tmdbId,
        title,
        originalTitle: body.originalTitle?.trim() || null,
        overview: body.overview?.trim() || null,
        customPoster: body.customPoster || null,
        customBackdrop: body.customBackdrop || null,
        customTrailer: body.customTrailer || null,
        customCast: body.customCast ?? null,
        customCrew: body.customCrew ?? null,
        customGenres: body.customGenres ?? null,
        releaseDate,
        runtime: optionalInt(body.runtime),
        language: body.language?.trim() || null,
        budget: optionalNumber(body.budget),
        customBoxOffice: optionalNumber(body.customBoxOffice),
        isCustom: true,
      },
    });

    return NextResponse.json(movie, { status: 201 });
  } catch (error) {
    console.error('[admin/movies]', error);
    return NextResponse.json({ error: 'Failed to save movie.' }, { status: 500 });
  }
}
