'use client';

import { useQuery } from '@tanstack/react-query';
import { getExpenses } from '@/services/api/expenses';

export function useExpenses(tripId: string) {
  return useQuery({
    queryKey: ['expenses', tripId],
    queryFn: () => getExpenses(tripId),
  });
}
