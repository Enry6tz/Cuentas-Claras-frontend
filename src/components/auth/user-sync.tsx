'use client';

import { useEffect, useRef } from 'react';
import { useAuth } from '@clerk/nextjs';
import api from '@/lib/axios';

/**
 * Provisiona al usuario en el backend apenas hay sesión.
 *
 * El backend guarda/actualiza al usuario en su base de datos cuando recibe
 * una petición autenticada (la ClerkJwtStrategy hace el upsert). Iniciar
 * sesión en Clerk NO toca el backend por sí solo, así que aquí disparamos
 * un GET /v1/users/me una vez para forzar ese guardado.
 *
 * La auth la resuelve el route handler del BFF server-side (cookie de Clerk),
 * por eso ya no adjuntamos el token manualmente.
 */
export function UserSync() {
  const { isSignedIn } = useAuth();
  const synced = useRef(false);

  useEffect(() => {
    if (!isSignedIn || synced.current) return;

    void (async () => {
      try {
        await api.get('/v1/users/me');
        synced.current = true;
      } catch {
        // Reintentará en el próximo render si falló (ej. backend caído).
      }
    })();
  }, [isSignedIn]);

  return null;
}
