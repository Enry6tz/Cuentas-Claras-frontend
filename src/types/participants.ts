import type { UserPublic } from './users';

export type ParticipationRole = 'CREATOR' | 'SUPERVISOR' | 'MEMBER';

export interface Participation {
  id: string;
  userId: string;
  tripId: string;
  role: ParticipationRole;
  currentBalance: string;
  joinedAt: string;
  user?: UserPublic;
}
