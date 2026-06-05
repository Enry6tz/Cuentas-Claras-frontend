'use client';

import { useQuery } from '@tanstack/react-query';
import { getDashboard } from '@/services/api/dashboard';

export function useDashboard() {
  return useQuery({
    queryKey: ['dashboard'],
    queryFn: getDashboard,
  });
}
