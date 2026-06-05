'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { InvitationList } from './invitation-list';
import { getPendingInvitations } from '@/lib/api/invitations';
import { cn } from '@/lib/utils';

export function InvitationBell() {
  const [open, setOpen] = useState(false);

  const { data: invitations = [] } = useQuery({
    queryKey: ['invitations', 'pending'],
    queryFn: getPendingInvitations,
    refetchInterval: 30_000,
  });

  const count = invitations.length;

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="relative text-muted-foreground"
        onClick={() => setOpen(true)}
      >
        <Bell className="h-4 w-4" />
        {count > 0 && (
          <span className={cn(
            'absolute -right-0.5 -top-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-destructive-foreground',
          )}>
            {count > 99 ? '99+' : count}
          </span>
        )}
      </Button>
      <InvitationList open={open} onOpenChange={setOpen} />
    </>
  );
}
