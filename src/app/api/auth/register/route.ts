import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { generateToken, UserRole } from '@/lib/auth';

export const runtime = 'nodejs';

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

function databaseError(error: unknown) {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === 'P2002') {
      return {
        status: 409,
        code: 'EMAIL_ALREADY_EXISTS',
        error: 'An account with this email already exists.',
      };
    }
    if (error.code === 'P2021' || error.code === 'P2022') {
      return {
        status: 500,
        code: 'DATABASE_SCHEMA_MISMATCH',
        error: 'The database schema is out of sync with the application. Please deploy the latest database migration.',
      };
    }
    return {
      status: 500,
      code: `DATABASE_${error.code}`,
      error: 'The database rejected the account creation request.',
    };
  }

  if (error instanceof Prisma.PrismaClientInitializationError) {
    return {
      status: 503,
      code: 'DATABASE_CONNECTION_FAILED',
      error: 'The database connection is unavailable. Please try again shortly.',
    };
  }

  if (error instanceof Prisma.PrismaClientValidationError) {
    return {
      status: 500,
      code: 'DATABASE_REQUEST_INVALID',
      error: 'The account data could not be written because the database request is invalid.',
    };
  }

  return null;
}

export async function POST(req: NextRequest) {
  const requestId = crypto.randomUUID();

  try {
    const body = await req.json();
    const name = typeof body.name === 'string' ? body.name.trim() : '';
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
    const password = typeof body.password === 'string' ? body.password : '';

    if (!name || !email || !password) {
      return NextResponse.json({
        error: 'Name, email and password are required.',
        code: 'VALIDATION_ERROR',
      }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({
        error: 'Password must be at least 6 characters.',
        code: 'PASSWORD_TOO_SHORT',
      }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({
        error: 'An account with this email already exists.',
        code: 'EMAIL_ALREADY_EXISTS',
      }, { status: 409 });
    }

    const role = roleFromEnvironment(email);
    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword, role },
    });
    const token = generateToken(user.id, user.email, user.role);

    console.info('[register] account created', { requestId, email, role });

    return NextResponse.json({
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    }, { status: 201 });
  } catch (error) {
    const mapped = databaseError(error);

    console.error('[register] failed', {
      requestId,
      error,
      name: error instanceof Error ? error.name : typeof error,
      message: error instanceof Error ? error.message : String(error),
    });

    if (mapped) {
      return NextResponse.json({
        error: mapped.error,
        code: mapped.code,
        requestId,
      }, { status: mapped.status });
    }

    return NextResponse.json({
      error: 'Unable to create the account right now. Please try again.',
      code: 'REGISTRATION_FAILED',
      requestId,
    }, { status: 500 });
  }
}
