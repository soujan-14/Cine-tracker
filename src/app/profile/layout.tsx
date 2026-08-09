import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'My Profile',
  description: 'View your saved favorites and watchlist on Cine Tracker.',
  robots: { index: false, follow: false },
};

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
