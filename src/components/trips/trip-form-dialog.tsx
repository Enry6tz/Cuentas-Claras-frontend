'use client';

import { useState, FormEvent } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
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
import {
  createTrip,
  updateTrip,
  type TripPayload,
} from '@/lib/api/trips';
import type { Trip } from '@/types';

/**
 * Dialog (modal) reutilizable para crear o editar un Trip.
 *
 * Decision de diseño: en lugar de tener dos componentes separados (uno para
 * crear y otro para editar), usamos uno solo que se comporta distinto segun
 * reciba o no un `trip` prop.
 *   - Si `trip` viene -> modo edit.
 *   - Si `trip` es undefined -> modo create.
 *
 * Asi reutilizamos toda la logica del form (estado, validacion, submit) y
 * solo cambia que mutation se dispara y que titulo muestra el modal.
 *
 * Convencion en este proyecto: los dialogs son "controlados" desde afuera
 * (`open` + `onOpenChange`), asi el padre decide cuando abrir/cerrar y puede,
 * por ejemplo, mostrar un loading antes de abrir, o cerrar cuando recibe
 * confirmacion de otro lado.
 */
interface TripFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trip?: Trip; // si viene -> modo edit
}

export function TripFormDialog({
  open,
  onOpenChange,
  trip,
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

  // TanStack Query: cliente global usado para INVALIDAR cache despues del
  // submit, asi la lista de trips se refetchea automaticamente.
  const queryClient = useQueryClient();

  /**
   * `useMutation` envuelve un side-effect (POST/PATCH/DELETE).
   * Te da estados (`isPending`, `isError`) y callbacks (`onSuccess`, `onError`)
   * sin tener que manejar useState/try-catch manualmente.
   */
  const mutation = useMutation({
    mutationFn: async (payload: TripPayload) => {
      if (isEdit && trip) {
        return updateTrip(trip.id, payload);
      }
      return createTrip(payload);
    },
    onSuccess: (created) => {
      toast.success(isEdit ? 'Viaje actualizado' : 'Viaje creado');

      // Invalidar la lista hace que la `page.tsx` de trips refetchee y
      // muestre el nuevo (o actualizado) trip sin que tengamos que tocar
      // el estado manualmente. Es la magia de TanStack Query.
      queryClient.invalidateQueries({ queryKey: ['trips'] });
      // Si estamos en modo edit, tambien invalidamos el detalle.
      if (isEdit) {
        queryClient.invalidateQueries({ queryKey: ['trips', created.id] });
      }

      onOpenChange(false);
    },
    onError: (err: unknown) => {
      // axios mete el body de error del back en `err.response.data`.
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? 'Algo salio mal';
      toast.error(typeof message === 'string' ? message : 'Algo salio mal');
    },
  });

  function handleSubmit(e: FormEvent) {
    e.preventDefault();

    // Validacion de cliente (basica). El back va a re-validar via DTO igual.
    const trimmedName = name.trim();
    if (!trimmedName) {
      toast.error('El nombre es obligatorio');
      return;
    }
    if (baseCurrency.length !== 3) {
      toast.error('La moneda debe ser un codigo de 3 letras (ej. ARS, USD)');
      return;
    }

    // Construimos el payload omitiendo strings vacios para que viajen como
    // undefined y el back los trate como "no setear" en lugar de string "".
    mutation.mutate({
      name: trimmedName,
      description: description.trim() || undefined,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      baseCurrency: baseCurrency.toUpperCase(),
    });
  }

  return (
    <Dialog key={trip?.id ?? 'new'} open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
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
            <div className="grid gap-2">
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
                <Input
                  id="startDate"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="endDate">Fin</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
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
