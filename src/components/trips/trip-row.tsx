'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MoreVertical, Eye, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
import { TripStatusBadge } from '@/components/shared/ui-bits';
import { TripFormDialog } from '@/components/trips/trip-form-dialog';
import { useTripMutations } from '@/hooks/querys/trips/useTripMutations';
import { tripColorHex, tripIcon } from '@/lib/trip-appearance';
import type { Trip } from '@/types';

interface TripRowProps {
  trip: Trip;
  currentUserId?: string;
}

/** Fila de la lista de viajes: badge de estado, nombre + meta, y acciones
 *  (ver detalle siempre; editar/eliminar solo para el creador). */
export function TripRow({ trip, currentUserId }: TripRowProps) {
  const router = useRouter();
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const { remove } = useTripMutations();

  const isCreator =
    !!currentUserId &&
    (trip.participations?.some(
      (p) => p.userId === currentUserId && p.role === 'CREATOR',
    ) ??
      false);

  const members = trip._count?.participations ?? trip.participations?.length ?? 0;
  const expenses = trip._count?.expenses ?? 0;
  const open = () => router.push(`/trips/${trip.id}`);

  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border bg-card px-4 py-3.5 transition-colors hover:bg-muted/40">
      <button
        onClick={open}
        className="flex min-w-0 flex-1 items-center gap-3 text-left"
      >
        <span
          className="flex size-9 shrink-0 items-center justify-center rounded-lg text-lg"
          style={{ backgroundColor: tripColorHex(trip.colorId) }}
        >
          {tripIcon(trip.iconId)}
        </span>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <p className="truncate font-semibold text-foreground">{trip.name}</p>
            <TripStatusBadge status={trip.status} className="shrink-0" />
          </div>
          <p className="truncate text-xs text-muted-foreground">
            {trip.description?.trim()
              ? trip.description
              : `${members} ${members === 1 ? 'integrante' : 'integrantes'} · ${expenses} ${expenses === 1 ? 'gasto' : 'gastos'} · ${trip.baseCurrency}`}
          </p>
        </div>
      </button>

      <div className="flex shrink-0 items-center gap-1">
        <Button variant="ghost" size="sm" className="text-primary" onClick={open}>
          <Eye className="size-4" />
          <span className="hidden sm:inline">Ver detalle</span>
        </Button>
        {isCreator && (
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button variant="ghost" size="icon-sm" className="text-muted-foreground">
                  <MoreVertical className="size-4" />
                  <span className="sr-only">Acciones del viaje</span>
                </Button>
              }
            />
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setEditOpen(true)}>
                <Pencil className="size-4" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuItem variant="destructive" onClick={() => setDeleteOpen(true)}>
                <Trash2 className="size-4" />
                Eliminar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {isCreator && (
        <TripFormDialog open={editOpen} onOpenChange={setEditOpen} trip={trip} />
      )}

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Eliminar viaje</DialogTitle>
            <DialogDescription>
              Vas a eliminar <strong>{trip.name}</strong>. Se oculta de la lista
              pero los datos quedan guardados.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteOpen(false)}
              disabled={remove.isPending}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              disabled={remove.isPending}
              onClick={() =>
                remove.mutate(trip.id, { onSuccess: () => setDeleteOpen(false) })
              }
            >
              {remove.isPending ? 'Eliminando...' : 'Eliminar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
