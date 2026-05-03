import api from '@/lib/axios';
import type { ApiResponse, Trip } from '@/types';

/**
 * Capa de "API Client": funciones que hablan con el backend.
 *
 * Por que esta capa separada en lugar de hacer `axios.get()` directamente
 * dentro de los componentes?
 *   1. Centraliza las URLs y la forma de las peticiones (si manana cambia
 *      el path o el shape, se toca un solo lugar).
 *   2. El componente queda mas limpio: usa una funcion con nombre semantico
 *      (`createTrip`) en vez de un axios call.
 *   3. Tipa fuerte la entrada y salida -> menos bugs.
 *
 * El `api` que importamos viene de `lib/axios.ts` y ya tiene el interceptor
 * que mete el JWT de Clerk en el header `Authorization` automaticamente.
 *
 * Todas las respuestas vienen envueltas en `{ data: ... }` (el
 * TransformInterceptor global del backend), por eso `unwrap` saca esa capa.
 */
function unwrap<T>(response: { data: ApiResponse<T> }): T {
  return response.data.data;
}

// Payload para crear/editar trip. Lo definimos aca para no depender del DTO
// del backend (que es server-only). Mantenemos los nombres y tipos en sync
// manualmente con el CreateTripDto.
export interface TripPayload {
  name: string;
  description?: string;
  startDate?: string; // formato YYYY-MM-DD
  endDate?: string;
  baseCurrency: string;
}

export type UpdateTripPayload = Partial<TripPayload> & {
  status?: 'ACTIVE' | 'FINALIZED';
};

export async function listTrips(): Promise<Trip[]> {
  const res = await api.get<ApiResponse<Trip[]>>('/trips');
  return unwrap(res);
}

export async function getTrip(id: string): Promise<Trip> {
  const res = await api.get<ApiResponse<Trip>>(`/trips/${id}`);
  return unwrap(res);
}

export async function createTrip(payload: TripPayload): Promise<Trip> {
  const res = await api.post<ApiResponse<Trip>>('/trips', payload);
  return unwrap(res);
}

export async function updateTrip(
  id: string,
  payload: UpdateTripPayload,
): Promise<Trip> {
  const res = await api.patch<ApiResponse<Trip>>(`/trips/${id}`, payload);
  return unwrap(res);
}

export async function deleteTrip(id: string): Promise<void> {
  // El backend devuelve 204 No Content, no necesitamos retornar nada.
  await api.delete(`/trips/${id}`);
}
