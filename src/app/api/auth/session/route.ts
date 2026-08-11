export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateToken, verifyToken } from '@/lib/auth';

function withSessionCookie(response: NextResponse, token: string) {
  response.cookies.set('ct_session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  });
  return response;
}

export async function GET(request: NextRequest) {
  const token = request.cookies.get('ct_session')?.value;
  if (!token) return NextResponse.json({ error: 'No active session.' }, { status: 401 });

  try {
    const payload = verifyToken(token);
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, name: true, email: true, role: true },
    });

    if (!user) return NextResponse.json({ error: 'Session user no longer exists.' }, { status: 401 });

    // Re-issue the signed token with the database role so a role change is
    // reflected immediately instead of trusting a stale JWT role claim.
    const refreshedToken = generateToken(user.id, user.email, user.role);
    return withSessionCookie(NextResponse.json({ token: refreshedToken, user }), refreshedToken);
  } catch {
    const response = NextResponse.json({ error: 'Invalid or expired session.' }, { status: 401 });
    response.cookies.set('ct_session', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 0,
    });
    return response;
  }
}
