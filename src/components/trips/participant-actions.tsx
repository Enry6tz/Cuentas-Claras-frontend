'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { MoreHorizontal, Shield, User as UserIcon, Trash2, LogOut } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { changeRole, removeParticipant, leaveTrip } from '@/lib/api/participants';
import type { Participation, ParticipationRole } from '@/types';

interface ParticipantActionsProps {
  tripId: string;
  participation: Participation;
  currentUserRole: ParticipationRole;
  isCurrentUser: boolean;
}

function extractErrorMessage(err: unknown, fallback: string): string {
  const status = (err as { response?: { status?: number } })?.response?.status;
  if (status === 409) return 'El usuario tiene saldo pendiente. Saldá las deudas primero.';
  if (status === 400) return 'El viaje está finalizado.';
  if (status === 403) return 'No tenés permiso para realizar esta acción.';
  return fallback;
}

export function ParticipantActions({
  tripId,
  participation,
  currentUserRole,
  isCurrentUser,
}: ParticipantActionsProps) {
  const queryClient = useQueryClient();

  function invalidate() {
    queryClient.invalidateQueries({ queryKey: ['trips', tripId, 'participants'] });
    queryClient.invalidateQueries({ queryKey: ['trips', tripId] });
  }

  const roleMutation = useMutation({
    mutationFn: (role: ParticipationRole) => changeRole(tripId, participation.userId, role),
    onSuccess: () => {
      toast.success('Rol actualizado');
      invalidate();
    },
    onError: (err) => toast.error(extractErrorMessage(err, 'No se pudo cambiar el rol')),
  });

  const removeMutation = useMutation({
    mutationFn: () => removeParticipant(tripId, participation.userId),
    onSuccess: () => {
      toast.success('Participante eliminado');
      invalidate();
    },
    onError: (err) => toast.error(extractErrorMessage(err, 'No se pudo eliminar el participante')),
  });

  const leaveMutation = useMutation({
    mutationFn: () => leaveTrip(tripId),
    onSuccess: () => {
      toast.success('Saliste del viaje');
      invalidate();
    },
    onError: (err) => toast.error(extractErrorMessage(err, 'No se pudo salir del viaje')),
  });

  const isPending = roleMutation.isPending || removeMutation.isPending || leaveMutation.isPending;

  // Si el usuario actual es MEMBER viendo su propia fila → solo puede salir
  if (isCurrentUser && currentUserRole !== 'CREATOR') {
    return (
      <Button
        variant="ghost"
        size="sm"
        className="text-destructive hover:bg-destructive/10 hover:text-destructive"
        disabled={isPending}
        onClick={() => leaveMutation.mutate()}
      >
        <LogOut className="h-4 w-4" />
        Salir
      </Button>
    );
  }

  // Solo el CREATOR puede gestionar a los demás
  if (currentUserRole !== 'CREATOR') return null;
  // El CREATOR no puede gestionar su propia fila desde acá
  if (isCurrentUser) return null;

  const nextRole: ParticipationRole =
    participation.role === 'SUPERVISOR' ? 'MEMBER' : 'SUPERVISOR';
  const nextRoleLabel = nextRole === 'SUPERVISOR' ? 'Hacer Supervisor' : 'Hacer Miembro';
  const NextRoleIcon = nextRole === 'SUPERVISOR' ? Shield : UserIcon;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        disabled={isPending}
        className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-50"
      >
        <MoreHorizontal className="h-4 w-4" />
        <span className="sr-only">Acciones</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Acciones</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => roleMutation.mutate(nextRole)}>
          <NextRoleIcon className="mr-2 h-4 w-4" />
          {nextRoleLabel}
        </DropdownMenuItem>
        <DropdownMenuItem
          className="text-destructive focus:text-destructive"
          onClick={() => removeMutation.mutate()}
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Eliminar del viaje
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
