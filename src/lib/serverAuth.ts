import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { verifyToken, UserRole } from '@/lib/auth';

export async function getServerUser(allowedRoles?: UserRole[]) {
  const cookieStore = await cookies();
  const token = cookieStore.get('ct_session')?.value;
  if (!token) return null;

  try {
    const payload = verifyToken(token);
    const user = await prisma.user.findUnique({ where: { id: payload.userId }, select: { id: true, name: true, email: true, role: true } });
    if (!user) return null;
    if (allowedRoles && !allowedRoles.includes(user.role)) return null;
    return user;
  } catch {
    return null;
  }
}
