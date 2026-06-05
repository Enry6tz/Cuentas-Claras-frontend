'use client';

import { QueryClient } from '@tanstack/react-query';

let queryClient: QueryClient | null = null;

export function getQueryClient() {
  if (!queryClient) {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          staleTime: 20 * 1000,
          retry: 1,
          // Sensación "real-time": todos los GET se refrescan cada 20s
          // (se pausa solo cuando la pestaña está en segundo plano) y al
          // volver el foco a la ventana.
          refetchInterval: 20 * 1000,
          refetchOnWindowFocus: true,
        },
      },
    });
  }
  return queryClient;
}
