'use client';

import { useQuery } from '@tanstack/react-query';
import { getSettlement } from '@/services/api/balances';

export function useSettlement(tripId: string) {
  return useQuery({
    queryKey: ['settlement', tripId],
    queryFn: () => getSettlement(tripId),
  });
}
