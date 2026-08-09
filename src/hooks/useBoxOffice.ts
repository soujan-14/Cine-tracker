import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { BoxOfficeData } from '@/types/boxoffice';

export function useBoxOffice(
  imdbId: string | null | undefined,
  revenue: number,
  budget: number
) {
  return useQuery<BoxOfficeData>({
    queryKey: ['boxoffice', imdbId ?? 'null', revenue, budget],
    queryFn: () =>
      axios
        .get<BoxOfficeData>(
          `/api/boxoffice/${imdbId ?? 'null'}?revenue=${revenue}&budget=${budget}`
        )
        .then((r) => r.data),
    // Only fetch when we have at least an imdbId or TMDB revenue
    enabled: Boolean(imdbId || revenue > 0),
    staleTime: 1000 * 60 * 60, // 1 hour — box office data doesn't change often
    refetchOnWindowFocus: false,
  });
}
