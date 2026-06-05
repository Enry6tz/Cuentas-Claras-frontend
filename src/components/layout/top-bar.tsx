'use client';

import { Menu } from 'lucide-react';
import { Search, Bell } from 'lucide-react';
import { UserButton } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { InvitationBell } from '@/components/invitations/invitation-bell';
import { SidebarTrigger } from '@/components/ui/sidebar';

export function TopBar() {
  return (
    <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center gap-2 border-b bg-card px-4">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="mx-1 h-6" />

      <div className="flex-1" />

      <div className="flex items-center gap-1">
        <InvitationBell />
        <Separator orientation="vertical" className="mx-2 h-6" />
        <Button variant="ghost" size="icon-sm" className="text-muted-foreground">
          <Search className="size-4" />
        </Button>
        <Button variant="ghost" size="icon-sm" className="text-muted-foreground">
          <Bell className="size-4" />
        </Button>
        <Separator orientation="vertical" className="mx-1 h-6" />
        <UserButton />
      </div>
    </header>
  );
}
