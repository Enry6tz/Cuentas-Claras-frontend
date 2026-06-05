'use client';

import { useState, useEffect } from 'react';
import { Send, Search, Loader2, Check, Clock, User as UserIcon } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { PersonAvatar } from '@/components/shared/ui-bits';
import { useUserSearch } from '@/hooks/querys/users/useUserSearch';
import { useParticipants } from '@/hooks/querys/participants/useParticipants';
import { useTripInvitations } from '@/hooks/querys/invitations/useTripInvitations';
import { useInvitationMutations } from '@/hooks/querys/invitations/useInvitationMutations';
import type { ParticipationRole } from '@/types';

interface InviteParticipantDialogProps {
  tripId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Sólo se puede invitar como MEMBER o SUPERVISOR (nunca CREATOR).
const ROLE_LABELS: Record<'MEMBER' | 'SUPERVISOR', string> = {
  MEMBER: 'Miembro',
  SUPERVISOR: 'Supervisor',
};

export function InviteParticipantDialog({
  tripId,
  open,
  onOpenChange,
}: InviteParticipantDialogProps) {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [role, setRole] = useState<ParticipationRole>('MEMBER');

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 300);
    return () => clearTimeout(timer);
  }, [query]);

  const { data: results = [], isFetching } = useUserSearch(debouncedQuery);

  // Reusa el cache de participantes para marcar quién ya está en el viaje.
  const { data: participants = [] } = useParticipants(tripId, { enabled: open });
  const memberIds = new Set(participants.map((p) => p.userId));

  // Invitaciones del viaje para marcar a quién ya se le envió una pendiente.
  const { data: invitations = [] } = useTripInvitations(tripId, { enabled: open });
  const pendingInviteeIds = new Set(
    invitations.filter((i) => i.status === 'PENDING').map((i) => i.inviteeId),
  );

  const { send } = useInvitationMutations(tripId);

  function handleClose(open: boolean) {
    if (!open) {
      setQuery('');
      setRole('MEMBER');
    }
    onOpenChange(open);
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Invitar integrante</DialogTitle>
          <DialogDescription>
            Buscá un usuario registrado, elegí su rol y enviale una invitación. Se unirá al
            viaje cuando la acepte.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid gap-2">
            <Label>Rol en el viaje</Label>
            <Select
              value={role}
              onValueChange={(v) => v && setRole(v as ParticipationRole)}
            >
              <SelectTrigger className="w-full">
                <span className="flex items-center gap-2">
                  <UserIcon className="size-4 text-muted-foreground" />
                  {ROLE_LABELS[role as 'MEMBER' | 'SUPERVISOR']}
                </span>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="MEMBER">Miembro</SelectItem>
                <SelectItem value="SUPERVISOR">Supervisor</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar por nombre o email…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-9"
              autoFocus
            />
            {isFetching && (
              <Loader2 className="absolute right-3 top-1/2 size-4 -translate-y-1/2 animate-spin text-muted-foreground" />
            )}
          </div>

          {debouncedQuery.length >= 3 && !isFetching && results.length === 0 && (
            <p className="py-4 text-center text-sm text-muted-foreground">
              No se encontraron usuarios.
            </p>
          )}

          {results.length > 0 && (
            <ul className="divide-y rounded-lg border">
              {results.map((user) => {
                const already = memberIds.has(user.id);
                const invited = pendingInviteeIds.has(user.id);
                return (
                  <li key={user.id} className="flex items-center justify-between gap-2 px-4 py-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <PersonAvatar name={user.name} seed={user.id} />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-foreground">{user.name}</p>
                        <p className="truncate text-xs text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                    {already ? (
                      <Badge variant="secondary" className="gap-1 text-muted-foreground">
                        <Check className="size-3.5" />
                        Ya en el viaje
                      </Badge>
                    ) : invited ? (
                      <Badge variant="secondary" className="gap-1 text-muted-foreground">
                        <Clock className="size-3.5" />
                        Invitación enviada
                      </Badge>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={send.isPending}
                        onClick={() => send.mutate({ userId: user.id, role })}
                      >
                        <Send className="size-4" />
                        Invitar
                      </Button>
                    )}
                  </li>
                );
              })}
            </ul>
          )}

          {debouncedQuery.length < 3 && (
            <p className="py-2 text-center text-xs text-muted-foreground">
              Escribí al menos 3 caracteres para buscar.
            </p>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => handleClose(false)}>
            Cerrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
