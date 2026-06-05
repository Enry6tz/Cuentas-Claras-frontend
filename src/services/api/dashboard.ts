import api from '@/lib/axios';
import type { DashboardData } from '@/types';

export async function getDashboard(): Promise<DashboardData> {
  const res = await api.get<DashboardData>('/v1/dashboard');
  return res.data;
}
