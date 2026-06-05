'use client';

import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { getMyExpenses } from '@/services/api/expenses';
import type { MyExpensesFilters } from '@/types';

export function useMyExpenses(filters: MyExpensesFilters) {
  return useQuery({
    queryKey: ['expenses', 'me', filters],
    queryFn: () => getMyExpenses(filters),
    placeholderData: keepPreviousData,
  });
}
