'use client';

import { useState, FormEvent } from 'react';
import type { QueryKey } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { DatePicker } from '@/components/shared/date-picker';
import { useApiMutation } from '@/hooks/querys/common/useApiMutation';
import { createTrip, updateTrip } from '@/services/api/trips';
import { cn } from '@/lib/utils';
import {
  TRIP_ICONS,
  TRIP_COLORS,
  DEFAULT_ICON_ID,
  DEFAULT_COLOR_ID,
  tripIcon,
  tripColorHex,
} from '@/lib/trip-appearance';
import type { Trip, TripPayload, UpdateTripPayload } from '@/types';

/**
 * Dialog reutilizable para crear o editar un Trip.
 *   - Si `trip` viene → modo edit; si no → modo create.
 *
 * Los services (create/update) y las queryKeys a invalidar son inyectables por
 * props para poder reusar el mismo form desde el panel de admin (que pega a los
 * endpoints /admin y refresca otra cache).
 */
interface TripFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trip?: Trip;
  createFn?: (payload: TripPayload) => Promise<Trip>;
  updateFn?: (id: string, payload: UpdateTripPayload) => Promise<Trip>;
  invalidateKeys?: QueryKey[];
}

export function TripFormDialog({
  open,
  onOpenChange,
  trip,
  createFn = createTrip,
  updateFn = updateTrip,
  invalidateKeys = [['trips']],
}: TripFormDialogProps) {
  const isEdit = Boolean(trip);

  const [name, setName] = useState(trip?.name ?? '');
  const [description, setDescription] = useState(trip?.description ?? '');
  const [startDate, setStartDate] = useState(
    trip?.startDate ? trip.startDate.slice(0, 10) : '',
  );
  const [endDate, setEndDate] = useState(
    trip?.endDate ? trip.endDate.slice(0, 10) : '',
  );
  const [baseCurrency, setBaseCurrency] = useState(trip?.baseCurrency ?? 'ARS');
  const [iconId, setIconId] = useState<number>(trip?.iconId ?? DEFAULT_ICON_ID);
  const [colorId, setColorId] = useState<number>(trip?.colorId ?? DEFAULT_COLOR_ID);

  const mutation = useApiMutation({
    mutationFn: (payload: TripPayload) =>
      isEdit && trip ? updateFn(trip.id, payload) : createFn(payload),
    invalidateKeys,
    successMessage: isEdit ? 'Viaje actualizado' : 'Viaje creado',
  });

  function handleSubmit(e: FormEvent) {
    e.preventDefault();

    const trimmedName = name.trim();
    if (!trimmedName) {
      toast.error('El nombre es obligatorio');
      return;
    }
    if (baseCurrency.length !== 3) {
      toast.error('La moneda debe ser un codigo de 3 letras (ej. ARS, USD)');
      return;
    }

    mutation.mutate(
      {
        name: trimmedName,
        description: description.trim() || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        baseCurrency: baseCurrency.toUpperCase(),
        iconId,
        colorId,
      },
      { onSuccess: () => onOpenChange(false) },
    );
  }

  return (
    <Dialog key={trip?.id ?? 'new'} open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{isEdit ? 'Editar viaje' : 'Nuevo viaje'}</DialogTitle>
            <DialogDescription>
              {isEdit
                ? 'Modifica los datos del viaje. Solo el creador puede editarlo.'
                : 'Crea un viaje. Vos quedas como creador.'}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {/* Preview + nombre */}
            <div className="flex items-center gap-3">
              <div
                className="flex size-12 shrink-0 items-center justify-center rounded-xl text-2xl shadow-sm"
                style={{ backgroundColor: tripColorHex(colorId) }}
              >
                {tripIcon(iconId)}
              </div>
              <div className="grid flex-1 gap-2">
                <Label htmlFor="name">Nombre *</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Bariloche 2026"
                  maxLength={100}
                  required
                  autoFocus
                />
              </div>
            </div>

            {/* Selector de ícono */}
            <div className="grid gap-2">
              <Label>Ícono</Label>
              <div className="grid grid-cols-8 gap-1">
                {TRIP_ICONS.map((emoji, i) => {
                  const id = i + 1;
                  return (
                    <button
                      type="button"
                      key={id}
                      onClick={() => setIconId(id)}
                      className={cn(
                        'flex aspect-square items-center justify-center rounded-md text-lg transition-colors hover:bg-muted',
                        iconId === id && 'bg-muted ring-2 ring-primary',
                      )}
                    >
                      {emoji}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Selector de color */}
            <div className="grid gap-2">
              <Label>Color</Label>
              <div className="grid grid-cols-10 gap-1.5">
                {TRIP_COLORS.map((c) => (
                  <button
                    type="button"
                    key={c.id}
                    title={c.name}
                    onClick={() => setColorId(c.id)}
                    style={{ backgroundColor: c.hex }}
                    className={cn(
                      'aspect-square rounded-md transition-transform hover:scale-110',
                      colorId === c.id &&
                        'ring-2 ring-foreground ring-offset-2 ring-offset-background',
                    )}
                  />
                ))}
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Descripcion</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Semana en Bariloche con los chicos"
                maxLength={500}
                rows={2}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-2">
                <Label htmlFor="startDate">Inicio</Label>
                <DatePicker id="startDate" value={startDate} onChange={setStartDate} placeholder="Inicio" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="endDate">Fin</Label>
                <DatePicker id="endDate" value={endDate} onChange={setEndDate} placeholder="Fin" />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="baseCurrency">Moneda base *</Label>
              <Input
                id="baseCurrency"
                value={baseCurrency}
                onChange={(e) => setBaseCurrency(e.target.value.toUpperCase())}
                placeholder="ARS"
                maxLength={3}
                minLength={3}
                required
              />
              <p className="text-xs text-muted-foreground">
                Codigo ISO 4217 de 3 letras. Todos los gastos se convertiran a
                esta moneda para los balances.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={mutation.isPending}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending
                ? 'Guardando...'
                : isEdit
                  ? 'Guardar cambios'
                  : 'Crear viaje'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
