import api from '@/lib/axios';
import type { ApiResponse } from '@/types';

function unwrap<T>(response: { data: ApiResponse<T> }): T {
  return response.data.data;
}

export async function getCurrencyRate(from: string, to: string) {
  const res = await api.get<ApiResponse<{ from: string; to: string; rate: number }>>(
    '/currency/rate',
    { params: { from, to } },
  );
  return unwrap(res);
}
