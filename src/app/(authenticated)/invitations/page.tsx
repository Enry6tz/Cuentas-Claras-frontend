'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Check, X, Map, Loader2, MailQuestion } from 'lucide-react';
import {
  getPendingInvitations,
  acceptInvitation,
  declineInvitation,
} from '@/lib/api/invitations';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function InvitationsPage() {
  const queryClient = useQueryClient();

  const { data: invitations = [], isLoading } = useQuery({
    queryKey: ['invitations', 'pending'],
    queryFn: getPendingInvitations,
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Invitaciones</h1>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : invitations.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="rounded-full bg-muted p-4">
              <MailQuestion className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="mt-5 text-lg font-semibold text-foreground">
              Sin invitaciones pendientes
            </h3>
            <p className="mt-2 max-w-sm text-center text-sm text-muted-foreground">
              No tenés invitaciones pendientes por el momento.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {invitations.map((invitation) => (
            <Card key={invitation.id}>
              <CardContent className="flex items-center justify-between py-4">
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                    <Map className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">{invitation.trip?.name ?? 'Viaje'}</p>
                    <p className="text-sm text-muted-foreground">
                      Te invitó {invitation.inviter?.name ?? 'alguien'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(invitation.createdAt).toLocaleDateString('es-AR', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={acceptMutation.isPending || declineMutation.isPending}
                    onClick={() => declineMutation.mutate(invitation.id)}
                  >
                    <X className="h-4 w-4" />
                    Rechazar
                  </Button>
                  <Button
                    size="sm"
                    disabled={acceptMutation.isPending || declineMutation.isPending}
                    onClick={() => acceptMutation.mutate(invitation.id)}
                  >
                    <Check className="h-4 w-4" />
                    Aceptar
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
