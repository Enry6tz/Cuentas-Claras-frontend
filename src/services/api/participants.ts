import api from '@/lib/axios';
import type { Participation, ParticipationRole } from '@/types';

export async function getParticipants(tripId: string): Promise<Participation[]> {
  const res = await api.get<Participation[]>(`/v1/trips/${tripId}/participants`);
  return res.data;
}

export async function changeRole(
  tripId: string,
  userId: string,
  role: ParticipationRole,
): Promise<Participation> {
  const res = await api.patch<Participation>(
    `/v1/trips/${tripId}/participants/${userId}`,
    { role },
  );
  return res.data;
}

export async function removeParticipant(
  tripId: string,
  userId: string,
): Promise<void> {
  await api.delete(`/v1/trips/${tripId}/participants/${userId}`);
}

export async function leaveTrip(tripId: string): Promise<void> {
  await api.delete(`/v1/trips/${tripId}/participants/me`);
}
