export interface ActivityItem {
  type: 'expense' | 'payment' | 'trip';
  description: string | null;
  amount: string;
  tripName: string;
  tripId: string;
  date: string;
}

export interface DashboardData {
  activeTrips: number;
  totalTrips: number;
  balanceTotal: string;
  totalGastado: string;
  totalEnPagos: string;
  recentActivity: ActivityItem[];
}
