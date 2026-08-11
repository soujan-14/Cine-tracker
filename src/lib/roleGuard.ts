import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, UserRole } from '@/lib/auth';

export function requireRole(request: NextRequest, roles: UserRole[]): { userId: string; role: UserRole } | NextResponse {
  const header = request.headers.get('authorization');
  const token = header?.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });

  try {
    const payload = verifyToken(token);
    if (!roles.includes(payload.role)) return NextResponse.json({ error: 'Forbidden.' }, { status: 403 });
    return { userId: payload.userId, role: payload.role };
  } catch {
    return NextResponse.json({ error: 'Invalid or expired token.' }, { status: 401 });
  }
}
