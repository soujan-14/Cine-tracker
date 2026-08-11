import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { UserRole, verifyToken } from '@/lib/auth';

export async function requireRole(req: NextRequest, roles: UserRole[]) {
  const header = req.headers.get('authorization');
  const bearerToken = header?.startsWith('Bearer ') ? header.slice(7) : null;
  const token = bearerToken || req.cookies.get('ct_session')?.value || null;
  if (!token) return { error: NextResponse.json({ error: 'Authentication required.' }, { status: 401 }) };

  try {
    const payload = verifyToken(token);
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, email: true, role: true },
    });

    if (!user) return { error: NextResponse.json({ error: 'Authentication required.' }, { status: 401 }) };
    if (!roles.includes(user.role)) return { error: NextResponse.json({ error: 'Forbidden.' }, { status: 403 }) };

    return { user: { userId: user.id, email: user.email, role: user.role } };
  } catch {
    return { error: NextResponse.json({ error: 'Invalid or expired token.' }, { status: 401 }) };
  }
}
