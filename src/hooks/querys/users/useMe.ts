'use client';

import { useQuery } from '@tanstack/react-query';
import { getMe } from '@/services/api/users';

export function useMe() {
  return useQuery({
    queryKey: ['users', 'me'],
    queryFn: getMe,
    staleTime: 5 * 60_000,
  });
}
