'use client';

import { useState, use, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useUser } from '@clerk/nextjs';
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
  Plus,
} from 'lucide-react';
import { ArrowLeft, Calendar, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { TripFormDialog } from '@/components/trips/trip-form-dialog';
import { ExpenseList } from '@/components/expenses/expense-list';
import { ExpenseFormDialog } from '@/components/expenses/expense-form-dialog';
import { PaymentList } from '@/components/payments/payment-list';
import { PaymentFormDialog } from '@/components/payments/payment-form-dialog';
import { BalanceSummary } from '@/components/balances/balance-summary';
import { SettlementSuggestions } from '@/components/balances/settlement-suggestions';
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
  const [expenseFormOpen, setExpenseFormOpen] = useState(false);
  const [paymentFormOpen, setPaymentFormOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('info');
  const { user: clerkUser } = useUser();

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

  const currentUserId = useMemo(() => {
    const clerkEmail = clerkUser?.primaryEmailAddress?.emailAddress;
    if (!clerkEmail || !trip?.participations) return '';
    const match = trip.participations.find(
      (p) => p.user?.email === clerkEmail,
    );
    return match?.userId ?? '';
  }, [clerkUser, trip]);

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

  const myParticipation = trip.participations?.find(
    (p) => p.userId === currentUserId,
  );
  const isCreator = myParticipation?.role === 'CREATOR';
  const isSupervisor = myParticipation?.role === 'SUPERVISOR';

  return (
    <div className="space-y-6">
      <Link href="/trips">
        <Button variant="ghost" size="sm">
          <ArrowLeft className="h-4 w-4" />
          Volver a viajes
        </Button>
      </Link>

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

      <div className="grid gap-4 sm:grid-cols-3">
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
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="info">Participantes</TabsTrigger>
          <TabsTrigger value="expenses">
            Gastos
          </TabsTrigger>
          <TabsTrigger value="payments">
            Pagos
          </TabsTrigger>
          <TabsTrigger value="balances">Balances</TabsTrigger>
        </TabsList>

        <TabsContent value="info" className="mt-4">
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
        </TabsContent>

        <TabsContent value="expenses" className="mt-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Gastos</CardTitle>
                {!isSupervisor && (
                  <Button size="sm" onClick={() => setExpenseFormOpen(true)}>
                    <Plus className="h-4 w-4" />
                    Agregar gasto
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <ExpenseList
                tripId={id}
                participations={trip.participations ?? []}
                currentUserId={currentUserId}
                isSupervisor={isSupervisor}
                isCreator={isCreator}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments" className="mt-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Pagos</CardTitle>
                {!isSupervisor && (
                  <Button size="sm" onClick={() => setPaymentFormOpen(true)}>
                    <Plus className="h-4 w-4" />
                    Registrar pago
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <PaymentList
                tripId={id}
                currentUserId={currentUserId}
                isSupervisor={isSupervisor}
                isCreator={isCreator}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="balances" className="mt-4">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Balances</CardTitle>
              </CardHeader>
              <CardContent>
                <BalanceSummary
                  tripId={id}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  Liquidación sugerida
                </CardTitle>
              </CardHeader>
              <CardContent>
                <SettlementSuggestions
                  tripId={id}
                  participations={trip.participations ?? []}
                  baseCurrency={trip.baseCurrency}
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      <TripFormDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        trip={trip}
      />

      <ExpenseFormDialog
        open={expenseFormOpen}
        onOpenChange={setExpenseFormOpen}
        tripId={id}
        participations={trip.participations ?? []}
        baseCurrency={trip.baseCurrency}
      />

      <PaymentFormDialog
        open={paymentFormOpen}
        onOpenChange={setPaymentFormOpen}
        tripId={id}
        participations={trip.participations ?? []}
        baseCurrency={trip.baseCurrency}
      />

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
