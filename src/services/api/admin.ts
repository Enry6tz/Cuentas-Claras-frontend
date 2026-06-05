import api from '@/lib/axios';
import type { Trip, UpdateTripPayload } from '@/types';

export async function getAdminTrips(): Promise<Trip[]> {
  const res = await api.get<Trip[]>('/v1/admin/trips');
  return res.data;
}

export async function getAdminTrip(id: string): Promise<Trip> {
  const res = await api.get<Trip>(`/v1/admin/trips/${id}`);
  return res.data;
}

export async function updateAdminTrip(
  id: string,
  payload: UpdateTripPayload,
): Promise<Trip> {
  const res = await api.patch<Trip>(`/v1/admin/trips/${id}`, payload);
  return res.data;
}

export async function deleteAdminTrip(id: string): Promise<void> {
  await api.delete(`/v1/admin/trips/${id}`);
}
