import api from '@/lib/axios';
import type { BalanceEntry, SettlementSuggestion } from '@/types';

export async function getBalances(tripId: string): Promise<BalanceEntry[]> {
  const res = await api.get<BalanceEntry[]>(`/v1/trips/${tripId}/balances`);
  return res.data;
}

export async function getSettlement(
  tripId: string,
): Promise<SettlementSuggestion[]> {
  const res = await api.get<SettlementSuggestion[]>(
    `/v1/trips/${tripId}/balances/settlement`,
  );
  return res.data;
}
