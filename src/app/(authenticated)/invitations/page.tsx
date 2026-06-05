'use client';

import { Mail, Check, X, Plane, Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PersonAvatar, RoleBadge } from '@/components/shared/ui-bits';
import { StaggerList, StaggerItem } from '@/components/motion/stagger';
import { useMyInvitations } from '@/hooks/querys/invitations/useMyInvitations';
import { useInvitationMutations } from '@/hooks/querys/invitations/useInvitationMutations';
import type { Invitation } from '@/types';

export default function InvitationsPage() {
  const { data: invitations = [], isLoading, isError } = useMyInvitations();
  const { accept, reject } = useInvitationMutations();

  const pending = accept.isPending || reject.isPending;

  return (
    <div className="space-y-6">
      {isLoading && (
        <Card>
          <CardContent className="flex items-center justify-center gap-2 py-16 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" />
            Cargando invitaciones…
          </CardContent>
        </Card>
      )}

      {isError && (
        <Card>
          <CardContent className="py-16 text-center text-sm text-destructive">
            No se pudieron cargar las invitaciones.
          </CardContent>
        </Card>
      )}

      {!isLoading && !isError && invitations.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center gap-2 py-16 text-center">
            <Mail className="size-8 text-muted-foreground" />
            <p className="text-sm font-medium text-foreground">No tenés invitaciones pendientes</p>
            <p className="text-sm text-muted-foreground">
              Cuando alguien te invite a un viaje, va a aparecer acá.
            </p>
          </CardContent>
        </Card>
      )}

      {invitations.length > 0 && (
        <StaggerList className="space-y-6">
          {invitations.map((inv) => (
            <StaggerItem key={inv.id}>
              <InvitationCard
                invitation={inv}
                disabled={pending}
                onAccept={() => accept.mutate(inv.id)}
                onReject={() => reject.mutate(inv.id)}
              />
            </StaggerItem>
          ))}
        </StaggerList>
      )}
    </div>
  );
}

function InvitationCard({
  invitation,
  disabled,
  onAccept,
  onReject,
}: {
  invitation: Invitation;
  disabled: boolean;
  onAccept: () => void;
  onReject: () => void;
}) {
  const inviterName = invitation.inviter?.name ?? 'Alguien';
  const tripName = invitation.trip?.name ?? 'un viaje';

  return (
    <Card>
      <CardContent className="flex flex-col gap-4 py-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <PersonAvatar
            name={inviterName}
            seed={invitation.inviterId}
            className="size-11"
          />
          <div className="min-w-0 space-y-1">
            <p className="text-sm text-foreground">
              <span className="font-semibold">{inviterName}</span> te invitó a{' '}
              <span className="inline-flex items-center gap-1 font-semibold">
                <Plane className="size-3.5 text-muted-foreground" />
                {tripName}
              </span>
            </p>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>Rol propuesto:</span>
              <RoleBadge role={invitation.role} />
            </div>
          </div>
        </div>

        <div className="flex shrink-0 gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={disabled}
            onClick={onReject}
            className="text-destructive hover:bg-destructive/10 hover:text-destructive"
          >
            <X className="size-4" />
            Rechazar
          </Button>
          <Button size="sm" disabled={disabled} onClick={onAccept}>
            <Check className="size-4" />
            Aceptar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
