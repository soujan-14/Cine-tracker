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
    const name = typeof body.name === 'string' ? body.name.trim() : '';
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
    const password = typeof body.password === 'string' ? body.password : '';

    if (!name || !email || !password) return NextResponse.json({ error: 'Name, email and password are required.' }, { status: 400 });
    if (password.length < 6) return NextResponse.json({ error: 'Password must be at least 6 characters.' }, { status: 400 });

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return NextResponse.json({ error: 'An account with this email already exists.' }, { status: 409 });

    // Every self-service signup starts as USER. Elevated roles are provisioned
    // in the database by an administrator/migration, never from an email address
    // supplied by the browser or an environment-variable allowlist.
    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({ data: { name, email, password: hashedPassword, role: 'USER' } });
    const token = generateToken(user.id, user.email, user.role);
    return withSessionCookie(NextResponse.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } }, { status: 201 }), token);
  } catch (error) {
    console.error('[register]', error);
    return NextResponse.json({ error: 'Unable to create the account right now. Please try again.' }, { status: 500 });
  }
}
