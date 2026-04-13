'use client';

import { Menu } from 'lucide-react';
import { UserButton } from '@clerk/nextjs';
import { useUIStore } from '@/stores/ui-store';

export function TopBar() {
  const { toggleSidebar } = useUIStore();

  return (
    <header className="flex items-center justify-between border-b bg-white px-6 py-3">
      <button
        onClick={toggleSidebar}
        className="rounded-lg p-2 hover:bg-gray-100 lg:hidden"
      >
        <Menu className="h-5 w-5" />
      </button>
      <div className="flex-1" />
      <UserButton />
    </header>
  );
}
