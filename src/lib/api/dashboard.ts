import api from '@/lib/axios';
import type { ActivityItem, ApiResponse } from '@/types';

function unwrap<T>(response: { data: ApiResponse<T> }): T {
  return response.data.data;
}

export interface DashboardData {
  activeTrips: number;
  totalTrips: number;
  balanceTotal: string;
  recentActivity: ActivityItem[];
}

export async function getDashboard(): Promise<DashboardData> {
  const res = await api.get<ApiResponse<DashboardData>>('/dashboard');
  return unwrap(res);
}

