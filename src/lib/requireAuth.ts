import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken, JwtPayload } from '@/lib/auth';

export async function requireAuth(req: NextRequest): Promise<JwtPayload | NextResponse> {
  const header = req.headers.get('authorization') ?? '';
  const bearerToken = header.startsWith('Bearer ') ? header.slice(7) : null;
  const token = bearerToken || req.cookies.get('ct_session')?.value || null;

  if (!token) return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });

  try {
    const payload = verifyToken(token);
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, email: true, role: true },
    });

    if (!user) return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });

    return { userId: user.id, email: user.email, role: user.role };
  } catch {
    return NextResponse.json({ error: 'Invalid or expired token.' }, { status: 401 });
  }
}

export function isNextResponse(v: unknown): v is NextResponse {
  return v instanceof NextResponse;
}
