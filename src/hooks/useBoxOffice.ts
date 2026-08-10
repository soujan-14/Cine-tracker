import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { BoxOfficeData } from '@/types/boxoffice';

function retryDelay(attemptIndex: number): number {
  return Math.min(1000 * 2 ** attemptIndex, 8000);
}

export function useBoxOffice(
  imdbId: string | null | undefined,
  revenue: number,
  budget: number
) {
  return useQuery<BoxOfficeData>({
    queryKey: ['boxoffice', imdbId ?? 'null', revenue, budget],
    queryFn: async ({ signal }) => {
      try {
        const response = await axios.get<BoxOfficeData>(
          `/api/boxoffice/${imdbId ?? 'null'}?revenue=${revenue}&budget=${budget}`,
          { signal, timeout: 15000 }
        );
        return response.data;
      } catch (error: any) {
        if (error.name === 'CanceledError' || signal?.aborted) {
          throw new DOMException('Request aborted', 'AbortError');
        }
        throw error;
      }
    },
    enabled: Boolean(imdbId || revenue > 0),
    staleTime: 1000 * 60 * 60,
    refetchOnWindowFocus: false,
    retry: 2,
    retryDelay,
  });
}
