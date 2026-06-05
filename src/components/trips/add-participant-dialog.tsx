'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { UserPlus, Search, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { searchUsers } from '@/lib/api/users';
import { sendInvitation } from '@/lib/api/invitations';
import type { UserPublic } from '@/types';

interface AddParticipantDialogProps {
  tripId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddParticipantDialog({ tripId, open, onOpenChange }: AddParticipantDialogProps) {
  const queryClient = useQueryClient();
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 300);
    return () => clearTimeout(timer);
  }, [query]);

  const { data: results = [], isFetching } = useQuery({
    queryKey: ['users', 'search', debouncedQuery],
    queryFn: () => searchUsers(debouncedQuery),
    enabled: debouncedQuery.length >= 3,
    staleTime: 30_000,
  });

  const addMutation = useMutation({
    mutationFn: (user: UserPublic) => sendInvitation(tripId, user.id),
    onSuccess: () => {
      toast.success('Invitación enviada');
      queryClient.invalidateQueries({ queryKey: ['trips', tripId, 'invitations'] });
      queryClient.invalidateQueries({ queryKey: ['trips', tripId] });
      onOpenChange(false);
      setQuery('');
    },
    onError: (err: unknown) => {
      const status = (err as { response?: { status?: number } })?.response?.status;
      if (status === 409) {
        toast.error('El usuario ya es participante o ya fue invitado');
      } else if (status === 404) {
        toast.error('No se encontró ningún usuario con ese email');
      } else if (status === 400) {
        toast.error('El viaje está finalizado');
      } else {
        toast.error('No se pudo enviar la invitación');
      }
    },
  });

  function handleClose(open: boolean) {
    if (!open) setQuery('');
    onOpenChange(open);
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Agregar participante</DialogTitle>
          <DialogDescription>
            Buscá por nombre o email para invitar a alguien al viaje.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Nombre o email..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-9"
              autoFocus
            />
            {isFetching && (
              <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
            )}
          </div>

          {debouncedQuery.length >= 3 && !isFetching && results.length === 0 && (
            <p className="py-4 text-center text-sm text-muted-foreground">
              No se encontraron usuarios.
            </p>
          )}

          {results.length > 0 && (
            <ul className="divide-y rounded-lg border">
              {results.map((user) => (
                <li key={user.id} className="flex items-center justify-between px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-sm font-medium text-primary">
                      {user.name?.charAt(0).toUpperCase() ?? '?'}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{user.name}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={addMutation.isPending}
                    onClick={() => addMutation.mutate(user)}
                  >
                    <UserPlus className="h-4 w-4" />
                    Invitar
                  </Button>
                </li>
              ))}
            </ul>
          )}

          {debouncedQuery.length < 3 && (
            <p className="py-2 text-center text-xs text-muted-foreground">
              Escribí al menos 3 caracteres para buscar.
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
