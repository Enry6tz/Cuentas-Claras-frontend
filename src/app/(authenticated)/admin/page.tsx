'use client';

import { useState, useMemo } from 'react';
import { useUser } from '@clerk/nextjs';
import {
  Pencil,
  Trash2,
  Plane,
  Users,
  Receipt,
  Globe,
  Lock,
  ShieldCheck,
  PlusCircle,
} from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
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
import { TripStatusBadge } from '@/components/shared/ui-bits';
import { TripFormDialog } from '@/components/trips/trip-form-dialog';
import { useAdminTrips } from '@/hooks/querys/admin/useAdminTrips';
import { useAdminTripMutations } from '@/hooks/querys/admin/useAdminTripMutations';
import { updateAdminTrip } from '@/services/api/admin';
import type { Trip } from '@/types';

const ADMIN_TRIPS_KEY = [['admin', 'trips']];

export default function AdminPage() {
  const { user } = useUser();

  const [createOpen, setCreateOpen] = useState(false);
  const [editTrip, setEditTrip] = useState<Trip | null>(null);
  const [deleteTrip, setDeleteTrip] = useState<Trip | null>(null);

  const isAdmin = user?.publicMetadata?.admin === true;

  const { data: trips, isLoading, isError } = useAdminTrips({ enabled: isAdmin });

  const { remove: deleteMutation } = useAdminTripMutations();

  const totals = useMemo(() => {
    const list = trips ?? [];
    return {
      trips: list.length,
      expenses: list.reduce((s, t) => s + (t._count?.expenses ?? 0), 0),
    };
  }, [trips]);

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center py-24">
        <Card>
          <CardContent className="px-16 py-12 text-center">
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
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold text-foreground">
              Hola, {user?.firstName ?? 'admin'}
            </h1>
            <Badge className="gap-1">
              <ShieldCheck className="size-3.5" />
              Administrador
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            Esto es lo que viene pasando en tus viajes.
          </p>
          <div className="flex items-center gap-2 pt-0.5">
            <span className="flex items-center gap-1.5 text-sm font-medium text-foreground">
              <Globe className="size-4" />
              Vista general
            </span>
            <Badge variant="secondary" className="gap-1 text-muted-foreground">
              <Lock className="size-3" />
              Solo lectura
            </Badge>
          </div>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <PlusCircle className="size-4" />
          Crear viaje
        </Button>
      </div>

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <AdminStat label="Viajes totales" value={isLoading ? '—' : totals.trips} icon={<Plane className="size-4" />} />
        <AdminStat label="Usuarios" value="—" icon={<Users className="size-4" />} />
        <AdminStat label="Gastos registrados" value={isLoading ? '—' : totals.expenses} icon={<Receipt className="size-4" />} />
        <AdminStat label="Volumen total" value="—" icon={<Globe className="size-4" />} />
      </div>

      <Card>
        <CardHeader className="space-y-0.5">
          <p className="text-base font-semibold text-foreground">Últimos viajes del sistema</p>
          <p className="text-xs text-muted-foreground">Monitoreo global — sin acciones destructivas.</p>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading && (
            <div className="flex items-center justify-center py-16">
              <p className="text-sm text-muted-foreground">Cargando viajes...</p>
            </div>
          )}

          {isError && (
            <div className="flex items-center justify-center py-16">
              <p className="text-sm text-destructive">
                Error al cargar los viajes. Reintentá en unos segundos.
              </p>
            </div>
          )}

          {!isLoading && !isError && trips && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="px-4">Viaje</TableHead>
                  <TableHead>Creador</TableHead>
                  <TableHead className="text-center">Integrantes</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="px-4 text-right" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {trips.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="py-12 text-center text-muted-foreground">
                      No hay viajes en el sistema.
                    </TableCell>
                  </TableRow>
                )}
                {trips.map((trip) => (
                  <TableRow key={trip.id}>
                    <TableCell className="px-4">
                      <div className="font-medium text-foreground">{trip.name}</div>
                      {trip.description && (
                        <div className="text-xs text-muted-foreground line-clamp-1">
                          {trip.description}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {trip.participations?.find((p) => p.role === 'CREATOR')?.user?.name ?? '—'}
                    </TableCell>
                    <TableCell className="text-center text-sm tabular-nums">
                      {trip._count?.participations ?? 0}
                    </TableCell>
                    <TableCell>
                      <TripStatusBadge status={trip.status} />
                    </TableCell>
                    <TableCell className="px-4">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon-sm" onClick={() => setEditTrip(trip)}>
                          <Pencil className="size-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => setDeleteTrip(trip)}
                          className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <TripFormDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        invalidateKeys={ADMIN_TRIPS_KEY}
      />

      {editTrip && (
        <TripFormDialog
          open={!!editTrip}
          onOpenChange={(open) => {
            if (!open) setEditTrip(null);
          }}
          trip={editTrip}
          updateFn={updateAdminTrip}
          invalidateKeys={ADMIN_TRIPS_KEY}
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
              onClick={() =>
                deleteTrip &&
                deleteMutation.mutate(deleteTrip.id, {
                  onSuccess: () => setDeleteTrip(null),
                })
              }
            >
              {deleteMutation.isPending ? 'Eliminando...' : 'Eliminar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function AdminStat({
  label,
  value,
  icon,
}: {
  label: string;
  value: React.ReactNode;
  icon: React.ReactNode;
}) {
  return (
    <Card className="overflow-hidden">
      <div className="h-1 bg-primary" />
      <CardHeader className="flex-row items-start justify-between gap-2 pb-1">
        <p className="text-xs leading-tight text-muted-foreground">{label}</p>
        <div className="rounded-lg bg-primary/10 p-2 text-primary">{icon}</div>
      </CardHeader>
      <CardContent>
        <p className="text-3xl font-bold tabular-nums">{value}</p>
      </CardContent>
    </Card>
  );
}
