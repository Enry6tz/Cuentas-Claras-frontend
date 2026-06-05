'use client';

import { useApiMutation } from '@/hooks/querys/common/useApiMutation';
import { createPayment, deletePayment } from '@/services/api/payments';
import type { CreatePaymentPayload } from '@/types';

export function usePaymentMutations(tripId: string) {
  // Prefijos amplios: refrescan tanto la lista del viaje (['payments', tripId])
  // como la global (['payments', 'me']) y los balances.
  const keys = [['payments'], ['balances']];

  return {
    create: useApiMutation({
      mutationFn: (payload: CreatePaymentPayload) => createPayment(tripId, payload),
      invalidateKeys: keys,
      successMessage: 'Pago registrado',
    }),

    remove: useApiMutation({
      mutationFn: (id: string) => deletePayment(tripId, id),
      invalidateKeys: keys,
      successMessage: 'Pago eliminado',
    }),
  };
}
