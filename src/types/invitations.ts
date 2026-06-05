import type { ParticipationRole } from './participants';
import type { Trip } from './trips';
import type { UserPublic } from './users';

export type InvitationStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'CANCELLED';

export interface Invitation {
  id: string;
  tripId: string;
  inviterId: string;
  inviteeId: string;
  role: ParticipationRole;
  status: InvitationStatus;
  createdAt: string;
  respondedAt: string | null;
  // Presentes según el endpoint (include de relaciones en el backend).
  inviter?: UserPublic;
  invitee?: UserPublic;
  trip?: Pick<Trip, 'id' | 'name' | 'description' | 'baseCurrency' | 'status'>;
}

export interface CreateInvitationBody {
  userId: string;
  role: ParticipationRole;
}
