import api from '@/lib/axios';
import type { Invitation, Participation, ParticipationRole } from '@/types';

// --- Lado de quien invita (CREATOR del viaje) ---

export async function sendInvitation(
  tripId: string,
  userId: string,
  role: ParticipationRole,
): Promise<Invitation> {
  const res = await api.post<Invitation>(`/v1/trips/${tripId}/invitations`, {
    userId,
    role,
  });
  return res.data;
}

export async function getTripInvitations(
  tripId: string,
): Promise<Invitation[]> {
  const res = await api.get<Invitation[]>(`/v1/trips/${tripId}/invitations`);
  return res.data;
}

export async function cancelInvitation(
  tripId: string,
  invitationId: string,
): Promise<void> {
  await api.delete(`/v1/trips/${tripId}/invitations/${invitationId}`);
}

// --- Lado del receptor ---

export async function getMyInvitations(): Promise<Invitation[]> {
  const res = await api.get<Invitation[]>('/v1/invitations');
  return res.data;
}

export async function acceptInvitation(
  invitationId: string,
): Promise<Participation> {
  const res = await api.post<Participation>(
    `/v1/invitations/${invitationId}/accept`,
  );
  return res.data;
}

export async function rejectInvitation(
  invitationId: string,
): Promise<Invitation> {
  const res = await api.post<Invitation>(
    `/v1/invitations/${invitationId}/reject`,
  );
  return res.data;
}
