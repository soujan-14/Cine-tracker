import { NextRequest, NextResponse } from 'next/server';
import { UserRole, verifyToken } from '@/lib/auth';

export function requireRole(req: NextRequest, roles: UserRole[]) {
  const header = req.headers.get('authorization');
  const token = header?.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return { error: NextResponse.json({ error: 'Authentication required.' }, { status: 401 }) };

  try {
    const payload = verifyToken(token);
    if (!roles.includes(payload.role)) return { error: NextResponse.json({ error: 'Forbidden.' }, { status: 403 }) };
    return { user: payload };
  } catch {
    return { error: NextResponse.json({ error: 'Invalid or expired token.' }, { status: 401 }) };
  }
}
