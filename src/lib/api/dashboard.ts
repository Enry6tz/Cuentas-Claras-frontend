import api from '@/lib/axios';
import type { ActivityItem, ApiResponse, Trip } from '@/types';

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

export async function getAdminTrips(): Promise<Trip[]> {
  const res = await api.get<ApiResponse<Trip[]>>('/admin/trips');
  return unwrap(res);
}
