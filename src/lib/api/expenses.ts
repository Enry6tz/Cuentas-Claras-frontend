import api from '@/lib/axios';
import type { ApiResponse, Expense } from '@/types';

function unwrap<T>(response: { data: ApiResponse<T> }): T {
  return response.data.data;
}

export interface CreateExpensePayload {
  description?: string;
  originalAmount: number;
  originalCurrency: string;
  date?: string;
  category?: string;
  splitType: 'EQUAL' | 'EXACT' | 'PERCENT';
  payers: Array<{ userId: string; amountPaid: number }>;
  participantIds?: string[];
  exactShares?: Array<{ userId: string; amountOwed: number }>;
  percentShares?: Array<{ userId: string; percent: number }>;
  manualExchangeRate?: number;
}

export async function listExpenses(tripId: string): Promise<Expense[]> {
  const res = await api.get<ApiResponse<Expense[]>>(`/trips/${tripId}/expenses`);
  return unwrap(res);
}

export async function getExpense(tripId: string, id: string): Promise<Expense> {
  const res = await api.get<ApiResponse<Expense>>(`/trips/${tripId}/expenses/${id}`);
  return unwrap(res);
}

export async function createExpense(
  tripId: string,
  payload: CreateExpensePayload,
): Promise<Expense> {
  const res = await api.post<ApiResponse<Expense>>(`/trips/${tripId}/expenses`, payload);
  return unwrap(res);
}

export async function deleteExpense(tripId: string, id: string): Promise<void> {
  await api.delete(`/trips/${tripId}/expenses/${id}`);
}
