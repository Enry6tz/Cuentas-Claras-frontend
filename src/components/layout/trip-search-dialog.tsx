'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Users } from 'lucide-react';
import { tripColorHex, tripIcon } from '@/lib/trip-appearance';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { TripStatusBadge } from '@/components/shared/ui-bits';
import { useTrips } from '@/hooks/querys/trips/useTrips';

interface TripSearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/** Buscador rápido para encontrar y cambiar de viaje desde cualquier pantalla. */
export function TripSearchDialog({ open, onOpenChange }: TripSearchDialogProps) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const { data: trips = [], isLoading } = useTrips();

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? trips.filter((t) => t.name.toLowerCase().includes(q)) : trips;
  }, [trips, query]);

  function handleOpenChange(next: boolean) {
    if (!next) setQuery('');
    onOpenChange(next);
  }

  function goTo(id: string) {
    handleOpenChange(false);
    router.push(`/trips/${id}`);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="gap-0 overflow-hidden p-0 sm:max-w-lg">
        <DialogHeader className="border-b px-4 py-3">
          <DialogTitle className="sr-only">Buscar viaje</DialogTitle>
          <DialogDescription className="sr-only">
            Buscá un viaje por nombre y cambiá a él.
          </DialogDescription>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar viaje por nombre…"
              className="h-10 border-0 pl-9 shadow-none focus-visible:ring-0"
            />
          </div>
        </DialogHeader>

        <ul className="max-h-80 overflow-y-auto p-2">
          {isLoading && (
            <li className="px-3 py-6 text-center text-sm text-muted-foreground">
              Cargando viajes…
            </li>
          )}

          {!isLoading && filtered.length === 0 && (
            <li className="px-3 py-6 text-center text-sm text-muted-foreground">
              No se encontraron viajes.
            </li>
          )}

          {filtered.map((trip) => (
            <li key={trip.id}>
              <button
                onClick={() => goTo(trip.id)}
                className="flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-muted"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <span
                    className="flex size-8 shrink-0 items-center justify-center rounded-lg text-base"
                    style={{ backgroundColor: tripColorHex(trip.colorId) }}
                  >
                    {tripIcon(trip.iconId)}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">{trip.name}</p>
                    <p className="flex items-center gap-1 truncate text-xs text-muted-foreground">
                      <Users className="size-3" />
                      {trip._count?.participations ?? 0} · {trip.baseCurrency}
                    </p>
                  </div>
                </div>
                <TripStatusBadge status={trip.status} className="shrink-0" />
              </button>
            </li>
          ))}
        </ul>
      </DialogContent>
    </Dialog>
  );
}
