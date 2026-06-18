'use client';

import { useState, use } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Calendar,
  Coins,
  Users,
  Receipt,
  CreditCard,
  Scale,
  Pencil,
  Trash2,
  Plus,
  CheckCircle2,
} from 'lucide-react';
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
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
import { StaggerList, StaggerItem } from '@/components/motion/stagger';
import { TripFormDialog } from '@/components/trips/trip-form-dialog';
import { ParticipantsList } from '@/components/trips/participants-list';
import { ExpenseList } from '@/components/expenses/expense-list';
import { ExpenseFormDialog } from '@/components/expenses/expense-form-dialog';
import { PaymentList } from '@/components/payments/payment-list';
import { PaymentFormDialog } from '@/components/payments/payment-form-dialog';
import { BalanceSummary } from '@/components/balances/balance-summary';
import { SettlementSuggestions } from '@/components/balances/settlement-suggestions';
import { useTrip } from '@/hooks/querys/trips/useTrip';
import { useTripMutations } from '@/hooks/querys/trips/useTripMutations';
import { useMe } from '@/hooks/querys/users/useMe';
import { tripBannerStyle, tripIcon } from '@/lib/trip-appearance';

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

  // Intención de navegación desde las páginas de Gastos/Pagos:
  //   ?tab=expenses|payments → abre esa pestaña
  //   ?nuevo=gasto|pago      → abre directamente el formulario de creación
  const searchParams = useSearchParams();
  const nuevo = searchParams.get('nuevo');
  const tabParam = searchParams.get('tab');

  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [finalizeOpen, setFinalizeOpen] = useState(false);
  const [expenseFormOpen, setExpenseFormOpen] = useState(nuevo === 'gasto');
  const [paymentFormOpen, setPaymentFormOpen] = useState(nuevo === 'pago');
  const [activeTab, setActiveTab] = useState(
    nuevo === 'gasto'
      ? 'expenses'
      : nuevo === 'pago'
        ? 'payments'
        : (tabParam ?? 'participants'),
  );
  const { data: trip, isLoading, isError } = useTrip(id);

  const { data: currentUser } = useMe();

  const { remove, finalize } = useTripMutations();

  const currentUserId = currentUser?.id ?? '';

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
      {/* Cover: color del viaje con la info encima. Un scrim oscuro garantiza
          que el texto blanco se lea sobre cualquiera de los 30 colores. */}
      <div
        className="relative overflow-hidden rounded-xl"
        style={tripBannerStyle(trip.colorId)}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/15 to-transparent" />

        {isCreator && (
          <div className="absolute right-3 top-3 z-20 flex gap-2">
            {trip.status === 'ACTIVE' && (!trip.endDate || new Date(trip.endDate) > new Date()) && (
              <Button
                size="sm"
                onClick={() => setFinalizeOpen(true)}
                className="border-0 bg-white/15 text-white backdrop-blur hover:bg-emerald-500/70"
              >
                <CheckCircle2 className="size-4" />
                Finalizar
              </Button>
            )}
            <Button
              size="sm"
              onClick={() => setEditOpen(true)}
              className="border-0 bg-white/15 text-white backdrop-blur hover:bg-white/25"
            >
              <Pencil className="size-4" />
              Editar
            </Button>
            <Button
              size="sm"
              onClick={() => setDeleteOpen(true)}
              className="border-0 bg-white/15 text-white backdrop-blur hover:bg-red-500/70"
            >
              <Trash2 className="size-4" />
              Eliminar
            </Button>
          </div>
        )}

        <StaggerList className="relative z-10 flex min-h-56 flex-col justify-end gap-4 p-5 sm:p-7">
          <StaggerItem>
            <div className="flex items-center gap-3">
              <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-white/90 text-3xl shadow-md">
                {tripIcon(trip.iconId)}
              </span>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2.5">
                  <h1 className="text-2xl font-bold text-white drop-shadow-sm sm:text-3xl">
                    {trip.name}
                  </h1>
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                      trip.status === 'ACTIVE'
                        ? 'bg-emerald-500 text-white'
                        : 'bg-zinc-600/90 text-white'
                    }`}
                  >
                    <span className="size-1.5 rounded-full bg-white" />
                    {trip.status === 'ACTIVE' ? 'En curso' : 'Finalizado'}
                  </span>
                </div>
                {trip.description && (
                  <p className="mt-1 text-sm text-white/85 drop-shadow-sm">
                    {trip.description}
                  </p>
                )}
              </div>
            </div>
          </StaggerItem>

          <StaggerItem>
            <div className="flex flex-wrap items-center gap-x-8 gap-y-3">
              <CoverInfo
                icon={<Calendar className="size-4" />}
                label="Fechas"
                value={`${formatDate(trip.startDate)} – ${formatDate(trip.endDate)}`}
              />
              <CoverInfo
                icon={<Coins className="size-4" />}
                label="Moneda base"
                value={
                  trip.baseCurrency +
                  (CURRENCY_NAMES[trip.baseCurrency]
                    ? ` · ${CURRENCY_NAMES[trip.baseCurrency]}`
                    : '')
                }
              />
              <CoverInfo
                icon={<Users className="size-4" />}
                label="Integrantes"
                value={`${participantCount} ${participantCount === 1 ? 'persona' : 'personas'}`}
              />
            </div>
          </StaggerItem>
        </StaggerList>
      </div>

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
            <CardHeader>
              <div className="space-y-0.5">
                <CardTitle className="text-base font-semibold">Gastos del viaje</CardTitle>
                <p className="text-xs text-muted-foreground">
                  {expenseCount} {expenseCount === 1 ? 'gasto registrado' : 'gastos registrados'}
                </p>
              </div>
              {!isSupervisor && trip.status === 'ACTIVE' && (
                <CardAction>
                  <Button size="sm" onClick={() => setExpenseFormOpen(true)}>
                    <Plus className="size-4" />
                    Nuevo gasto
                  </Button>
                </CardAction>
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
            <CardHeader>
              <div className="space-y-0.5">
                <CardTitle className="text-base font-semibold">Pagos</CardTitle>
                <p className="text-xs text-muted-foreground">
                  Transferencias entre integrantes para saldar deudas.
                </p>
              </div>
              {!isSupervisor && (
                <CardAction>
                  <Button size="sm" onClick={() => setPaymentFormOpen(true)}>
                    <Plus className="size-4" />
                    Registrar pago
                  </Button>
                </CardAction>
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

      <Dialog open={finalizeOpen} onOpenChange={setFinalizeOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Finalizar viaje</DialogTitle>
            <DialogDescription>
              Estás por finalizar el viaje <strong>{trip.name}</strong> antes de su fecha de finalización.
              Todos los balances deben estar en <strong>0</strong> (saldados) para poder hacerlo.
              Una vez finalizado no se podrán agregar más gastos, y solo se permitirán pagos
              para saldar deudas pendientes.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setFinalizeOpen(false)}
              disabled={finalize.isPending}
            >
              Cancelar
            </Button>
            <Button
              onClick={() =>
                finalize.mutate(id, {
                  onSuccess: () => {
                    setFinalizeOpen(false);
                  },
                })
              }
              disabled={finalize.isPending}
            >
              {finalize.isPending ? 'Finalizando...' : 'Finalizar viaje'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
              disabled={remove.isPending}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={() =>
                remove.mutate(id, { onSuccess: () => router.push('/trips') })
              }
              disabled={remove.isPending}
            >
              {remove.isPending ? 'Eliminando...' : 'Eliminar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function CoverInfo({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-2 text-white">
      <span className="text-white/80">{icon}</span>
      <div className="leading-tight">
        <p className="text-[11px] uppercase tracking-wide text-white/70">{label}</p>
        <p className="text-sm font-semibold sm:text-base">{value}</p>
      </div>
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
