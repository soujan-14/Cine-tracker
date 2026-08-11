import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken, UserRole } from '@/lib/auth';

export async function requireRole(
  request: NextRequest,
  roles: UserRole[],
): Promise<{ userId: string; role: UserRole } | NextResponse> {
  const header = request.headers.get('authorization');
  const token = header?.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });

  try {
    const payload = verifyToken(token);
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, role: true },
    });

    if (!user || !roles.includes(user.role)) {
      return NextResponse.json({ error: 'Forbidden.' }, { status: 403 });
    }

    return { userId: user.id, role: user.role };
  } catch {
    return NextResponse.json({ error: 'Invalid or expired token.' }, { status: 401 });
  }
}
