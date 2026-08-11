import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, JwtPayload } from '@/lib/auth';

export function requireAuth(req: NextRequest): JwtPayload | NextResponse {
  const header = req.headers.get('authorization') ?? '';
  const bearerToken = header.startsWith('Bearer ') ? header.slice(7) : null;
  const token = bearerToken || req.cookies.get('ct_session')?.value || null;

  if (!token) return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });

  try {
    return verifyToken(token);
  } catch {
    return NextResponse.json({ error: 'Invalid or expired token.' }, { status: 401 });
  }
}

export function isNextResponse(v: unknown): v is NextResponse {
  return v instanceof NextResponse;
}
