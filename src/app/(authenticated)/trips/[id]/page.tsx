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
  Coins,
  Users,
  Receipt,
  CreditCard,
  Scale,
  Pencil,
  Trash2,
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
import { TripStatusBadge } from '@/components/shared/ui-bits';
import { TripFormDialog } from '@/components/trips/trip-form-dialog';
import { ExpenseList } from '@/components/expenses/expense-list';
import { ExpenseFormDialog } from '@/components/expenses/expense-form-dialog';
import { PaymentList } from '@/components/payments/payment-list';
import { PaymentFormDialog } from '@/components/payments/payment-form-dialog';
import { BalanceSummary } from '@/components/balances/balance-summary';
import { SettlementSuggestions } from '@/components/balances/settlement-suggestions';
import { getTrip, deleteTrip } from '@/lib/api/trips';
import { getMe } from '@/lib/api/users';

const CURRENCY_NAMES: Record<string, string> = {
  ARS: 'Peso argentino',
  USD: 'Dólar estadounidense',
  EUR: 'Euro',
  BRL: 'Real brasileño',
  CLP: 'Peso chileno',
  UYU: 'Peso uruguayo',
  BOB: 'Boliviano',
  COP: 'Peso colombiano',
  MXN: 'Peso mexicano',
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
  const [activeTab, setActiveTab] = useState('participants');
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
    const match = trip.participations.find((p) => p.user?.email === clerkEmail);
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
            <ArrowLeft className="size-4" />
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
    iso
      ? new Date(iso).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' })
      : '—';

  const myParticipation = trip.participations?.find((p) => p.userId === currentUserId);
  const isCreator = myParticipation?.role === 'CREATOR';
  const isSupervisor = myParticipation?.role === 'SUPERVISOR';
  const participantCount = trip.participations?.length ?? 0;
  const expenseCount = trip._count?.expenses ?? 0;

  return (
    <div className="space-y-6">
      <Link href="/trips">
        <Button variant="ghost" size="sm" className="text-muted-foreground">
          <ArrowLeft className="size-4" />
          Volver a viajes
        </Button>
      </Link>

      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold text-foreground">{trip.name}</h1>
            <TripStatusBadge status={trip.status} />
          </div>
          {trip.description && (
            <p className="text-sm text-muted-foreground">{trip.description}</p>
          )}
        </div>
        {isCreator && (
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setEditOpen(true)}>
              <Pencil className="size-4" />
              Editar
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDeleteOpen(true)}
              className="gap-1 text-destructive hover:bg-destructive/10 hover:text-destructive"
            >
              <Trash2 className="size-4" />
              Eliminar
            </Button>
          </div>
        )}
      </div>

      {/* Info row */}
      <Card>
        <CardContent className="grid gap-4 p-0 sm:grid-cols-3 sm:divide-x">
          <div className="space-y-1 px-5 py-4">
            <p className="text-xs font-medium text-muted-foreground">Fechas</p>
            <p className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
              <Calendar className="size-4 text-muted-foreground" />
              {formatDate(trip.startDate)} – {formatDate(trip.endDate)}
            </p>
          </div>
          <div className="space-y-1 px-5 py-4">
            <p className="text-xs font-medium text-muted-foreground">Moneda base</p>
            <p className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
              <Coins className="size-4 text-muted-foreground" />
              {trip.baseCurrency}
              {CURRENCY_NAMES[trip.baseCurrency] && (
                <span className="font-normal text-muted-foreground">
                  · {CURRENCY_NAMES[trip.baseCurrency]}
                </span>
              )}
            </p>
          </div>
          <div className="space-y-1 px-5 py-4">
            <p className="text-xs font-medium text-muted-foreground">Integrantes</p>
            <p className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
              <Users className="size-4 text-muted-foreground" />
              {participantCount} {participantCount === 1 ? 'persona' : 'personas'}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList variant="line" className="w-full justify-start gap-4 border-b">
          <TabsTrigger value="participants">
            <Users className="size-4" />
            Integrantes
            <TabCount active={activeTab === 'participants'}>{participantCount}</TabCount>
          </TabsTrigger>
          <TabsTrigger value="expenses">
            <Receipt className="size-4" />
            Gastos
            <TabCount active={activeTab === 'expenses'}>{expenseCount}</TabCount>
          </TabsTrigger>
          <TabsTrigger value="payments">
            <CreditCard className="size-4" />
            Pagos
          </TabsTrigger>
          <TabsTrigger value="balances">
            <Scale className="size-4" />
            Balances
          </TabsTrigger>
        </TabsList>

        <TabsContent value="participants" className="mt-4">
          {currentUser ? (
            <ParticipantsList tripId={id} currentUserId={currentUser.id} />
          ) : (
            <Card>
              <CardContent className="flex items-center gap-2 py-6 text-sm text-muted-foreground">
                <Users className="size-4" />
                Cargando integrantes...
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="expenses" className="mt-4">
          <Card>
            <CardHeader className="flex-row items-start justify-between gap-2">
              <div className="space-y-0.5">
                <CardTitle className="text-base font-semibold">Gastos del viaje</CardTitle>
                <p className="text-xs text-muted-foreground">
                  {expenseCount} {expenseCount === 1 ? 'gasto registrado' : 'gastos registrados'}
                </p>
              </div>
              {!isSupervisor && (
                <Button size="sm" onClick={() => setExpenseFormOpen(true)}>
                  <Plus className="size-4" />
                  Nuevo gasto
                </Button>
              )}
            </CardHeader>
            <CardContent className="p-0">
              <ExpenseList
                tripId={id}
                participations={trip.participations ?? []}
                currentUserId={currentUserId}
                isSupervisor={isSupervisor}
                isCreator={isCreator}
                baseCurrency={trip.baseCurrency}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments" className="mt-4">
          <Card>
            <CardHeader className="flex-row items-start justify-between gap-2">
              <div className="space-y-0.5">
                <CardTitle className="text-base font-semibold">Pagos</CardTitle>
                <p className="text-xs text-muted-foreground">
                  Transferencias entre integrantes para saldar deudas.
                </p>
              </div>
              {!isSupervisor && (
                <Button size="sm" onClick={() => setPaymentFormOpen(true)}>
                  <Plus className="size-4" />
                  Registrar pago
                </Button>
              )}
            </CardHeader>
            <CardContent className="p-0">
              <PaymentList
                tripId={id}
                currentUserId={currentUserId}
                isSupervisor={isSupervisor}
                isCreator={isCreator}
                baseCurrency={trip.baseCurrency}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="balances" className="mt-4">
          <div className="space-y-6">
            <Card>
              <CardHeader className="space-y-0.5">
                <CardTitle className="text-base font-semibold">Saldos por integrante</CardTitle>
                <p className="text-xs text-muted-foreground">
                  Cuánto le deben o cuánto debe cada uno al cierre actual.
                </p>
              </CardHeader>
              <CardContent>
                <BalanceSummary tripId={id} baseCurrency={trip.baseCurrency} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="space-y-0.5">
                <CardTitle className="text-base font-semibold">Liquidación sugerida</CardTitle>
                <p className="text-xs text-muted-foreground">
                  La forma más simple de saldar todas las deudas con la menor cantidad de pagos.
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

      <TripFormDialog open={editOpen} onOpenChange={setEditOpen} trip={trip} />

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

function TabCount({ active, children }: { active: boolean; children: React.ReactNode }) {
  return (
    <Badge
      variant="secondary"
      className={
        active ? 'bg-primary/10 text-primary border-transparent' : 'text-muted-foreground'
      }
    >
      {children}
    </Badge>
  );
}
