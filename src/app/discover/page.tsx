import type { Metadata } from 'next';
import { Suspense } from 'react';
import DiscoverPage from './DiscoverPage';

export const metadata: Metadata = {
  title: 'Discover Movies',
  description: 'Browse and filter thousands of movies by genre, year, rating, and more.',
};

function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-[#0B0B0B]">
      <div className="mx-auto max-w-7xl px-6 py-28 lg:px-12">
        <div className="mb-8 h-8 w-48 animate-pulse rounded bg-neutral-800" />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5">
          {Array.from({ length: 20 }).map((_, i) => (
            <div key={i} className="overflow-hidden rounded-md bg-neutral-900">
              <div className="aspect-[2/3] w-full animate-pulse bg-neutral-800" />
              <div className="mt-2 h-3 w-3/4 animate-pulse rounded bg-neutral-800 mx-3 mb-3" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <DiscoverPage />
    </Suspense>
  );
}
