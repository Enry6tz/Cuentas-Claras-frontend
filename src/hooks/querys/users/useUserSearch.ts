'use client';

import { useQuery } from '@tanstack/react-query';
import { searchUsers } from '@/services/api/users';

export function useUserSearch(query: string) {
  return useQuery({
    queryKey: ['users', 'search', query],
    queryFn: () => searchUsers(query),
    enabled: query.length >= 3,
    staleTime: 30_000,
  });
}
