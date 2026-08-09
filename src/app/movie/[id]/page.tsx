import type { Metadata } from 'next';
import { Suspense } from 'react';
import { getMovieDetails, getImageUrl } from '@/services/tmdb';
import { MovieDetailClient } from '@/components/movie/MovieDetailClient';

interface PageProps {
  params: Promise<{ id: string }>;
}

function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-[#0B0B0B]">
      <div className="h-[75vh] w-full animate-pulse bg-neutral-900" />
      <div className="mx-auto max-w-7xl space-y-6 px-6 py-14 md:px-16">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-4 rounded bg-neutral-800" style={{ width: `${80 - i * 10}%` }} />
        ))}
      </div>
    </div>
  );
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  try {
    const { id } = await params;
    const movie = await getMovieDetails(id);
    const posterUrl = getImageUrl(movie.poster_path, 'w500');
    const year = movie.release_date ? ` (${movie.release_date.slice(0, 4)})` : '';

    return {
      title: `${movie.title}${year}`,
      description: movie.overview?.slice(0, 160) || `Watch ${movie.title} on Cine Tracker.`,
      openGraph: {
        title: `${movie.title}${year}`,
        description: movie.overview?.slice(0, 160),
        images: [{ url: posterUrl, width: 500, height: 750, alt: movie.title }],
        type: 'video.movie',
      },
      twitter: {
        card: 'summary_large_image',
        title: `${movie.title}${year}`,
        description: movie.overview?.slice(0, 160),
        images: [posterUrl],
      },
    };
  } catch {
    return { title: 'Movie Details' };
  }
}

export default async function MovieDetailsPage({ params }: PageProps) {
  const { id } = await params;
  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <MovieDetailClient id={id} />
    </Suspense>
  );
}
