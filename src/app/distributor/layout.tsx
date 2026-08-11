import { ReactNode } from 'react';
import { redirect } from 'next/navigation';
import { getServerUser } from '@/lib/serverAuth';

export default async function DistributorLayout({ children }: { children: ReactNode }) {
  const user = await getServerUser(['DISTRIBUTOR']);
  if (!user) redirect('/');
  return children;
}
