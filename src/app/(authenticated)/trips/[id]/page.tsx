'use client';

import { useState, use, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useUser } from '@clerk/nextjs';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  ArrowLeft,
  ArrowLeftRight,
  BarChart3,
  Calendar,
  Crown,
  Edit,
  Eye,
  Plus,
  Receipt,
  Trash2,
  User as UserIcon,
  UserPlus,
  Users,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardAction } from '@/components/ui/card';
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
import { AddParticipantDialog } from '@/components/trips/add-participant-dialog';
import { TripFormDialog } from '@/components/trips/trip-form-dialog';
import { ExpenseList } from '@/components/expenses/expense-list';
import { ExpenseFormDialog } from '@/components/expenses/expense-form-dialog';
import { PaymentList } from '@/components/payments/payment-list';
import { PaymentFormDialog } from '@/components/payments/payment-form-dialog';
import { BalanceSummary } from '@/components/balances/balance-summary';
import { SettlementSuggestions } from '@/components/balances/settlement-suggestions';
import { getTrip, deleteTrip } from '@/lib/api/trips';
import { getMe } from '@/lib/api/users';
import type { ParticipationRole } from '@/types';

const roleConfig: Record<
  ParticipationRole,
  { label: string; icon: typeof Crown; variant: 'default' | 'secondary' | 'outline' }
