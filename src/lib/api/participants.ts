import api from '@/lib/axios';
import type { ApiResponse, Participation, ParticipationRole } from '@/types';

function unwrap<T>(response: { data: ApiResponse<T> }): T {
  return response.data.data;
}

export async function listParticipants(tripId: string): Promise<Participation[]> {
  const res = await api.get<ApiResponse<Participation[]>>(`/trips/${tripId}/participants`);
  return unwrap(res);
}

export async function addParticipant(tripId: string, userId: string): Promise<Participation> {
  const res = await api.post<ApiResponse<Participation>>(`/trips/${tripId}/participants`, { userId });
  return unwrap(res);
}

export async function changeRole(
  tripId: string,
  userId: string,
  role: ParticipationRole,
): Promise<Participation> {
  const res = await api.patch<ApiResponse<Participation>>(
    `/trips/${tripId}/participants/${userId}`,
    { role },
  );
  return unwrap(res);
}

export async function removeParticipant(tripId: string, userId: string): Promise<void> {
  await api.delete(`/trips/${tripId}/participants/${userId}`);
}

export async function leaveTrip(tripId: string): Promise<void> {
  await api.delete(`/trips/${tripId}/participants/me`);
}
