'use client';

import { useQuery } from '@tanstack/react-query';
import { getTrip } from '@/services/api/trips';

export function useTrip(id?: string) {
  return useQuery({
    queryKey: ['trips', id],
    queryFn: () => getTrip(id!),
    enabled: !!id,
  });
}
