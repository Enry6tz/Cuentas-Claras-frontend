import api from '@/lib/axios';
import type { ApiResponse, Invitation } from '@/types';

function unwrap<T>(response: { data: ApiResponse<T> }): T {
  return response.data.data;
}

export async function sendInvitation(tripId: string, userId: string): Promise<Invitation> {
  const res = await api.post<ApiResponse<Invitation>>(`/trips/${tripId}/invitations`, { userId });
  return unwrap(res);
}

export async function getPendingInvitations(): Promise<Invitation[]> {
  const res = await api.get<ApiResponse<Invitation[]>>('/invitations/pending');
  return unwrap(res);
}

export async function acceptInvitation(invitationId: string): Promise<Invitation> {
  const res = await api.patch<ApiResponse<Invitation>>(`/invitations/${invitationId}/accept`);
  return unwrap(res);
}

export async function declineInvitation(invitationId: string): Promise<Invitation> {
  const res = await api.patch<ApiResponse<Invitation>>(`/invitations/${invitationId}/decline`);
  return unwrap(res);
}

export async function getTripInvitations(tripId: string): Promise<Invitation[]> {
  const res = await api.get<ApiResponse<Invitation[]>>(`/trips/${tripId}/invitations`);
  return unwrap(res);
}

export async function cancelInvitation(tripId: string, invitationId: string): Promise<void> {
  await api.delete(`/trips/${tripId}/invitations/${invitationId}`);
}
