import type { UserPublic } from './users';
import type { TripSummary } from './pagination';

export interface Payment {
  id: string;
  debtorId: string;
  creditorId: string;
  tripId: string;
  amount: string;
  note: string | null;
  date: string;
  createdAt: string;
  debtor?: UserPublic;
  creditor?: UserPublic;
  // Presente en la lista global (GET /me/payments).
  trip?: TripSummary;
}

export interface MyPaymentsFilters {
  page?: number;
  limit?: number;
  tripId?: string;
  role?: 'debtor' | 'creditor';
  q?: string;
  from?: string;
  to?: string;
}

export interface CreatePaymentPayload {
  debtorId: string;
  creditorId: string;
  amount: number;
  note?: string;
  date?: string;
}
