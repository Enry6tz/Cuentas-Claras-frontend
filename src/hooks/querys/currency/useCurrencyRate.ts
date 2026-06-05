'use client';

import { useQuery } from '@tanstack/react-query';
import { getCurrencyRate } from '@/services/api/currency';

export function useCurrencyRate(from: string, to: string) {
  return useQuery({
    queryKey: ['currency-rate', from, to],
    queryFn: () => getCurrencyRate(from, to),
    enabled: from !== to,
    staleTime: 60 * 60 * 1000, // la cotización cambia poco
    retry: 1,
  });
}
