'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { UserPlus, Crown, Eye, User as UserIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ParticipantActions } from './participant-actions';
import { AddParticipantDialog } from './add-participant-dialog';
import { listParticipants } from '@/lib/api/participants';
import type { ParticipationRole } from '@/types';

interface ParticipantsListProps {
  tripId: string;
  currentUserId: string;
}

const roleConfig: Record<ParticipationRole, { label: string; icon: typeof Crown; variant: 'default' | 'secondary' | 'outline' }> = {
  CREATOR: { label: 'Creador', icon: Crown, variant: 'default' },
  SUPERVISOR: { label: 'Supervisor', icon: Eye, variant: 'secondary' },
  MEMBER: { label: 'Miembro', icon: UserIcon, variant: 'outline' },
};

export function ParticipantsList({ tripId, currentUserId }: ParticipantsListProps) {
  const [addOpen, setAddOpen] = useState(false);

  const { data: participants = [], isLoading, isError } = useQuery({
    queryKey: ['trips', tripId, 'participants'],
    queryFn: () => listParticipants(tripId),
  });

  const currentParticipation = participants.find((p) => p.userId === currentUserId);
  const currentUserRole = currentParticipation?.role ?? 'MEMBER';
  const isCreator = currentUserRole === 'CREATOR';

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">
            Participantes {participants.length > 0 && `(${participants.length})`}
          </CardTitle>
          {isCreator && (
            <Button size="sm" variant="outline" onClick={() => setAddOpen(true)}>
              <UserPlus className="h-4 w-4" />
              Agregar
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {isLoading && (
            <ul className="divide-y">
              {[1, 2, 3].map((i) => (
                <li key={i} className="flex animate-pulse items-center justify-between py-3">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-muted" />
                    <div className="space-y-1">
                      <div className="h-4 w-32 rounded bg-muted" />
                      <div className="h-3 w-44 rounded bg-muted" />
                    </div>
                  </div>
                  <div className="h-6 w-20 rounded bg-muted" />
                </li>
              ))}
            </ul>
          )}

          {isError && (
            <p className="py-4 text-center text-sm text-destructive">
              No se pudieron cargar los participantes.
            </p>
          )}

          {!isLoading && !isError && participants.length === 0 && (
            <p className="py-4 text-center text-sm text-muted-foreground">
              Sin participantes aún.
            </p>
          )}

          {!isLoading && !isError && participants.length > 0 && (
            <ul className="divide-y">
              {participants.map((p) => {
                const { label, icon: RoleIcon, variant } = roleConfig[p.role];
                const isCurrentUser = p.userId === currentUserId;
                const balance = parseFloat(p.currentBalance ?? '0');
                const balanceColor =
                  balance > 0 ? 'text-success' : balance < 0 ? 'text-destructive' : 'text-muted-foreground';

                return (
                  <li key={p.id} className="flex items-center justify-between py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-sm font-medium text-primary">
                        {p.user?.name?.charAt(0).toUpperCase() ?? '?'}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {p.user?.name ?? 'Sin nombre'}
                          {isCurrentUser && (
                            <span className="ml-2 text-xs text-muted-foreground">(vos)</span>
                          )}
                        </p>
                        <p className="text-xs text-muted-foreground">{p.user?.email}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className={`text-xs font-medium ${balanceColor}`}>
                        {balance === 0 ? 'Saldado' : `${balance > 0 ? '+' : ''}${balance.toFixed(2)}`}
                      </span>
                      <Badge variant={variant} className="gap-1">
                        <RoleIcon className="h-3 w-3" />
                        {label}
                      </Badge>
                      <ParticipantActions
                        tripId={tripId}
                        participation={p}
                        currentUserRole={currentUserRole}
                        isCurrentUser={isCurrentUser}
                      />
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </CardContent>
      </Card>

      {isCreator && (
        <AddParticipantDialog tripId={tripId} open={addOpen} onOpenChange={setAddOpen} />
      )}
    </>
  );
}
