'use client';

import { useState } from 'react';
import { useUser } from '@clerk/nextjs';
import {
  Plane,
  Wallet,
  Receipt,
  CreditCard,
  PlusCircle,
  Users,
  ChevronRight,
  Activity,
  DollarSign,
  UserRound,
} from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TripStatusBadge } from '@/components/shared/ui-bits';
import { TripFormDialog } from '@/components/trips/trip-form-dialog';
import { StaggerList, StaggerItem } from '@/components/motion/stagger';
import { ActivityChartDrawer } from '@/components/dashboard/activity-chart-drawer';
import { useDashboard } from '@/hooks/querys/dashboard/useDashboard';
import { ACTIVITY_COLORS, balanceColor } from '@/hooks/use-activity-summary';
import { useTrips } from '@/hooks/querys/trips/useTrips';

export default function DashboardPage() {
  const { user } = useUser();
  const [newTripOpen, setNewTripOpen] = useState(false);
  const [chartOpen, setChartOpen] = useState(false);

  const { data: stats, isLoading: statsLoading } = useDashboard();

  // Reusa el mismo cache que /trips para poblar "Mis viajes" (solo lectura).
  const { data: trips } = useTrips();

  const fmtSigned = (n: number) =>
    `${n < 0 ? '−' : '+'}${Math.abs(n).toLocaleString('es-AR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  const backendBalanceTotal = stats ? parseFloat(stats.balanceTotal) : 0;
  const backendTotalGastado = stats ? parseFloat(stats.totalGastado) : 0;
  const backendTotalEnPagos = stats ? parseFloat(stats.totalEnPagos) : 0;

  const hasTrips = !statsLoading && (stats?.totalTrips ?? 0) > 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Hola, {user?.firstName ?? 'viajero'}
          </h1>
          <p className="text-sm text-muted-foreground">
            Esto es lo que viene pasando en tus viajes.
          </p>
        </div>
        <Button onClick={() => setNewTripOpen(true)}>
          <PlusCircle className="size-4" />
          Crear viaje
        </Button>
      </div>

      {/* Stat cards */}
      <StaggerList className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StaggerItem>
          <Card
            className="cursor-pointer overflow-hidden transition-colors hover:bg-muted/40"
            onClick={() => setChartOpen(true)}
          >
            <div className="h-1 bg-primary" />
            <CardHeader className="flex-row items-start justify-between gap-2 pb-1">
              <p className="text-xs leading-tight text-muted-foreground">Viajes activos</p>
              <div className="rounded-lg bg-primary/10 p-2 text-primary">
                <Plane className="size-4" />
              </div>
            </CardHeader>
            <CardContent className="space-y-1">
              <p className="text-3xl font-bold tabular-nums">
                {statsLoading ? '—' : (stats?.activeTrips ?? 0)}
              </p>
              <p className="text-xs text-muted-foreground">
                {stats?.totalTrips != null ? `${stats.totalTrips} en total` : 'Sin viajes aún'}
              </p>
            </CardContent>
          </Card>
        </StaggerItem>

        <StaggerItem>
          <Card
            className="cursor-pointer overflow-hidden transition-colors hover:bg-muted/40"
            onClick={() => setChartOpen(true)}
          >
            <div className="h-1 bg-primary" />
            <CardHeader className="flex-row items-start justify-between gap-2 pb-1">
              <p className="text-xs leading-tight text-muted-foreground">Balance total</p>
              <div className="rounded-lg bg-primary/10 p-2 text-primary">
                <Wallet className="size-4" />
              </div>
            </CardHeader>
            <CardContent className="space-y-1">
              <p
                className="text-3xl font-bold tabular-nums"
                style={{ color: balanceColor(backendBalanceTotal) }}
              >
                {statsLoading ? '—' : fmtSigned(backendBalanceTotal)}
              </p>
              <p className="text-xs text-muted-foreground">Balance neto en tus viajes</p>
            </CardContent>
          </Card>
        </StaggerItem>

        <StaggerItem>
          <Card
            className="cursor-pointer overflow-hidden transition-colors hover:bg-muted/40"
            onClick={() => setChartOpen(true)}
          >
            <div className="h-1 bg-destructive" />
            <CardHeader className="flex-row items-start justify-between gap-2 pb-1">
              <p className="text-xs leading-tight text-muted-foreground">Total gastado</p>
              <div className="rounded-lg bg-destructive/10 p-2 text-destructive">
                <Receipt className="size-4" />
              </div>
            </CardHeader>
            <CardContent className="space-y-1">
              <p
                className="text-3xl font-bold tabular-nums"
                style={{ color: ACTIVITY_COLORS.gastos }}
              >
                {statsLoading ? '—' : fmtSigned(-backendTotalGastado)}
              </p>
              <p className="text-xs text-muted-foreground">Pagado de tu bolsillo</p>
            </CardContent>
          </Card>
        </StaggerItem>

        <StaggerItem>
          <Card
            className="cursor-pointer overflow-hidden transition-colors hover:bg-muted/40"
            onClick={() => setChartOpen(true)}
          >
            <div className="h-1" style={{ backgroundColor: ACTIVITY_COLORS.pagos }} />
            <CardHeader className="flex-row items-start justify-between gap-2 pb-1">
              <p className="text-xs leading-tight text-muted-foreground">Recibido de otros</p>
              <div
                className="rounded-lg p-2"
                style={{
                  backgroundColor: 'color-mix(in oklab, var(--color-pagos, oklch(0.62 0.17 152)) 12%, transparent)',
                  color: ACTIVITY_COLORS.pagos,
                }}
              >
                <CreditCard className="size-4" />
              </div>
            </CardHeader>
            <CardContent className="space-y-1">
              <p
                className="text-3xl font-bold tabular-nums"
                style={{ color: ACTIVITY_COLORS.pagos }}
              >
                {statsLoading ? '—' : fmtSigned(backendTotalEnPagos)}
              </p>
              <p className="text-xs text-muted-foreground">Te pagaron para saldar deudas</p>
            </CardContent>
          </Card>
        </StaggerItem>
      </StaggerList>

      {/* Mis viajes */}
      {hasTrips ? (
        <Card>
          <CardHeader className="flex-row items-start justify-between gap-2">
            <div className="space-y-0.5">
              <p className="text-base font-semibold text-foreground">Mis viajes</p>
              <p className="text-xs text-muted-foreground">Tus grupos activos y finalizados.</p>
            </div>
            <Link href="/trips">
              <Button variant="outline" size="sm">
                Ver todos
                <ChevronRight className="size-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {trips && trips.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2">
                {trips.slice(0, 4).map((trip) => (
                  <Link key={trip.id} href={`/trips/${trip.id}`}>
                    <div className="rounded-lg border p-4 transition-colors hover:bg-muted/50">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-semibold text-foreground line-clamp-1">{trip.name}</h3>
                        <TripStatusBadge status={trip.status} />
                      </div>
                      {trip.description ? (
                        <p className="mt-1 text-xs text-muted-foreground line-clamp-1">
                          {trip.description}
                        </p>
                      ) : (
                        <p className="mt-1 text-xs text-muted-foreground">
                          Moneda base · {trip.baseCurrency}
                        </p>
                      )}
                      <div className="mt-4 flex items-center justify-between">
                        <span className="text-xs font-medium text-muted-foreground">
                          {trip.baseCurrency}
                        </span>
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Users className="size-3.5" />
                          {trip._count?.participations ?? 0}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="py-6 text-center text-sm text-muted-foreground">
                Cargando tus viajes…
              </p>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="rounded-full bg-muted p-4">
              <Plane className="size-8 text-muted-foreground" />
            </div>
            <h3 className="mt-5 text-lg font-semibold text-foreground">
              Comenzá tu primer viaje
            </h3>
            <p className="mt-2 max-w-sm text-center text-sm text-muted-foreground">
              Creá un grupo, sumá integrantes y empezá a registrar gastos.
            </p>
            <Button className="mt-6" onClick={() => setNewTripOpen(true)}>
              <PlusCircle className="size-4" />
              Crear viaje
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Actividad reciente */}
      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <p className="text-base font-semibold text-foreground">Actividad reciente</p>
          <Activity className="size-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          {statsLoading ? (
            <ul className="divide-y">
              {[1, 2, 3].map((i) => (
                <li key={i} className="flex animate-pulse items-center justify-between py-3">
                  <div className="h-4 w-40 rounded bg-muted" />
                  <div className="h-4 w-16 rounded bg-muted" />
                </li>
              ))}
            </ul>
          ) : !stats?.recentActivity?.length ? (
            <div className="flex flex-col items-center justify-center py-8">
              <div className="rounded-full bg-muted p-3">
                <Activity className="size-5 text-muted-foreground" />
              </div>
              <p className="mt-3 text-sm font-medium text-foreground">Sin actividad aún</p>
              <p className="mt-1 text-center text-xs text-muted-foreground">
                Tus gastos y pagos recientes aparecerán aquí.
              </p>
            </div>
          ) : (
            <ul className="divide-y">
              {stats.recentActivity.map((item, i) => (
                <li key={i} className="flex items-center justify-between gap-3 py-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="shrink-0 rounded-lg bg-muted p-2 text-muted-foreground">
                      <DollarSign className="size-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-foreground">
                        {item.description ?? 'Gasto'}
                      </p>
                      <Link
                        href={`/trips/${item.tripId}`}
                        className="truncate text-xs text-muted-foreground hover:underline"
                      >
                        {item.tripName}
                      </Link>
                    </div>
                  </div>
                  <span className="ml-3 shrink-0 text-sm font-semibold text-foreground tabular-nums">
                    {item.amount}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {/* Acciones rápidas */}
      <div>
        <h2 className="mb-3 text-sm font-semibold text-foreground">Acciones rápidas</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <QuickAction
            href="/trips"
            icon={<Plane className="size-5" />}
            tint="bg-primary/10 text-primary"
            title="Ver mis viajes"
            subtitle="Lista y detalle"
          />
          <QuickAction
            onClick={() => setNewTripOpen(true)}
            icon={<PlusCircle className="size-5" />}
            tint="bg-primary/10 text-primary"
            title="Crear viaje"
            subtitle="Nuevo grupo"
          />
          <QuickAction
            href="/payments"
            icon={<CreditCard className="size-5" />}
            tint="bg-warning/10 text-warning"
            title="Registrar pago"
            subtitle="Saldar una deuda"
          />
          <QuickAction
            href="/account"
            icon={<UserRound className="size-5" />}
            tint="bg-success/10 text-success"
            title="Mi perfil"
            subtitle="Datos de tu cuenta"
          />
        </div>
      </div>

      <TripFormDialog open={newTripOpen} onOpenChange={setNewTripOpen} />
      <ActivityChartDrawer open={chartOpen} onOpenChange={setChartOpen} />
    </div>
  );
}

function QuickAction({
  href,
  onClick,
  icon,
  tint,
  title,
  subtitle,
}: {
  href?: string;
  onClick?: () => void;
  icon: React.ReactNode;
  tint: string;
  title: string;
  subtitle: string;
}) {
  const inner = (
    <Card className="h-full cursor-pointer transition-colors hover:bg-muted/50">
      <CardContent className="flex items-center gap-3 py-1">
        <div className={`flex size-10 shrink-0 items-center justify-center rounded-full ${tint}`}>
          {icon}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium text-foreground">{title}</p>
          <p className="truncate text-xs text-muted-foreground">{subtitle}</p>
        </div>
      </CardContent>
    </Card>
  );

  if (href) {
    return (
      <Link href={href} className="block">
        {inner}
      </Link>
    );
  }
  return (
    <button type="button" onClick={onClick} className="block w-full text-left">
      {inner}
    </button>
  );
}
