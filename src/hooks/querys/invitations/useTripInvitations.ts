'use client';

import { useQuery } from '@tanstack/react-query';
import { getTripInvitations } from '@/services/api/invitations';

export function useTripInvitations(
  tripId: string,
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: ['trips', tripId, 'invitations'],
    queryFn: () => getTripInvitations(tripId),
    enabled: options?.enabled ?? true,
  });
}
