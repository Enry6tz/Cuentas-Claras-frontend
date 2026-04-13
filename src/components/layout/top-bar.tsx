'use client';

import { Menu, Search, Bell } from 'lucide-react';
import { UserButton } from '@clerk/nextjs';
import { useUIStore } from '@/stores/ui-store';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

export function TopBar() {
  const { setMobileSidebarOpen } = useUIStore();

  return (
    <header className="flex items-center justify-between border-b bg-card px-6 py-3">
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden"
        onClick={() => setMobileSidebarOpen(true)}
      >
        <Menu className="h-5 w-5" />
      </Button>

      <div className="flex-1" />

      <div className="flex items-center gap-1">
        <Button variant="ghost" size="icon" className="text-muted-foreground">
          <Search className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" className="text-muted-foreground">
          <Bell className="h-4 w-4" />
        </Button>
        <Separator orientation="vertical" className="mx-2 h-6" />
        <UserButton />
      </div>
    </header>
  );
}
