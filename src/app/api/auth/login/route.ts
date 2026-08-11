export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { generateToken } from '@/lib/auth';

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

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
    const password = typeof body.password === 'string' ? body.password : '';

    if (!email || !password) return NextResponse.json({ error: 'Email and password are required.' }, { status: 400 });

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.password || !(await bcrypt.compare(password, user.password))) {
      return NextResponse.json({ error: 'Invalid email or password.' }, { status: 401 });
    }

    const token = generateToken(user.id, user.email, user.role);
    return withSessionCookie(NextResponse.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } }), token);
  } catch (error) {
    console.error('[login]', error);
    return NextResponse.json({ error: 'Unable to sign in right now. Please try again.' }, { status: 500 });
  }
}
