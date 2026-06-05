'use client';

import { useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { useQuery } from '@tanstack/react-query';
import {
  Activity,
  BarChart3,
  Clock,
  CreditCard,
  DollarSign,
  MapPin,
  Plus,
  PlusCircle,
  Receipt,
  TrendingUp,
  UserPlus,
  Users,
} from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardAction } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TripFormDialog } from '@/components/trips/trip-form-dialog';
import { getDashboard } from '@/lib/api/dashboard';
import { listTrips } from '@/lib/api/trips';

function timeAgo(date: string) {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'justo ahora';
  if (mins < 60) return `hace ${mins} min`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `hace ${hrs}h`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `hace ${days}d`;
  return `hace ${Math.floor(days / 30)}mes`;
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Buenos días';
  if (h < 18) return 'Buenas tardes';
  return 'Buenas noches';
}

export default function DashboardPage() {
  const { user } = useUser();
  const [newTripOpen, setNewTripOpen] = useState(false);

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: getDashboard,
    staleTime: 60_000,
  });

  const { data: trips } = useQuery({
    queryKey: ['trips'],
    queryFn: listTrips,
  });

  const activeTrips = trips?.filter((t) => t.status === 'ACTIVE') ?? [];
  const finalizedTrips = trips?.filter((t) => t.status === 'FINALIZED') ?? [];

  const totalBalance = parseFloat(stats?.balanceTotal ?? '0');
  const balanceColor =
    totalBalance > 0 ? 'text-success' : totalBalance < 0 ? 'text-destructive' : 'text-foreground';
  const balanceLabel =
    totalBalance === 0
      ? 'Todo saldado'
      : totalBalance > 0
        ? 'Te deben'
        : 'Debés';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Hola, {user?.firstName ?? 'viajero'}
          </h1>
          <p className="text-sm text-muted-foreground">{getGreeting()}</p>
        </div>
        <Button onClick={() => setNewTripOpen(true)} className="gap-1.5">
          <PlusCircle className="h-4 w-4" />
          Crear viaje
        </Button>
      </div>

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="overflow-hidden">
          <div className="h-1 bg-primary" />
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Viajes activos
            </CardTitle>
            <div className="rounded-lg bg-primary/10 p-2">
              <MapPin className="h-4 w-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent className="space-y-1">
            <p className="text-3xl font-bold tabular-nums">
              {statsLoading ? '—' : (stats?.activeTrips ?? 0)}
            </p>
            <p className="text-xs text-muted-foreground">
              {stats?.totalTrips != null
                ? `${stats.totalTrips} en total`
                : 'Sin viajes aún'}
            </p>
          </CardContent>
        </Card>

        <Card className="overflow-hidden">
          <div className="h-1 bg-success" />
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Balance total
            </CardTitle>
            <div className="rounded-lg bg-success/10 p-2">
              <TrendingUp className="h-4 w-4 text-success" />
            </div>
          </CardHeader>
          <CardContent className="space-y-1">
            <p className={`text-3xl font-bold tabular-nums ${balanceColor}`}>
              {statsLoading ? '—' : totalBalance === 0 ? '$0' : `${totalBalance > 0 ? '+' : ''}${totalBalance.toFixed(2)}`}
            </p>
            <p className="text-xs text-muted-foreground">{balanceLabel}</p>
          </CardContent>
        </Card>

        <Card className="overflow-hidden">
          <div className="h-1 bg-success" />
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total gastado
            </CardTitle>
            <div className="rounded-lg bg-success/10 p-2">
              <Receipt className="h-4 w-4 text-success" />
            </div>
          </CardHeader>
          <CardContent className="space-y-1">
            <p className="text-3xl font-bold tabular-nums text-foreground">—</p>
            <p className="text-xs text-muted-foreground">
              Disponible cuando haya gastos
            </p>
          </CardContent>
        </Card>

        <Card className="overflow-hidden">
          <div className="h-1 bg-warning" />
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pagos pendientes
            </CardTitle>
            <div className="rounded-lg bg-warning/10 p-2">
              <CreditCard className="h-4 w-4 text-warning" />
            </div>
          </CardHeader>
          <CardContent className="space-y-1">
            <p className="text-3xl font-bold tabular-nums text-foreground">—</p>
            <p className="text-xs text-muted-foreground">Pendientes</p>
          </CardContent>
        </Card>
      </div>

      {/* Mis viajes + acciones + actividad */}
      <div className="grid gap-4 lg:grid-cols-5">
        {/* Mis viajes */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="text-base font-semibold">Mis viajes</CardTitle>
            <CardAction>
              <Link href="/trips">
                <Button variant="ghost" size="sm" className="gap-1 text-muted-foreground">
                  Ver todos <span aria-hidden="true">›</span>
                </Button>
              </Link>
            </CardAction>
          </CardHeader>
          {!trips || trips.length === 0 ? (
            <CardContent className="flex flex-col items-center justify-center py-12">
              <div className="rounded-full bg-muted p-4">
                <MapPin className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="mt-5 text-lg font-semibold text-foreground">
                Comenzá tu primer viaje
              </h3>
              <p className="mt-2 max-w-sm text-center text-sm text-muted-foreground">
                Creá un viaje para registrar gastos, dividir costos y saldar deudas con
                tus compañeros.
              </p>
              <Button className="mt-6" onClick={() => setNewTripOpen(true)}>
                <PlusCircle className="h-4 w-4" />
                Crear viaje
              </Button>
            </CardContent>
          ) : (
            <CardContent className="space-y-4">
              {activeTrips.length > 0 && (
                <div>
                  <p className="mb-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    En curso · {activeTrips.length}
                  </p>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {activeTrips.map((trip) => (
                      <Link
                        key={trip.id}
                        href={`/trips/${trip.id}`}
                        className="block rounded-lg border p-4 transition-colors hover:bg-muted/50"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm font-medium text-foreground truncate">{trip.name}</p>
                          <Badge variant="secondary" className="shrink-0 gap-1 bg-success/10 text-success border-transparent">
                            <span className="size-1.5 rounded-full bg-success" />
                            En curso
                          </Badge>
                        </div>
                        <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Users className="h-3.5 w-3.5" />
                            {trip._count?.participations ?? trip.participations?.length ?? 0}
                          </span>
                          <span>{trip.baseCurrency}</span>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
              {finalizedTrips.length > 0 && (
                <div>
                  <p className="mb-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Finalizados · {finalizedTrips.length}
                  </p>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {finalizedTrips.map((trip) => (
                      <Link
                        key={trip.id}
                        href={`/trips/${trip.id}`}
                        className="block rounded-lg border p-4 transition-colors hover:bg-muted/50"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm font-medium text-foreground truncate">{trip.name}</p>
                          <Badge variant="secondary" className="shrink-0 gap-1 text-muted-foreground">
                            <span className="size-1.5 rounded-full bg-muted-foreground" />
                            Finalizado
                          </Badge>
                        </div>
                        <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Users className="h-3.5 w-3.5" />
                            {trip._count?.participations ?? trip.participations?.length ?? 0}
                          </span>
                          <span>{trip.baseCurrency}</span>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          )}
        </Card>

        {/* Acciones rápidas + actividad */}
        <div className="flex flex-col gap-4 lg:col-span-2">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">Acciones rápidas</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setNewTripOpen(true)}
                className="flex flex-col items-center gap-2 rounded-lg p-3 text-center transition-colors hover:bg-muted"
              >
                <div className="rounded-lg bg-primary/10 p-2">
                  <Plus className="h-4 w-4 text-primary" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground">Nuevo viaje</p>
                  <p className="truncate text-xs text-muted-foreground">Crear un viaje</p>
                </div>
              </button>

              <Link
                href="/trips"
                className="flex flex-col items-center gap-2 rounded-lg p-3 text-center transition-colors hover:bg-muted"
              >
                <div className="rounded-lg bg-success/10 p-2">
                  <MapPin className="h-4 w-4 text-success" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground">Mis viajes</p>
                  <p className="truncate text-xs text-muted-foreground">Ver todos</p>
                </div>
              </Link>

              <button
                className="flex flex-col items-center gap-2 rounded-lg p-3 text-center opacity-50 transition-colors cursor-not-allowed"
                disabled
              >
                <div className="rounded-lg bg-warning/10 p-2">
                  <UserPlus className="h-4 w-4 text-warning" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground">Invitar</p>
                  <p className="truncate text-xs text-muted-foreground">Próximamente</p>
                </div>
              </button>

              <button
                className="flex flex-col items-center gap-2 rounded-lg p-3 text-center opacity-50 transition-colors cursor-not-allowed"
                disabled
              >
                <div className="rounded-lg bg-chart-2/10 p-2">
                  <BarChart3 className="h-4 w-4 text-chart-2" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground">Balances</p>
                  <p className="truncate text-xs text-muted-foreground">Próximamente</p>
                </div>
              </button>
            </CardContent>
          </Card>

          <Card className="flex-1">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-base font-semibold">Actividad reciente</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
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
                    <Activity className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <p className="mt-3 text-sm font-medium text-foreground">Sin actividad aún</p>
                  <p className="mt-1 text-center text-xs text-muted-foreground">
                    Tus gastos y pagos recientes aparecerán aquí
                  </p>
                </div>
              ) : (
                <ul className="divide-y">
                  {stats.recentActivity.map((item, i) => (
                    <li key={i} className="flex items-center justify-between py-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="shrink-0 rounded-lg bg-muted p-2">
                          <DollarSign className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-foreground">
                            {item.description ?? 'Gasto'}
                          </p>
                          <p className="truncate text-xs text-muted-foreground">
                            {item.tripName} · <Clock className="inline h-3 w-3" /> {timeAgo(item.date)}
                          </p>
                        </div>
                      </div>
                      <span className="ml-3 shrink-0 text-xs font-medium tabular-nums text-foreground">
                        {item.amount}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <TripFormDialog open={newTripOpen} onOpenChange={setNewTripOpen} />
    </div>
  );
}
