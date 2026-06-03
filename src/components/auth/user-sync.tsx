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
 * un GET /users/me una vez para forzar ese guardado.
 *
 * Adjuntamos el token explícitamente (en vez de depender del interceptor de
 * axios) para evitar una carrera de orden de montaje con AuthTokenSync.
 */
export function UserSync() {
  const { isSignedIn, getToken } = useAuth();
  const synced = useRef(false);

  useEffect(() => {
    if (!isSignedIn || synced.current) return;

    void (async () => {
      const token = await getToken();
      if (!token) return;
      try {
        await api.get('/users/me', {
          headers: { Authorization: `Bearer ${token}` },
        });
        synced.current = true;
      } catch {
        // Reintentará en el próximo render si falló (ej. backend caído).
      }
    })();
  }, [isSignedIn, getToken]);

  return null;
}