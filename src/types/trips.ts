import type { Participation } from './participants';

export type TripStatus = 'ACTIVE' | 'FINALIZED';

export interface Trip {
  id: string;
  name: string;
  description: string | null;
  startDate: string | null;
  endDate: string | null;
  baseCurrency: string;
  status: TripStatus;
  iconId: number | null;
  colorId: number | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  participations?: Participation[];
  _count?: {
    participations: number;
    expenses: number;
  };
}

// Body para crear/editar un trip. Lo mantenemos en sync manual con el
// CreateTripDto del backend (server-only).
export interface TripPayload {
  name: string;
  description?: string;
  startDate?: string; // YYYY-MM-DD
  endDate?: string;
  baseCurrency: string;
  iconId?: number;
  colorId?: number;
}

export type UpdateTripPayload = Partial<TripPayload> & {
  status?: TripStatus;
};
