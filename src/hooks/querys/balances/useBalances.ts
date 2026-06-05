'use client';

import { useQuery } from '@tanstack/react-query';
import { getBalances } from '@/services/api/balances';

export function useBalances(tripId: string) {
  return useQuery({
    queryKey: ['balances', tripId],
    queryFn: () => getBalances(tripId),
  });
}
