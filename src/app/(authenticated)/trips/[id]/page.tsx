'use client';

import { useState, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  ArrowLeft,
  Calendar,
  Edit,
  Trash2,
  Users,
  Crown,
  Eye,
  User as UserIcon,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { TripFormDialog } from '@/components/trips/trip-form-dialog';
import { getTrip, deleteTrip } from '@/lib/api/trips';
import type { ParticipationRole } from '@/types';

/**
 * Pagina /trips/[id] — detalle de un viaje.
 *
 * En Next.js 15 (App Router), los `params` de rutas dinamicas son una Promise.
 * Por eso usamos `use(params)` (la nueva API de React) para "desempaquetarla"
 * en un Client Component. Si esto fuera un Server Component seria
 * `const { id } = await params;`.
 */
interface TripDetailPageProps {
  params: Promise<{ id: string }>;
}

const roleConfig: Record<ParticipationRole, { label: string; icon: typeof Crown }> = {
  CREATOR: { label: 'Creador', icon: Crown },
  SUPERVISOR: { label: 'Supervisor', icon: Eye },
  MEMBER: { label: 'Miembro', icon: UserIcon },
};

export default function TripDetailPage({ params }: TripDetailPageProps) {
  const { id } = use(params);
  const router = useRouter();
  const queryClient = useQueryClient();

  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  // Trae el detalle del trip. La queryKey incluye el id, asi cada trip se
  // cachea por separado. Cuando editamos un trip, el form invalida tanto
  // ['trips'] como ['trips', id] para refetchear lista y detalle.
  const { data: trip, isLoading, isError } = useQuery({
    queryKey: ['trips', id],
    queryFn: () => getTrip(id),
  });

  // Mutation de borrado. Soft delete: el back marca deletedAt y deja de listarlo.
  const deleteMutation = useMutation({
    mutationFn: () => deleteTrip(id),
    onSuccess: () => {
      toast.success('Viaje eliminado');
      // Invalidamos la lista para que el trip desaparezca de /trips.
      queryClient.invalidateQueries({ queryKey: ['trips'] });
      router.push('/trips');
    },
    onError: (err: unknown) => {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? 'No se pudo eliminar el viaje';
      toast.error(typeof message === 'string' ? message : 'Algo salio mal');
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <p className="text-sm text-muted-foreground">Cargando viaje...</p>
      </div>
    );
  }

  if (isError || !trip) {
    return (
      <div className="space-y-4">
        <Link href="/trips">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4" />
            Volver a viajes
          </Button>
        </Link>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <p className="text-sm text-destructive">
              No se encontro el viaje o no tenes acceso.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Helpers de formateo locales. Si crecen, mover a `lib/format.ts`.
  const formatDate = (iso: string | null) =>
    iso ? new Date(iso).toLocaleDateString('es-AR') : '—';

  return (
    <div className="space-y-6">
      {/* Breadcrumb / volver */}
      <Link href="/trips">
        <Button variant="ghost" size="sm">
          <ArrowLeft className="h-4 w-4" />
          Volver a viajes
        </Button>
      </Link>

      {/* Header del trip */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-foreground">{trip.name}</h1>
            <Badge variant={trip.status === 'ACTIVE' ? 'default' : 'secondary'}>
              {trip.status === 'ACTIVE' ? 'Activo' : 'Finalizado'}
            </Badge>
          </div>
          {trip.description && (
            <p className="mt-1 text-sm text-muted-foreground">
              {trip.description}
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setEditOpen(true)}>
            <Edit className="h-4 w-4" />
            Editar
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setDeleteOpen(true)}
            className="text-destructive hover:bg-destructive/10 hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
            Eliminar
          </Button>
        </div>
      </div>

      {/* Cards informativas */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Fechas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-sm text-foreground">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              {formatDate(trip.startDate)} → {formatDate(trip.endDate)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Moneda base
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-foreground">
              {trip.baseCurrency}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Participantes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-2xl font-bold text-foreground">
              <Users className="h-5 w-5 text-muted-foreground" />
              {trip.participations?.length ?? 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de participantes */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Participantes</CardTitle>
        </CardHeader>
        <CardContent>
          {trip.participations && trip.participations.length > 0 ? (
            <ul className="divide-y">
              {trip.participations.map((p) => {
                const RoleIcon = roleConfig[p.role].icon;
                return (
                  <li
                    key={p.id}
                    className="flex items-center justify-between py-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-sm font-medium text-primary">
                        {p.user?.name?.charAt(0).toUpperCase() ?? '?'}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {p.user?.name ?? 'Sin nombre'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {p.user?.email}
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline" className="gap-1">
                      <RoleIcon className="h-3 w-3" />
                      {roleConfig[p.role].label}
                    </Badge>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">Sin participantes.</p>
          )}
        </CardContent>
      </Card>

      {/* Dialog de edicion (mismo componente que el de creacion, en modo edit) */}
      <TripFormDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        trip={trip}
      />

      {/* Confirmacion de borrado.
          Importante: pedimos confirmacion porque borrar (aun siendo soft) saca
          el trip de la lista del user y de todos sus participantes. */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Eliminar viaje</DialogTitle>
            <DialogDescription>
              Vas a eliminar <strong>{trip.name}</strong>. Esta accion oculta el
              viaje de la lista, pero los datos quedan guardados.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteOpen(false)}
              disabled={deleteMutation.isPending}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteMutation.mutate()}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? 'Eliminando...' : 'Eliminar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
