'use client';

import { useEffect } from 'react';
import { ClerkProvider, useAuth } from '@clerk/nextjs';
import { QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { getQueryClient } from '@/lib/query-client';
import { setAuthToken } from '@/lib/axios';

function AuthTokenSync({ children }: { children: React.ReactNode }) {
  const { getToken } = useAuth();

  useEffect(() => {
    setAuthToken(getToken);
  }, [getToken]);

  return <>{children}</>;
}

export function Providers({ children }: { children: React.ReactNode }) {
  const queryClient = getQueryClient();

  return (
    <ClerkProvider>
      <QueryClientProvider client={queryClient}>
        <AuthTokenSync>{children}</AuthTokenSync>
        <Toaster position="top-right" richColors />
      </QueryClientProvider>
    </ClerkProvider>
  );
}