> = {
  CREATOR: { label: 'Creador', icon: Crown, variant: 'default' },
  SUPERVISOR: { label: 'Supervisor', icon: Eye, variant: 'secondary' },
  MEMBER: { label: 'Miembro', icon: UserIcon, variant: 'outline' },
};

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
  const [addParticipantOpen, setAddParticipantOpen] = useState(false);
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
            {trip.status === 'ACTIVE' ? (
              <Badge variant="secondary" className="gap-1.5 bg-success/10 text-success border-transparent">
                <span className="size-1.5 rounded-full bg-success" />
                En curso
              </Badge>
            ) : (
              <Badge variant="secondary" className="gap-1.5 text-muted-foreground">
                <span className="size-1.5 rounded-full bg-muted-foreground" />
                Finalizado
              </Badge>
            )}
          </div>
          {trip.description && (
            <p className="mt-1 text-sm text-muted-foreground">{trip.description}</p>
          )}
        </div>
        {isCreator && (
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setEditOpen(true)} className="gap-1">
              <Edit className="h-4 w-4" />
              Editar
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDeleteOpen(true)}
              className="gap-1 text-destructive hover:bg-destructive/10 hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
              Eliminar
            </Button>
          </div>
        )}
      </div>

      {/* Info cards row */}
      <Card>
        <CardContent className="p-0">
          <div className="grid sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x">
            <div className="px-6 py-4">
              <p className="text-xs font-medium text-muted-foreground">Fechas</p>
              <div className="mt-1 flex items-center gap-2 text-sm text-foreground">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                {formatDate(trip.startDate)} → {formatDate(trip.endDate)}
              </div>
            </div>
            <div className="px-6 py-4">
              <p className="text-xs font-medium text-muted-foreground">Moneda base</p>
              <p className="mt-1 text-lg font-bold text-foreground">{trip.baseCurrency}</p>
            </div>
            <div className="px-6 py-4">
              <p className="text-xs font-medium text-muted-foreground">Integrantes</p>
              <p className="mt-1 text-lg font-bold text-foreground">
                {trip.participations?.length ?? 0}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList variant="line">
          <TabsTrigger value="info" className="gap-1.5">
            <Users className="h-4 w-4" />
            Integrantes
            <span className="ml-0.5 rounded-full bg-primary/10 px-1.5 py-0.5 text-xs font-medium text-primary">
              {trip.participations?.length ?? 0}
            </span>
          </TabsTrigger>
          <TabsTrigger value="expenses" className="gap-1.5">
            <Receipt className="h-4 w-4" />
            Gastos
          </TabsTrigger>
          <TabsTrigger value="payments" className="gap-1.5">
            <ArrowLeftRight className="h-4 w-4" />
            Pagos
          </TabsTrigger>
          <TabsTrigger value="balances" className="gap-1.5">
            <BarChart3 className="h-4 w-4" />
            Balances
          </TabsTrigger>
        </TabsList>

        <TabsContent value="info" className="mt-4">
          <Card>
            <CardHeader>
              <div>
                <CardTitle className="text-base">Integrantes</CardTitle>
                <p className="text-xs text-muted-foreground">
                  {trip.participations?.length ?? 0} personas en este viaje
                </p>
              </div>
              <CardAction>
                <Button size="sm" variant="outline" className="gap-1" onClick={() => setAddParticipantOpen(true)}>
                  <UserPlus className="h-4 w-4" />
                  Agregar
                </Button>
              </CardAction>
            </CardHeader>
            <CardContent>
              {trip.participations && trip.participations.length > 0 ? (
                <div className="rounded-lg border">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b text-xs text-muted-foreground">
                        <th className="px-4 py-3 text-left font-medium">Integrante</th>
                        <th className="px-4 py-3 text-left font-medium">Rol</th>
                        <th className="px-4 py-3 text-right font-medium">Saldo</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {trip.participations.map((p) => {
                        const RoleIcon = roleConfig[p.role].icon;
                        const isCurrentUser = p.userId === currentUserId;
                        return (
                          <tr key={p.id}>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-3">
                                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-sm font-medium text-primary">
                                  {p.user?.name?.charAt(0).toUpperCase() ?? '?'}
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-foreground">
                                    {p.user?.name ?? 'Sin nombre'}
                                    {isCurrentUser && (
                                      <span className="ml-1.5 text-xs text-muted-foreground">· vos</span>
                                    )}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {p.user?.email}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <Badge variant={p.role === 'CREATOR' ? 'default' : p.role === 'SUPERVISOR' ? 'secondary' : 'outline'} className="gap-1">
                                <RoleIcon className="h-3.5 w-3.5" />
                                {roleConfig[p.role].label}
                              </Badge>
                            </td>
                            <td className="px-4 py-3 text-right">
                              {p.currentBalance ? (() => {
                                const balance = parseFloat(p.currentBalance);
                                const isPositive = balance > 0;
                                const isNegative = balance < 0;
                                return (
                                  <span className={`text-sm font-medium tabular-nums ${
                                    isPositive ? 'text-success' : isNegative ? 'text-destructive' : 'text-muted-foreground'
                                  }`}>
                                    {isPositive ? '+' : ''}{p.currentBalance}
                                  </span>
                                );
                              })() : (
                                <span className="text-sm text-muted-foreground">—</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Sin participantes.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="expenses" className="mt-4">
          <Card>
            <CardHeader>
              <div>
                <CardTitle className="text-base">Gastos</CardTitle>
                <p className="text-xs text-muted-foreground">
                  Gastos registrados en este viaje
                </p>
              </div>
              <CardAction>
                {!isSupervisor && (
                  <Button size="sm" onClick={() => setExpenseFormOpen(true)}>
                    <Plus className="h-4 w-4" />
                    Nuevo gasto
                  </Button>
                )}
              </CardAction>
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
              <div>
                <CardTitle className="text-base">Pagos</CardTitle>
                <p className="text-xs text-muted-foreground">
                  Transferencias entre integrantes para saldar deudas
                </p>
              </div>
              <CardAction>
                {!isSupervisor && (
                  <Button size="sm" onClick={() => setPaymentFormOpen(true)}>
                    <Plus className="h-4 w-4" />
                    Registrar pago
                  </Button>
                )}
              </CardAction>
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
                <CardTitle className="text-base">Saldos por integrante</CardTitle>
                <p className="text-xs text-muted-foreground">
                  Quién le debe a quién en {trip.baseCurrency}
                </p>
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
                <p className="text-xs text-muted-foreground">
                  Transferencias mínimas para dejar todos los saldos en cero
                </p>
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

      <AddParticipantDialog
        tripId={id}
        open={addParticipantOpen}
        onOpenChange={setAddParticipantOpen}
      />

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
