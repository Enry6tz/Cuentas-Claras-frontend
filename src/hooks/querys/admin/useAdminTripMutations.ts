'use client';

import { useApiMutation } from '@/hooks/querys/common/useApiMutation';
import { updateAdminTrip, deleteAdminTrip } from '@/services/api/admin';
import type { UpdateTripPayload } from '@/types';

export function useAdminTripMutations() {
  return {
    update: useApiMutation({
      mutationFn: ({ id, payload }: { id: string; payload: UpdateTripPayload }) =>
        updateAdminTrip(id, payload),
      invalidateKeys: [['admin', 'trips']],
      successMessage: 'Viaje actualizado',
    }),

    remove: useApiMutation({
      mutationFn: (id: string) => deleteAdminTrip(id),
      invalidateKeys: [['admin', 'trips']],
      successMessage: 'Viaje eliminado',
    }),
  };
}
