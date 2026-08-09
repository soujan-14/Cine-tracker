import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

interface ListItem {
  id: string;
  userId: string;
  movieId: number;
  createdAt: string;
}

function authHeaders(token: string) {
  return { Authorization: `Bearer ${token}` };
}

/* ── Favorites ── */

export function useFavorites(token: string | null) {
  return useQuery<ListItem[]>({
    queryKey: ['favorites'],
    queryFn: () =>
      axios.get('/api/favorites', { headers: authHeaders(token!) }).then((r) => r.data),
    enabled: Boolean(token),
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });
}

export function useToggleFavorite(token: string | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ movieId, isFav }: { movieId: number; isFav: boolean }) =>
      isFav
        ? axios.delete('/api/favorites', {
            headers: authHeaders(token!),
            data: { movieId },
          })
        : axios.post('/api/favorites', { movieId }, { headers: authHeaders(token!) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['favorites'] }),
  });
}

/* ── Watchlist ── */

export function useWatchlist(token: string | null) {
  return useQuery<ListItem[]>({
    queryKey: ['watchlist'],
    queryFn: () =>
      axios.get('/api/watchlist', { headers: authHeaders(token!) }).then((r) => r.data),
    enabled: Boolean(token),
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });
}

export function useToggleWatchlist(token: string | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ movieId, isInList }: { movieId: number; isInList: boolean }) =>
      isInList
        ? axios.delete('/api/watchlist', {
            headers: authHeaders(token!),
            data: { movieId },
          })
        : axios.post('/api/watchlist', { movieId }, { headers: authHeaders(token!) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['watchlist'] }),
  });
}
