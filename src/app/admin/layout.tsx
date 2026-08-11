import { ReactNode } from 'react';
import { redirect } from 'next/navigation';
import { getServerUser } from '@/lib/serverAuth';

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const user = await getServerUser(['ADMIN']);
  if (!user) redirect('/');
  return children;
}
