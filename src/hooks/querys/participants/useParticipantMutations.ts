'use client';

import { useApiMutation } from '@/hooks/querys/common/useApiMutation';
import {
  changeRole,
  removeParticipant,
  leaveTrip,
} from '@/services/api/participants';
import type { ParticipationRole } from '@/types';

export function useParticipantMutations(tripId: string) {
  const keys = [
    ['trips', tripId, 'participants'],
    ['trips', tripId],
  ];

  return {
    changeRole: useApiMutation({
      mutationFn: ({ userId, role }: { userId: string; role: ParticipationRole }) =>
        changeRole(tripId, userId, role),
      invalidateKeys: keys,
      successMessage: 'Rol actualizado',
    }),

    remove: useApiMutation({
      mutationFn: (userId: string) => removeParticipant(tripId, userId),
      invalidateKeys: keys,
      successMessage: 'Integrante quitado',
    }),

    leave: useApiMutation({
      mutationFn: () => leaveTrip(tripId),
      invalidateKeys: keys,
      successMessage: 'Saliste del viaje',
    }),
  };
}
