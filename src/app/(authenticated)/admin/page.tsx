'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useUser } from '@clerk/nextjs';
import { toast } from 'sonner';
import { Pencil, Trash2, Users, Receipt } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { TripFormDialog } from '@/components/trips/trip-form-dialog';
import { listAdminTrips, updateAdminTrip, deleteAdminTrip } from '@/lib/api/admin';
import type { Trip } from '@/types';

export default function AdminPage() {
  const { user } = useUser();
  const queryClient = useQueryClient();

  const [editTrip, setEditTrip] = useState<Trip | null>(null);
  const [deleteTrip, setDeleteTrip] = useState<Trip | null>(null);

  const isAdmin = user?.publicMetadata?.admin === true;

  const { data: trips, isLoading, isError } = useQuery({
    queryKey: ['admin', 'trips'],
    queryFn: listAdminTrips,
    enabled: isAdmin,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteAdminTrip(id),
    onSuccess: () => {
      toast.success('Viaje eliminado');
      queryClient.invalidateQueries({ queryKey: ['admin', 'trips'] });
      setDeleteTrip(null);
    },
    onError: (err: unknown) => {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? 'No se pudo eliminar el viaje';
      toast.error(typeof message === 'string' ? message : 'Algo salió mal');
    },
  });

  const formatDate = (iso: string | null) =>
    iso ? new Date(iso).toLocaleDateString('es-AR') : '—';

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center py-24">
        <Card>
          <CardContent className="py-12 px-16 text-center">
            <p className="text-lg font-semibold text-destructive">Acceso denegado</p>
            <p className="mt-2 text-sm text-muted-foreground">
              No tenés permisos de administrador.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Panel de administrador</h1>
        <p className="text-sm text-muted-foreground">
          Todos los viajes del sistema. Podés editar o eliminar cualquiera.
        </p>
      </div>

      {isLoading && (
        <Card>
          <CardContent className="flex items-center justify-center py-16">
            <p className="text-sm text-muted-foreground">Cargando viajes...</p>
          </CardContent>
        </Card>
      )}

      {isError && (
        <Card>
          <CardContent className="flex items-center justify-center py-16">
            <p className="text-sm text-destructive">
              Error al cargar los viajes. Reintentá en unos segundos.
            </p>
          </CardContent>
        </Card>
      )}

      {!isLoading && !isError && trips && (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Moneda</TableHead>
                  <TableHead>Fechas</TableHead>
                  <TableHead className="text-center">
                    <Users className="inline h-4 w-4" />
                  </TableHead>
                  <TableHead className="text-center">
                    <Receipt className="inline h-4 w-4" />
                  </TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {trips.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="py-12 text-center text-muted-foreground">
                      No hay viajes en el sistema.
                    </TableCell>
                  </TableRow>
                )}
                {trips.map((trip) => (
                  <TableRow key={trip.id}>
                    <TableCell>
                      <div className="font-medium">{trip.name}</div>
                      {trip.description && (
                        <div className="text-xs text-muted-foreground line-clamp-1">
                          {trip.description}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={trip.status === 'ACTIVE' ? 'default' : 'secondary'}>
                        {trip.status === 'ACTIVE' ? 'Activo' : 'Finalizado'}
                      </Badge>
                    </TableCell>
                    <TableCell>{trip.baseCurrency}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDate(trip.startDate)} → {formatDate(trip.endDate)}
                    </TableCell>
                    <TableCell className="text-center text-sm">
                      {trip._count?.participations ?? 0}
                    </TableCell>
                    <TableCell className="text-center text-sm">
                      {trip._count?.expenses ?? 0}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditTrip(trip)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeleteTrip(trip)}
                          className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {editTrip && (
        <TripFormDialog
          open={!!editTrip}
          onOpenChange={(open) => { if (!open) setEditTrip(null); }}
          trip={editTrip}
          updateFn={updateAdminTrip}
        />
      )}

      <Dialog open={!!deleteTrip} onOpenChange={(open) => { if (!open) setDeleteTrip(null); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Eliminar viaje</DialogTitle>
            <DialogDescription>
              Vas a eliminar <strong>{deleteTrip?.name}</strong>. Esta acción oculta
              el viaje de la lista pero conserva todos los datos.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteTrip(null)}
              disabled={deleteMutation.isPending}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              disabled={deleteMutation.isPending}
              onClick={() => deleteTrip && deleteMutation.mutate(deleteTrip.id)}
            >
              {deleteMutation.isPending ? 'Eliminando...' : 'Eliminar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
