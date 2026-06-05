'use client';

import { useApiMutation } from '@/hooks/querys/common/useApiMutation';
import {
  sendInvitation,
  cancelInvitation,
  acceptInvitation,
  rejectInvitation,
} from '@/services/api/invitations';
import type { ParticipationRole } from '@/types';

/**
 * Mutations de invitaciones. Las de envío/cancelación necesitan `tripId`
 * (lado del CREATOR); aceptar/rechazar son del receptor y no lo requieren.
 */
export function useInvitationMutations(tripId?: string) {
  const myKey = ['invitations', 'me'];
  const tripKey = tripId ? ['trips', tripId, 'invitations'] : ['trips'];

  return {
    send: useApiMutation({
      mutationFn: ({ userId, role }: { userId: string; role: ParticipationRole }) =>
        sendInvitation(tripId!, userId, role),
      invalidateKeys: [tripKey],
      successMessage: 'Invitación enviada',
    }),

    cancel: useApiMutation({
      mutationFn: (invitationId: string) => cancelInvitation(tripId!, invitationId),
      invalidateKeys: [tripKey],
      successMessage: 'Invitación cancelada',
    }),

    accept: useApiMutation({
      mutationFn: (invitationId: string) => acceptInvitation(invitationId),
      invalidateKeys: [myKey, ['trips']],
      successMessage: 'Te uniste al viaje',
    }),

    reject: useApiMutation({
      mutationFn: (invitationId: string) => rejectInvitation(invitationId),
      invalidateKeys: [myKey],
      successMessage: 'Invitación rechazada',
    }),
  };
}
