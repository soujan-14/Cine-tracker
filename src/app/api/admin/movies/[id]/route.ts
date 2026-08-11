export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/roleGuard';

function optionalInt(value: unknown): number | null { if (value === undefined || value === null || value === '') return null; const parsed = Number(value); return Number.isInteger(parsed) ? parsed : null; }
function optionalNumber(value: unknown): number | null { if (value === undefined || value === null || value === '') return null; const parsed = Number(value); return Number.isFinite(parsed) && parsed >= 0 ? parsed : null; }
function normalizeDate(value: unknown): Date | null | 'invalid' { if (value === undefined || value === null || value === '') return null; const date = new Date(String(value)); return Number.isNaN(date.getTime()) ? 'invalid' : date; }
function normalizeString(value: unknown): string | null { return typeof value === 'string' && value.trim() ? value.trim() : null; }
function normalizeUrl(value: unknown, field: string): string | null | NextResponse { const normalized = normalizeString(value); if (!normalized) return null; try { const url = new URL(normalized); if (!['http:', 'https:'].includes(url.protocol)) throw new Error('unsupported'); return normalized; } catch { return NextResponse.json({ error: `Invalid ${field} URL.` }, { status: 400 }); } }
function parseId(value: string): number | null { const id = Number(value); return Number.isInteger(id) ? id : null; }

export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const auth = await requireRole(request, ['ADMIN']);
  if (auth instanceof NextResponse) return auth;
  const { id: rawId } = await context.params;
  const id = parseId(rawId);
  if (id === null) return NextResponse.json({ error: 'Invalid movie ID.' }, { status: 400 });
  const movie = await prisma.movie.findUnique({ where: { id } });
  if (!movie) return NextResponse.json({ error: 'Movie not found.' }, { status: 404 });
  return NextResponse.json(movie, { headers: { 'Cache-Control': 'no-store' } });
}

export async function PUT(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const auth = await requireRole(request, ['ADMIN']);
  if (auth instanceof NextResponse) return auth;
  const { id: rawId } = await context.params;
  const id = parseId(rawId);
  if (id === null) return NextResponse.json({ error: 'Invalid movie ID.' }, { status: 400 });
  try {
    const body = await request.json();
    const title = typeof body.title === 'string' ? body.title.trim() : '';
    if (!title) return NextResponse.json({ error: 'Movie title is required.' }, { status: 400 });
    const tmdbId = optionalInt(body.tmdbId);
    if (body.tmdbId !== undefined && body.tmdbId !== '' && (!tmdbId || tmdbId <= 0)) return NextResponse.json({ error: 'TMDB Movie ID must be a positive integer.' }, { status: 400 });
    const releaseDate = normalizeDate(body.releaseDate);
    if (releaseDate === 'invalid') return NextResponse.json({ error: 'Invalid release date.' }, { status: 400 });
    const customPoster = normalizeUrl(body.customPoster, 'poster');
    const customBackdrop = normalizeUrl(body.customBackdrop, 'backdrop');
    const customTrailer = normalizeUrl(body.customTrailer, 'trailer');
    if (customPoster instanceof NextResponse) return customPoster;
    if (customBackdrop instanceof NextResponse) return customBackdrop;
    if (customTrailer instanceof NextResponse) return customTrailer;
    const existing = await prisma.movie.findUnique({ where: { id }, select: { id: true } });
    if (!existing) return NextResponse.json({ error: 'Movie not found.' }, { status: 404 });
    if (tmdbId) {
      const duplicate = await prisma.movie.findFirst({ where: { tmdbId, NOT: { id } }, select: { id: true } });
      if (duplicate) return NextResponse.json({ error: 'Another movie already uses this TMDB ID.' }, { status: 409 });
    }
    const movie = await prisma.movie.update({ where: { id }, data: { tmdbId, title, originalTitle: normalizeString(body.originalTitle), overview: normalizeString(body.overview), customPoster, customBackdrop, customTrailer, customCast: Array.isArray(body.customCast) ? body.customCast : null, customCrew: Array.isArray(body.customCrew) ? body.customCrew : null, customGenres: Array.isArray(body.customGenres) ? body.customGenres : null, releaseDate, runtime: optionalInt(body.runtime), language: normalizeString(body.language), budget: optionalNumber(body.budget), customBoxOffice: optionalNumber(body.customBoxOffice), isCustom: true } });
    revalidatePath('/'); revalidatePath('/discover'); revalidatePath('/box-office'); revalidatePath('/admin'); revalidatePath(`/movie/${movie.id}`); revalidatePath(`/admin/movies/${movie.id}/edit`);
    return NextResponse.json(movie, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    console.error('[admin/movies/:id]', error);
    return NextResponse.json({ error: 'Failed to update movie.' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const auth = await requireRole(request, ['ADMIN']);
  if (auth instanceof NextResponse) return auth;
  const { id: rawId } = await context.params;
  const id = parseId(rawId);
  if (id === null) return NextResponse.json({ error: 'Invalid movie ID.' }, { status: 400 });
  try {
    const movie = await prisma.movie.findUnique({ where: { id }, select: { id: true } });
    if (!movie) return NextResponse.json({ error: 'Movie not found.' }, { status: 404 });
    await prisma.movie.delete({ where: { id } });
    revalidatePath('/'); revalidatePath('/discover'); revalidatePath('/box-office'); revalidatePath('/admin'); revalidatePath(`/movie/${id}`);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[admin/movies/:id:delete]', error);
    return NextResponse.json({ error: 'Failed to delete movie.' }, { status: 500 });
  }
}
