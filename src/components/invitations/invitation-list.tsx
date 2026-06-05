'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Check, X, Loader2, Map } from 'lucide-react';
import Link from 'next/link';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { getPendingInvitations, acceptInvitation, declineInvitation } from '@/lib/api/invitations';

interface InvitationListProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function InvitationList({ open, onOpenChange }: InvitationListProps) {
  const queryClient = useQueryClient();

  const { data: invitations = [], isLoading } = useQuery({
    queryKey: ['invitations', 'pending'],
    queryFn: getPendingInvitations,
    enabled: open,
  });

  const acceptMutation = useMutation({
    mutationFn: acceptInvitation,
    onSuccess: () => {
      toast.success('Invitación aceptada');
      queryClient.invalidateQueries({ queryKey: ['invitations', 'pending'] });
      queryClient.invalidateQueries({ queryKey: ['trips'] });
    },
    onError: () => toast.error('No se pudo aceptar la invitación'),
  });

  const declineMutation = useMutation({
    mutationFn: declineInvitation,
    onSuccess: () => {
      toast.success('Invitación rechazada');
      queryClient.invalidateQueries({ queryKey: ['invitations', 'pending'] });
    },
    onError: () => toast.error('No se pudo rechazar la invitación'),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Invitaciones pendientes</DialogTitle>
          <DialogDescription>
            {invitations.length > 0
              ? 'Tenés invitaciones para unirte a estos viajes.'
              : 'No tenés invitaciones pendientes.'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          {isLoading && (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          )}

          {!isLoading && invitations.length === 0 && (
            <p className="py-6 text-center text-sm text-muted-foreground">
              No hay invitaciones pendientes.
            </p>
          )}

          {invitations.map((invitation) => (
            <div
              key={invitation.id}
              className="flex items-center justify-between rounded-lg border px-4 py-3"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10">
                  <Map className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium">{invitation.trip?.name ?? 'Viaje'}</p>
                  <p className="text-xs text-muted-foreground">
                    Te invitó {invitation.inviter?.name ?? 'alguien'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  size="sm"
                  variant="ghost"
                  disabled={acceptMutation.isPending || declineMutation.isPending}
                  onClick={() => declineMutation.mutate(invitation.id)}
                >
                  <X className="h-4 w-4 text-destructive" />
                </Button>
                <Button
                  size="sm"
                  variant="default"
                  disabled={acceptMutation.isPending || declineMutation.isPending}
                  onClick={() => acceptMutation.mutate(invitation.id)}
                >
                  <Check className="h-4 w-4" />
                  Aceptar
                </Button>
              </div>
            </div>
          ))}

          {invitations.length > 0 && (
            <div className="flex justify-center">
              <Link href="/invitations" className="text-sm text-primary underline-offset-4 hover:underline">
                Ver todas las invitaciones
              </Link>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
