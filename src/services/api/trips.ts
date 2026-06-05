import api from '@/lib/axios';
import type { Trip, TripPayload, UpdateTripPayload } from '@/types';

/**
 * Capa de service: habla con el BFF de Next (`/api/v1/...`), nunca con el
 * backend NestJS directo. El BFF ya desenvuelve el `{ data }`, así que acá
 * devolvemos `response.data` (el DTO crudo). Sin try/catch: el error propaga
 * al hook y React Query / useApiMutation lo exponen.
 */

export async function getTrips(): Promise<Trip[]> {
  const res = await api.get<Trip[]>('/v1/trips');
  return res.data;
}

export async function getTrip(id: string): Promise<Trip> {
  const res = await api.get<Trip>(`/v1/trips/${id}`);
  return res.data;
}

export async function createTrip(payload: TripPayload): Promise<Trip> {
  const res = await api.post<Trip>('/v1/trips', payload);
  return res.data;
}

export async function updateTrip(
  id: string,
  payload: UpdateTripPayload,
): Promise<Trip> {
  const res = await api.patch<Trip>(`/v1/trips/${id}`, payload);
  return res.data;
}

export async function deleteTrip(id: string): Promise<void> {
  await api.delete(`/v1/trips/${id}`);
}
