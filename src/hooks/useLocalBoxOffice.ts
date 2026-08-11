import { useQuery } from '@tanstack/react-query';

export interface LocalBoxOfficeRanking {
  movie: { id: number; title: string; poster_path: string | null; backdrop_path: string | null; release_date: string };
  collection: number;
  dailyTotal: number;
  weekend: number | null;
  verified: boolean;
  latestDate: string;
}

export function useLocalBoxOffice(year?: number, limit = 12) {
  return useQuery<{ results: LocalBoxOfficeRanking[]; source: 'local' }>({
    queryKey: ['box-office', 'local', year ?? 'all', limit],
    queryFn: async () => {
      const params = new URLSearchParams({ limit: String(limit) });
      if (year) params.set('year', String(year));
      const response = await fetch(`/api/box-office/rankings?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to load box office rankings.');
      return response.json();
    },
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });
}
