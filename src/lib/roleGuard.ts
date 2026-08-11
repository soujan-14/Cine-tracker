import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken, UserRole } from '@/lib/auth';

export async function requireRole(
  request: NextRequest,
  roles: UserRole[],
): Promise<{ userId: string; role: UserRole } | NextResponse> {
  const header = request.headers.get('authorization');
  const bearerToken = header?.startsWith('Bearer ') ? header.slice(7) : null;
  const token = bearerToken || request.cookies.get('ct_session')?.value || null;

  if (!token) return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });

  try {
    const payload = verifyToken(token);
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, role: true },
    });

    // Authorization is always decided from the current database role, not
    // from client storage or a potentially stale JWT role claim.
    if (!user) return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
    if (!roles.includes(user.role)) return NextResponse.json({ error: 'Forbidden.' }, { status: 403 });

    return { userId: user.id, role: user.role };
  } catch {
    return NextResponse.json({ error: 'Invalid or expired token.' }, { status: 401 });
  }
}
