'use client';

import { useQuery } from '@tanstack/react-query';
import { getPayments } from '@/services/api/payments';

export function usePayments(tripId: string) {
  return useQuery({
    queryKey: ['payments', tripId],
    queryFn: () => getPayments(tripId),
  });
}
