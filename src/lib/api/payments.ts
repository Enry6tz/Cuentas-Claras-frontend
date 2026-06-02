import api from '@/lib/axios';
import type { ApiResponse, Payment } from '@/types';

function unwrap<T>(response: { data: ApiResponse<T> }): T {
  return response.data.data;
}

export interface CreatePaymentPayload {
  debtorId: string;
  creditorId: string;
  amount: number;
  note?: string;
  date?: string;
}

export async function listPayments(tripId: string): Promise<Payment[]> {
  const res = await api.get<ApiResponse<Payment[]>>(`/trips/${tripId}/payments`);
  return unwrap(res);
}

export async function createPayment(
  tripId: string,
  payload: CreatePaymentPayload,
): Promise<Payment> {
  const res = await api.post<ApiResponse<Payment>>(`/trips/${tripId}/payments`, payload);
  return unwrap(res);
}

export async function deletePayment(
  tripId: string,
  id: string,
): Promise<void> {
  await api.delete(`/trips/${tripId}/payments/${id}`);
}
