'use client';

import { useApiMutation } from '@/hooks/querys/common/useApiMutation';
import { createTrip, updateTrip, deleteTrip, finalizeTrip } from '@/services/api/trips';
import type { TripPayload, UpdateTripPayload } from '@/types';

export function useTripMutations() {
  return {
    create: useApiMutation({
      mutationFn: (payload: TripPayload) => createTrip(payload),
      invalidateKeys: [['trips']],
      successMessage: 'Viaje creado',
    }),

    update: useApiMutation({
      mutationFn: ({ id, payload }: { id: string; payload: UpdateTripPayload }) =>
        updateTrip(id, payload),
      invalidateKeys: [['trips']],
      successMessage: 'Viaje actualizado',
    }),

    remove: useApiMutation({
      mutationFn: (id: string) => deleteTrip(id),
      invalidateKeys: [['trips']],
      successMessage: 'Viaje eliminado',
    }),

    finalize: useApiMutation({
      mutationFn: (id: string) => finalizeTrip(id),
      invalidateKeys: [['trips']],
      successMessage: 'Viaje finalizado',
    }),
  };
}
