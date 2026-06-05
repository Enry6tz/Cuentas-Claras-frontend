'use client';

import { useQuery } from '@tanstack/react-query';
import { getTrips } from '@/services/api/trips';

export function useTrips() {
  return useQuery({
    queryKey: ['trips'],
    queryFn: getTrips,
  });
}
