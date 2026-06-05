'use client';

import { useState } from 'react';
import {
  MoreVertical,
  ArrowLeftRight,
  Trash2,
  LogOut,
  Lock,
  AlertTriangle,
  User as UserIcon,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { PersonAvatar } from '@/components/shared/ui-bits';
import { useParticipantMutations } from '@/hooks/querys/participants/useParticipantMutations';
import type { Participation, ParticipationRole } from '@/types';

interface ParticipantActionsProps {
  tripId: string;
  participation: Participation;
  currentUserRole: ParticipationRole;
  isCurrentUser: boolean;
}

const ROLE_LABELS: Record<ParticipationRole, string> = {
  CREATOR: 'Creador',
  SUPERVISOR: 'Supervisor',
  MEMBER: 'Miembro',
};

export function ParticipantActions({
  tripId,
  participation,
  currentUserRole,
  isCurrentUser,
}: ParticipantActionsProps) {
  const [roleOpen, setRoleOpen] = useState(false);
  const [removeOpen, setRemoveOpen] = useState(false);
  const [leaveOpen, setLeaveOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<ParticipationRole>(participation.role);

  const name = participation.user?.name ?? 'Sin nombre';
  const email = participation.user?.email ?? '';
  const isBlocked = parseFloat(participation.currentBalance ?? '0') !== 0;

  const {
    changeRole: roleMutation,
    remove: removeMutation,
    leave: leaveMutation,
  } = useParticipantMutations(tripId);

  const personBlock = (
    <div className="flex items-center gap-3">
      <PersonAvatar name={name} seed={participation.userId} className="size-12" />
      <div className="min-w-0">
        <p className="font-semibold text-foreground">{name}</p>
        {email && <p className="truncate text-sm text-muted-foreground">{email}</p>}
      </div>
    </div>
  );

  // Vista de Miembro/Supervisor sobre su propia fila → sólo puede abandonar.
  if (isCurrentUser && currentUserRole !== 'CREATOR') {
    return (
      <>
        <Button
          variant="ghost"
          size="sm"
          className="text-destructive hover:bg-destructive/10 hover:text-destructive"
          onClick={() => setLeaveOpen(true)}
        >
          <LogOut className="size-4" />
          Salir
        </Button>

        <Dialog open={leaveOpen} onOpenChange={setLeaveOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Abandonar viaje</DialogTitle>
              <DialogDescription>Vas a salir de este viaje.</DialogDescription>
            </DialogHeader>
            <div className="rounded-lg border border-warning/20 bg-warning/10 p-4 text-sm">
              <div className="flex gap-2">
                <AlertTriangle className="mt-0.5 size-4 shrink-0 text-warning" />
                <p>
                  Sólo podés salir si tu saldo está en cero. Esta acción no se puede deshacer.
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setLeaveOpen(false)} disabled={leaveMutation.isPending}>
                Cancelar
              </Button>
              <Button
                variant="destructive"
                onClick={() =>
                  leaveMutation.mutate(undefined, {
                    onSuccess: () => setLeaveOpen(false),
                  })
                }
                disabled={leaveMutation.isPending || isBlocked}
              >
                <LogOut className="size-4" />
                {leaveMutation.isPending ? 'Saliendo...' : 'Salir'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </>
    );
  }

  // Sólo el CREATOR gestiona a los demás; no a su propia fila.
  if (currentUserRole !== 'CREATOR' || isCurrentUser) return null;

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button variant="ghost" size="icon-sm" className="text-muted-foreground">
              <MoreVertical className="size-4" />
              <span className="sr-only">Acciones</span>
            </Button>
          }
        />
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            onClick={() => {
              setSelectedRole(participation.role);
              setRoleOpen(true);
            }}
          >
            <ArrowLeftRight className="size-4" />
            Cambiar rol
          </DropdownMenuItem>
          <DropdownMenuItem
            variant="destructive"
            disabled={isBlocked}
            onClick={() => setRemoveOpen(true)}
          >
            {isBlocked ? <Lock className="size-4" /> : <Trash2 className="size-4" />}
            Quitar
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Cambiar rol */}
      <Dialog open={roleOpen} onOpenChange={setRoleOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Cambiar rol</DialogTitle>
            <DialogDescription>Definí los permisos de {name} en este viaje.</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {personBlock}

            <div className="grid gap-2">
              <Label>Rol</Label>
              <Select
                value={selectedRole}
                onValueChange={(v) => v && setSelectedRole(v as ParticipationRole)}
              >
                <SelectTrigger className="w-full">
                  <span className="flex items-center gap-2">
                    <UserIcon className="size-4 text-muted-foreground" />
                    {ROLE_LABELS[selectedRole]}
                  </span>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MEMBER">Miembro</SelectItem>
                  <SelectItem value="SUPERVISOR">Supervisor</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="rounded-lg bg-muted p-4 text-sm text-muted-foreground">
              El <strong className="text-foreground">Creador</strong> no puede cambiar su propio rol.
              El Supervisor puede ver todo el viaje; el Miembro sólo participa de gastos y pagos.
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setRoleOpen(false)} disabled={roleMutation.isPending}>
              Cancelar
            </Button>
            <Button
              onClick={() =>
                roleMutation.mutate(
                  { userId: participation.userId, role: selectedRole },
                  { onSuccess: () => setRoleOpen(false) },
                )
              }
              disabled={roleMutation.isPending || selectedRole === participation.role}
            >
              {roleMutation.isPending ? 'Guardando...' : 'Guardar cambios'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmar quitar */}
      <Dialog open={removeOpen} onOpenChange={setRemoveOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Quitar integrante</DialogTitle>
            <DialogDescription>Vas a quitar a {name} del viaje.</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {personBlock}
            <div className="rounded-lg border border-warning/20 bg-warning/10 p-4 text-sm">
              <div className="flex gap-2">
                <AlertTriangle className="mt-0.5 size-4 shrink-0 text-warning" />
                <p>
                  El integrante sólo puede quitarse si su saldo está en cero. Esta acción no se
                  puede deshacer.
                </p>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setRemoveOpen(false)} disabled={removeMutation.isPending}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={() =>
                removeMutation.mutate(participation.userId, {
                  onSuccess: () => setRemoveOpen(false),
                })
              }
              disabled={removeMutation.isPending}
            >
              <Trash2 className="size-4" />
              {removeMutation.isPending ? 'Quitando...' : 'Quitar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
