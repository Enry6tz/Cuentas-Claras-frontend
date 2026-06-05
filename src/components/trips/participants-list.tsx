'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { UserPlus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { PersonAvatar, RoleBadge } from '@/components/shared/ui-bits';
import { ParticipantActions } from './participant-actions';
import { AddParticipantDialog } from './add-participant-dialog';
import { listParticipants } from '@/lib/api/participants';

interface ParticipantsListProps {
  tripId: string;
  currentUserId: string;
}

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
        <CardHeader className="flex-row items-start justify-between gap-2">
          <div className="space-y-0.5">
            <CardTitle className="text-base font-semibold">Integrantes</CardTitle>
            <p className="text-xs text-muted-foreground">
              {participants.length} {participants.length === 1 ? 'persona' : 'personas'} en este viaje
            </p>
          </div>
          {isCreator && (
            <Button size="sm" variant="outline" onClick={() => setAddOpen(true)}>
              <UserPlus className="size-4" />
              Agregar integrante
            </Button>
          )}
        </CardHeader>
        <CardContent className="p-0">
          {isLoading && (
            <ul className="divide-y px-4">
              {[1, 2, 3].map((i) => (
                <li key={i} className="flex animate-pulse items-center justify-between py-3">
                  <div className="flex items-center gap-3">
                    <div className="size-9 rounded-full bg-muted" />
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
            <p className="py-8 text-center text-sm text-destructive">
              No se pudieron cargar los integrantes.
            </p>
          )}

          {!isLoading && !isError && participants.length === 0 && (
            <p className="py-8 text-center text-sm text-muted-foreground">
              Sin integrantes aún.
            </p>
          )}

          {!isLoading && !isError && participants.length > 0 && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="px-4">Integrante</TableHead>
                  <TableHead>Rol</TableHead>
                  <TableHead className="text-right">Saldo</TableHead>
                  <TableHead className="px-4" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {participants.map((p) => {
                  const isCurrentUser = p.userId === currentUserId;
                  const balance = parseFloat(p.currentBalance ?? '0');
                  const balanceColor =
                    balance > 0
                      ? 'text-success'
                      : balance < 0
                        ? 'text-destructive'
                        : 'text-muted-foreground';
                  const balanceText =
                    balance === 0
                      ? 'Saldado'
                      : `${balance > 0 ? '+' : '−'}${Math.abs(balance).toLocaleString('es-AR', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}`;
                  const name = p.user?.name ?? 'Sin nombre';

                  return (
                    <TableRow key={p.id}>
                      <TableCell className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <PersonAvatar name={name} seed={p.userId} />
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-foreground">
                              {name}
                              {isCurrentUser && (
                                <span className="ml-1.5 text-xs font-normal text-muted-foreground">
                                  · vos
                                </span>
                              )}
                            </p>
                            <p className="truncate text-xs text-muted-foreground">
                              {p.user?.email}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <RoleBadge role={p.role} />
                      </TableCell>
                      <TableCell className={`text-right text-sm font-semibold tabular-nums ${balanceColor}`}>
                        {balanceText}
                      </TableCell>
                      <TableCell className="px-4 text-right">
                        <ParticipantActions
                          tripId={tripId}
                          participation={p}
                          currentUserRole={currentUserRole}
                          isCurrentUser={isCurrentUser}
                        />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {isCreator && (
        <AddParticipantDialog tripId={tripId} open={addOpen} onOpenChange={setAddOpen} />
      )}
    </>
  );
}
