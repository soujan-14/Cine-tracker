export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/roleGuard';

function collectionValue(value: unknown): number | null {
  if (value === undefined || value === null || value === '') return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
}

function parseDate(value: unknown): Date | null {
  if (value === undefined || value === null || value === '') return null;
  const date = new Date(String(value));
  return Number.isNaN(date.getTime()) ? null : date;
}

function parseId(value: string): string | null { return value.trim() || null; }

export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const auth = await requireRole(request, ['DISTRIBUTOR', 'ADMIN']);
  if (auth instanceof NextResponse) return auth;
  const { id: rawId } = await context.params;
  const id = parseId(rawId);
  if (!id) return NextResponse.json({ error: 'Invalid box-office ID.' }, { status: 400 });
  const record = await prisma.boxOffice.findUnique({ where: { id }, include: { movie: { select: { id: true, title: true } } } });
  if (!record) return NextResponse.json({ error: 'Collection record not found.' }, { status: 404 });
  if (auth.role !== 'ADMIN' && record.distributorId !== auth.userId) return NextResponse.json({ error: 'Unauthorized.' }, { status: 403 });
  return NextResponse.json(record, { headers: { 'Cache-Control': 'no-store' } });
}

export async function PUT(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const auth = await requireRole(request, ['DISTRIBUTOR', 'ADMIN']);
  if (auth instanceof NextResponse) return auth;
  const { id: rawId } = await context.params;
  const id = parseId(rawId);
  if (!id) return NextResponse.json({ error: 'Invalid box-office ID.' }, { status: 400 });

  try {
    const existing = await prisma.boxOffice.findUnique({ where: { id }, select: { id: true, movieId: true, distributorId: true } });
    if (!existing) return NextResponse.json({ error: 'Collection record not found.' }, { status: 404 });
    if (auth.role !== 'ADMIN' && existing.distributorId !== auth.userId) return NextResponse.json({ error: 'Unauthorized.' }, { status: 403 });

    const body = await request.json();
    const dailyCollection = collectionValue(body.dailyCollection);
    const weekendCollection = collectionValue(body.weekendCollection);
    const collectionDate = parseDate(body.collectionDate);
    const territory = typeof body.territory === 'string' ? body.territory.trim() || null : null;
    if (!collectionDate) return NextResponse.json({ error: 'Invalid collection date.' }, { status: 400 });
    if (dailyCollection === null && weekendCollection === null) return NextResponse.json({ error: 'Add a daily or weekend collection.' }, { status: 400 });

    // Ownership and movie association are immutable for distributor edits.
    const record = await prisma.boxOffice.update({
      where: { id },
      data: { dailyCollection, weekendCollection, collectionDate, territory, ...(auth.role === 'ADMIN' ? { verified: true } : {}) },
      include: { movie: { select: { id: true, title: true } } },
    });

    revalidatePath('/box-office');
    revalidatePath('/admin');
    revalidatePath('/distributor');
    revalidatePath(`/movie/${existing.movieId}`);
    return NextResponse.json(record, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    console.error('[distributor/box-office/:id]', error);
    return NextResponse.json({ error: 'Failed to update collection.' }, { status: 500 });
  }
}
