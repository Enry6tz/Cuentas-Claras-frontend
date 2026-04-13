'use client';

import { useUser } from '@clerk/nextjs';

export default function DashboardPage() {
  const { user } = useUser();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          Welcome back, {user?.firstName ?? 'traveler'}!
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <h3 className="text-sm font-medium text-gray-500">Active Trips</h3>
          <p className="mt-2 text-3xl font-bold text-gray-900">—</p>
          <p className="mt-1 text-xs text-gray-400">Not implemented yet</p>
        </div>
        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <h3 className="text-sm font-medium text-gray-500">Total Expenses</h3>
          <p className="mt-2 text-3xl font-bold text-gray-900">—</p>
          <p className="mt-1 text-xs text-gray-400">Not implemented yet</p>
        </div>
        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <h3 className="text-sm font-medium text-gray-500">Your Balance</h3>
          <p className="mt-2 text-3xl font-bold text-gray-900">—</p>
          <p className="mt-1 text-xs text-gray-400">Not implemented yet</p>
        </div>
      </div>

      <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-12 text-center">
        <p className="text-gray-500">
          Features coming soon: create trips, add expenses, split costs, and settle debts.
        </p>
      </div>
    </div>
  );
}
