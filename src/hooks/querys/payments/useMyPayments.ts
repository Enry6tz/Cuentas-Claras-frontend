'use client';

import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { getMyPayments } from '@/services/api/payments';
import type { MyPaymentsFilters } from '@/types';

export function useMyPayments(filters: MyPaymentsFilters) {
  return useQuery({
    queryKey: ['payments', 'me', filters],
    queryFn: () => getMyPayments(filters),
    placeholderData: keepPreviousData,
  });
}
