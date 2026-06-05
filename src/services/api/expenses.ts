import api from '@/lib/axios';
import type {
  Expense,
  CreateExpensePayload,
  MyExpensesFilters,
  Paginated,
} from '@/types';

export async function getExpenses(tripId: string): Promise<Expense[]> {
  const res = await api.get<Expense[]>(`/v1/trips/${tripId}/expenses`);
  return res.data;
}

/** Gastos del usuario en todos sus viajes, paginados y filtrados. */
export async function getMyExpenses(
  filters: MyExpensesFilters = {},
): Promise<Paginated<Expense>> {
  const res = await api.get<Paginated<Expense>>('/v1/me/expenses', {
    params: filters,
  });
  return res.data;
}

export async function getExpense(tripId: string, id: string): Promise<Expense> {
  const res = await api.get<Expense>(`/v1/trips/${tripId}/expenses/${id}`);
  return res.data;
}

export async function createExpense(
  tripId: string,
  payload: CreateExpensePayload,
): Promise<Expense> {
  const res = await api.post<Expense>(`/v1/trips/${tripId}/expenses`, payload);
  return res.data;
}

export async function deleteExpense(tripId: string, id: string): Promise<void> {
  await api.delete(`/v1/trips/${tripId}/expenses/${id}`);
}
