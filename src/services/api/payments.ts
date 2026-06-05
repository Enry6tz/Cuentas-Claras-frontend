import api from '@/lib/axios';
import type {
  Payment,
  CreatePaymentPayload,
  MyPaymentsFilters,
  Paginated,
} from '@/types';

export async function getPayments(tripId: string): Promise<Payment[]> {
  const res = await api.get<Payment[]>(`/v1/trips/${tripId}/payments`);
  return res.data;
}

/** Pagos del usuario en todos sus viajes, paginados y filtrados. */
export async function getMyPayments(
  filters: MyPaymentsFilters = {},
): Promise<Paginated<Payment>> {
  const res = await api.get<Paginated<Payment>>('/v1/me/payments', {
    params: filters,
  });
  return res.data;
}

export async function createPayment(
  tripId: string,
  payload: CreatePaymentPayload,
): Promise<Payment> {
  const res = await api.post<Payment>(`/v1/trips/${tripId}/payments`, payload);
  return res.data;
}

export async function deletePayment(tripId: string, id: string): Promise<void> {
  await api.delete(`/v1/trips/${tripId}/payments/${id}`);
}
