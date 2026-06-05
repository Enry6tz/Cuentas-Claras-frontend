'use client';

import { useApiMutation } from '@/hooks/querys/common/useApiMutation';
import { createExpense, deleteExpense } from '@/services/api/expenses';
import type { CreateExpensePayload } from '@/types';

export function useExpenseMutations(tripId: string) {
  // Prefijos amplios: refrescan tanto la lista del viaje (['expenses', tripId])
  // como la global (['expenses', 'me']) y los balances.
  const keys = [['expenses'], ['balances']];

  return {
    create: useApiMutation({
      mutationFn: (payload: CreateExpensePayload) => createExpense(tripId, payload),
      invalidateKeys: keys,
      successMessage: 'Gasto creado',
    }),

    remove: useApiMutation({
      mutationFn: (id: string) => deleteExpense(tripId, id),
      invalidateKeys: keys,
      successMessage: 'Gasto eliminado',
    }),
  };
}
