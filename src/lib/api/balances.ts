import api from '@/lib/axios';
import type { ApiResponse, BalanceEntry, SettlementSuggestion } from '@/types';

function unwrap<T>(response: { data: ApiResponse<T> }): T {
  return response.data.data;
}

export async function getBalances(
  tripId: string,
): Promise<BalanceEntry[]> {
  const res = await api.get<ApiResponse<BalanceEntry[]>>(
    `/trips/${tripId}/balances`,
  );
  return unwrap(res);
}

export async function getSettlement(
  tripId: string,
): Promise<SettlementSuggestion[]> {
  const res = await api.get<ApiResponse<SettlementSuggestion[]>>(
    `/trips/${tripId}/balances/settlement`,
  );
  return unwrap(res);
}
