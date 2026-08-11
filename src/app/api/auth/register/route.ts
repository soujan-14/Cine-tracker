import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { generateToken, UserRole } from '@/lib/auth';

function roleFromEnvironment(email: string): UserRole {
  const normalized = email.trim().toLowerCase();
  const admins = (process.env.ADMIN_EMAILS ?? 'soujan1407@gmail.com')
    .split(',').map((value) => value.trim().toLowerCase()).filter(Boolean);
  const distributors = (process.env.DISTRIBUTOR_EMAILS ?? 'om123@gmail.com')
    .split(',').map((value) => value.trim().toLowerCase()).filter(Boolean);
  if (admins.includes(normalized)) return 'ADMIN';
  if (distributors.includes(normalized)) return 'DISTRIBUTOR';
  return 'USER';
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const name = typeof body.name === 'string' ? body.name.trim() : '';
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
    const password = typeof body.password === 'string' ? body.password : '';

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Name, email and password are required.' }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters.' }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: 'An account with this email already exists.' }, { status: 409 });
    }

    const role = roleFromEnvironment(email);
    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword, role },
    });
    const token = generateToken(user.id, user.email, user.role);

    return NextResponse.json({
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    }, { status: 201 });
  } catch (error) {
    console.error('[register]', error);
    return NextResponse.json({ error: 'Unable to create the account right now. Please try again.' }, { status: 500 });
  }
}
