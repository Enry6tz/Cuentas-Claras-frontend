'use client';

import { useQuery } from '@tanstack/react-query';
import { getAdminTrips } from '@/services/api/admin';

export function useAdminTrips(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ['admin', 'trips'],
    queryFn: getAdminTrips,
    enabled: options?.enabled ?? true,
  });
}
