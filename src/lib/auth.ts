import jwt from 'jsonwebtoken';
import { getAuthSecret } from '@/lib/env';

const JWT_SECRET = getAuthSecret();
const EXPIRES_IN = '7d';

export interface JwtPayload {
  userId: string;
  email: string;
}

export function generateToken(userId: string, email: string): string {
  return jwt.sign({ userId, email }, JWT_SECRET, { expiresIn: EXPIRES_IN });
}

export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, JWT_SECRET) as JwtPayload;
}
