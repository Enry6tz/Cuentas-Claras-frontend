'use client';

import { useState, type ReactNode } from 'react';
import { Plus, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useTrips } from '@/hooks/querys/trips/useTrips';
import { useTrip } from '@/hooks/querys/trips/useTrip';
import { tripColorHex, tripIcon } from '@/lib/trip-appearance';
import type { Trip } from '@/types';

/**
 * Acción "Nuevo gasto / Registrar pago" desde una lista global. Flujo en dos
 * pasos sin navegar: (1) elegir el viaje, (2) cuando se cargan sus datos
 * (participantes + moneda), se abre el mismo formulario que dentro del viaje.
 *
 * `renderForm` recibe el viaje ya cargado y debe renderizar el dialog del form.
 */
export function NewInTripButton({
  label,
  title,
  description,
  renderForm,
}: {
  label: string;
  title: string;
  description: string;
  renderForm: (trip: Trip, open: boolean, onClose: () => void) => ReactNode;
}) {
  const [triggerOpen, setTriggerOpen] = useState(false);
  const [tripId, setTripId] = useState<string | null>(null);

  const { data: trips = [] } = useTrips();
  const active = trips.filter((t) => t.status === 'ACTIVE');
  const { data: trip } = useTrip(tripId ?? undefined);

  // Estados derivados (sin efectos): el picker se cierra solo cuando el viaje
  // elegido terminó de cargar, y ahí se abre el formulario.
  const pickerOpen = triggerOpen && (!tripId || !trip);
  const formOpen = triggerOpen && !!tripId && !!trip;

  function reset() {
    setTriggerOpen(false);
    setTripId(null);
  }

  return (
    <>
      <Button
        className="h-11 shrink-0"
        disabled={active.length === 0}
        onClick={() => {
          setTripId(null);
          setTriggerOpen(true);
        }}
      >
        <Plus className="size-4" />
        <span className="hidden sm:inline">{label}</span>
      </Button>

      <Dialog open={pickerOpen} onOpenChange={(o) => !o && reset()}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>{description}</DialogDescription>
          </DialogHeader>

          {!tripId ? (
            <ul className="max-h-80 space-y-1 overflow-y-auto">
              {active.map((t) => (
                <li key={t.id}>
                  <button
                    onClick={() => setTripId(t.id)}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-muted"
                  >
                    <span
                      className="flex size-8 shrink-0 items-center justify-center rounded-lg text-base"
                      style={{ backgroundColor: tripColorHex(t.colorId) }}
                    >
                      {tripIcon(t.iconId)}
                    </span>
                    <span className="truncate text-sm font-medium text-foreground">
                      {t.name}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="flex items-center justify-center gap-2 py-8 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" />
              Cargando viaje…
            </div>
          )}
        </DialogContent>
      </Dialog>

      {trip && formOpen && renderForm(trip, formOpen, reset)}
    </>
  );
}
