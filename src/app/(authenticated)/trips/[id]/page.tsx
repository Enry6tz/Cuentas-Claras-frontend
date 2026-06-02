'use client';

import { useState, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { ArrowLeft, Calendar, Users } from 'lucide-react';
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
import { ParticipantsList } from '@/components/trips/participants-list';
import { getTrip, deleteTrip } from '@/lib/api/trips';
import { getMe } from '@/lib/api/users';

interface TripDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function TripDetailPage({ params }: TripDetailPageProps) {
  const { id } = use(params);
  const router = useRouter();
  const queryClient = useQueryClient();

  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const { data: trip, isLoading, isError } = useQuery({
    queryKey: ['trips', id],
    queryFn: () => getTrip(id),
  });

  const { data: currentUser } = useQuery({
    queryKey: ['users', 'me'],
    queryFn: getMe,
    staleTime: 5 * 60_000,
  });

  const isCreator =
    !!currentUser &&
    trip?.participations?.some(
      (p) => p.userId === currentUser.id && p.role === 'CREATOR',
    );

  const deleteMutation = useMutation({
    mutationFn: () => deleteTrip(id),
    onSuccess: () => {
      toast.success('Viaje eliminado');
      queryClient.invalidateQueries({ queryKey: ['trips'] });
      router.push('/trips');
    },
    onError: (err: unknown) => {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? 'No se pudo eliminar el viaje';
      toast.error(typeof message === 'string' ? message : 'Algo salió mal');
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
              No se encontró el viaje o no tenés acceso.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const formatDate = (iso: string | null) =>
    iso ? new Date(iso).toLocaleDateString('es-AR') : '—';

  return (
    <div className="space-y-6">
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
            <p className="mt-1 text-sm text-muted-foreground">{trip.description}</p>
          )}
        </div>
        {isCreator && (
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setEditOpen(true)}>
              Editar
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDeleteOpen(true)}
              className="text-destructive hover:bg-destructive/10 hover:text-destructive"
            >
              Eliminar
            </Button>
          </div>
        )}
      </div>

      {/* Info cards */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Fechas</CardTitle>
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
            <CardTitle className="text-sm font-medium text-muted-foreground">Moneda base</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-foreground">{trip.baseCurrency}</p>
          </CardContent>
        </Card>
      </div>

      {/* Participantes — query propia, gestión completa */}
      {currentUser ? (
        <ParticipantsList tripId={id} currentUserId={currentUser.id} />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Participantes</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-2 py-6 text-sm text-muted-foreground">
            <Users className="h-4 w-4" />
            Cargando participantes...
          </CardContent>
        </Card>
      )}

      {isCreator && (
        <TripFormDialog open={editOpen} onOpenChange={setEditOpen} trip={trip} />
      )}

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Eliminar viaje</DialogTitle>
            <DialogDescription>
              Vas a eliminar <strong>{trip.name}</strong>. Esta acción oculta el viaje de la lista,
              pero los datos quedan guardados.
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
