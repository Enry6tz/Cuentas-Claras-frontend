'use client';

import { Map } from 'lucide-react';

export default function TripsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Trips</h1>
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 bg-gray-50 py-16">
        <Map className="h-12 w-12 text-gray-300" />
        <h3 className="mt-4 text-lg font-medium text-gray-900">Not implemented yet</h3>
        <p className="mt-2 max-w-sm text-center text-sm text-gray-500">
          Here you will be able to create trips, invite participants, and manage shared travel expenses.
        </p>
      </div>
    </div>
  );
}
