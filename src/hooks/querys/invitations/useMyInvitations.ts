'use client';

import { useQuery } from '@tanstack/react-query';
import { getMyInvitations } from '@/services/api/invitations';

export function useMyInvitations() {
  return useQuery({
    queryKey: ['invitations', 'me'],
    queryFn: getMyInvitations,
  });
}
