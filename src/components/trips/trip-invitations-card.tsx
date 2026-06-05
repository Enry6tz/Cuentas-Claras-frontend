'use client';

import { X, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PersonAvatar, RoleBadge } from '@/components/shared/ui-bits';
import { useTripInvitations } from '@/hooks/querys/invitations/useTripInvitations';
import { useInvitationMutations } from '@/hooks/querys/invitations/useInvitationMutations';

interface TripInvitationsCardProps {
  tripId: string;
}

/** Lista de invitaciones pendientes de un viaje, con opción de cancelar.
 *  Pensada para el CREATOR (la API ya restringe el acceso). */
export function TripInvitationsCard({ tripId }: TripInvitationsCardProps) {
  const { data: invitations = [] } = useTripInvitations(tripId);

  const pending = invitations.filter((i) => i.status === 'PENDING');

  const { cancel: cancelMutation } = useInvitationMutations(tripId);

  if (pending.length === 0) return null;

  return (
    <Card>
      <CardHeader className="space-y-0.5">
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
          <Clock className="size-4 text-muted-foreground" />
          Invitaciones pendientes
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          {pending.length} {pending.length === 1 ? 'persona invitada aún sin responder' : 'personas invitadas aún sin responder'}
        </p>
      </CardHeader>
      <CardContent className="p-0">
        <ul className="divide-y">
          {pending.map((inv) => {
            const name = inv.invitee?.name ?? 'Sin nombre';
            return (
              <li key={inv.id} className="flex items-center justify-between gap-2 px-4 py-3">
                <div className="flex min-w-0 items-center gap-3">
                  <PersonAvatar name={name} seed={inv.inviteeId} />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">{name}</p>
                    <p className="truncate text-xs text-muted-foreground">{inv.invitee?.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <RoleBadge role={inv.role} />
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                    disabled={cancelMutation.isPending}
                    onClick={() => cancelMutation.mutate(inv.id)}
                  >
                    <X className="size-4" />
                    Cancelar
                  </Button>
                </div>
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
}
