'use client';

import { useQuery } from '@tanstack/react-query';
import { getParticipants } from '@/services/api/participants';

export function useParticipants(tripId: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ['trips', tripId, 'participants'],
    queryFn: () => getParticipants(tripId),
    enabled: options?.enabled ?? true,
  });
}
