import api from '@/lib/axios';
import type { CurrencyRate } from '@/types';

export async function getCurrencyRate(
  from: string,
  to: string,
): Promise<CurrencyRate> {
  const res = await api.get<CurrencyRate>('/v1/currency/rate', {
    params: { from, to },
  });
  return res.data;
}
