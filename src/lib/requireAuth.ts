import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';

export interface AuthContext {
  userId: string;
  email: string;
}

function bearerToken(req: NextRequest): string | null {
  const header = req.headers.get('authorization') ?? '';
  return header.startsWith('Bearer ') ? header.slice(7).trim() || null : null;
}

/**
 * Validates the Supabase access token on the request and mirrors the
 * authenticated account into the local `User` table so favorites and
 * watchlist rows keep a valid foreign key.
 */
export async function requireAuth(req: NextRequest): Promise<AuthContext | NextResponse> {
  const token = bearerToken(req);
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  const { data, error } = await getSupabaseServerClient().auth.getUser(token);
  if (error || !data.user?.email) {
    return NextResponse.json({ error: 'Invalid or expired token.' }, { status: 401 });
  }

  const { id, email, user_metadata: metadata } = data.user;
  const name = (metadata?.name as string | undefined)?.trim() || email.split('@')[0];

  await prisma.user.upsert({
    where: { id },
    update: { email, name },
    create: { id, email, name },
  });

  return { userId: id, email };
}

export function isNextResponse(v: unknown): v is NextResponse {
  return v instanceof NextResponse;
}
