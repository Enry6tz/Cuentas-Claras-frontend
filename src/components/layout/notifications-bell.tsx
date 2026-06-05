'use client';

import Link from 'next/link';
import { Bell, Check, X, Plane } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { PersonAvatar, RoleBadge } from '@/components/shared/ui-bits';
import { useMyInvitations } from '@/hooks/querys/invitations/useMyInvitations';
import { useInvitationMutations } from '@/hooks/querys/invitations/useInvitationMutations';

export function NotificationsBell() {
  const { data: invitations = [] } = useMyInvitations();
  const count = invitations.length;

  const { accept, reject } = useInvitationMutations();
  const busy = accept.isPending || reject.isPending;

  return (
    <Popover>
      <PopoverTrigger
        render={
          <Button
            variant="ghost"
            size="icon-sm"
            className="relative text-muted-foreground"
          >
            <Bell className="size-4" />
            {count > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex size-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-semibold leading-none text-white">
                {count > 9 ? '9+' : count}
              </span>
            )}
            <span className="sr-only">Invitaciones</span>
          </Button>
        }
      />
      <PopoverContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between border-b px-3 py-2.5">
          <p className="text-sm font-semibold text-foreground">Invitaciones</p>
          {count > 0 && (
            <span className="text-xs text-muted-foreground">{count} pendiente{count === 1 ? '' : 's'}</span>
          )}
        </div>

        {count === 0 ? (
          <div className="px-3 py-8 text-center text-sm text-muted-foreground">
            No tenés invitaciones pendientes.
          </div>
        ) : (
          <ul className="max-h-80 divide-y overflow-y-auto">
            {invitations.map((inv) => {
              const inviterName = inv.inviter?.name ?? 'Alguien';
              const tripName = inv.trip?.name ?? 'un viaje';
              return (
                <li key={inv.id} className="space-y-2 px-3 py-3">
                  <div className="flex items-start gap-2.5">
                    <PersonAvatar name={inviterName} seed={inv.inviterId} className="size-8" />
                    <div className="min-w-0 space-y-1">
                      <p className="text-sm text-foreground">
                        <span className="font-semibold">{inviterName}</span> te invitó a{' '}
                        <span className="inline-flex items-center gap-1 font-semibold">
                          <Plane className="size-3 text-muted-foreground" />
                          {tripName}
                        </span>
                      </p>
                      <RoleBadge role={inv.role} className="text-[10px]" />
                    </div>
                  </div>
                  <div className="flex gap-2 pl-[42px]">
                    <Button
                      size="xs"
                      disabled={busy}
                      onClick={() => accept.mutate(inv.id)}
                    >
                      <Check className="size-3.5" />
                      Aceptar
                    </Button>
                    <Button
                      size="xs"
                      variant="outline"
                      disabled={busy}
                      onClick={() => reject.mutate(inv.id)}
                      className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                    >
                      <X className="size-3.5" />
                      Rechazar
                    </Button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}

        <div className="border-t px-3 py-2">
          <Link
            href="/invitations"
            className="block text-center text-xs font-medium text-primary hover:underline"
          >
            Ver todas
          </Link>
        </div>
      </PopoverContent>
    </Popover>
  );
}
