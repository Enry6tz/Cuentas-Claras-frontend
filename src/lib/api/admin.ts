import api from '@/lib/axios';
import type { ApiResponse, Trip } from '@/types';
import type { UpdateTripPayload } from './trips';

function unwrap<T>(response: { data: ApiResponse<T> }): T {
  return response.data.data;
}

export async function listAdminTrips(): Promise<Trip[]> {
  const res = await api.get<ApiResponse<Trip[]>>('/admin/trips');
  return unwrap(res);
}

export async function getAdminTrip(id: string): Promise<Trip> {
  const res = await api.get<ApiResponse<Trip>>(`/admin/trips/${id}`);
  return unwrap(res);
}

export async function updateAdminTrip(
  id: string,
  payload: UpdateTripPayload,
): Promise<Trip> {
  const res = await api.patch<ApiResponse<Trip>>(`/admin/trips/${id}`, payload);
  return unwrap(res);
}

export async function deleteAdminTrip(id: string): Promise<void> {
  await api.delete(`/admin/trips/${id}`);
}
