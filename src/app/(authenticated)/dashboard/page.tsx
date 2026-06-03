'use client';

import { useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { useQuery } from '@tanstack/react-query';
import {
  MapPin,
  Receipt,
  CreditCard,
  Plus,
  Activity,
  DollarSign,
} from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TripFormDialog } from '@/components/trips/trip-form-dialog';
import { getDashboard } from '@/lib/api/dashboard';

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
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          {getGreeting()},{' '}
          <span className="font-semibold text-foreground">
            {user?.firstName ?? 'viajero'}
          </span>
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
          <CardContent>
            <p className="text-3xl font-bold text-foreground">
              {statsLoading ? '—' : (stats?.activeTrips ?? 0)}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
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
              Total de gastos
            </CardTitle>
            <div className="rounded-lg bg-success/10 p-2">
              <Receipt className="h-4 w-4 text-success" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-foreground">—</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Disponible cuando haya gastos
            </p>
          </CardContent>
        </Card>

        <Card className="overflow-hidden">
          <div className="h-1 bg-chart-2" />
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Tu balance
            </CardTitle>
            <div className="rounded-lg bg-chart-2/10 p-2">
              <CreditCard className="h-4 w-4 text-chart-2" />
            </div>
          </CardHeader>
          <CardContent>
            <p className={`text-3xl font-bold ${balanceColor}`}>
              {statsLoading ? '—' : totalBalance === 0 ? '$0' : `${totalBalance > 0 ? '+' : ''}${totalBalance.toFixed(2)}`}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">{balanceLabel}</p>
          </CardContent>
        </Card>
      </div>

      {/* Bottom grid */}
      <div className="grid gap-4 lg:grid-cols-5">
        {/* CTA o lista de viajes */}
        <Card className="lg:col-span-3">
          {stats?.totalTrips === 0 || (!statsLoading && stats == null) ? (
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="rounded-full bg-primary/10 p-4">
                <MapPin className="h-8 w-8 text-primary" />
              </div>
              <h3 className="mt-5 text-lg font-semibold text-foreground">
                Comenzá tu primer viaje
              </h3>
              <p className="mt-2 max-w-sm text-center text-sm text-muted-foreground">
                Creá un viaje para registrar gastos, dividir costos y saldar deudas con
                tus compañeros.
              </p>
              <Button className="mt-6" onClick={() => setNewTripOpen(true)}>
                <Plus className="h-4 w-4" />
                Crear viaje
              </Button>
            </CardContent>
          ) : (
            <CardContent className="flex flex-col items-center justify-center py-16">
              <p className="text-sm text-muted-foreground">
                Tenés {stats?.activeTrips ?? 0} viaje{stats?.activeTrips !== 1 ? 's' : ''} activo{stats?.activeTrips !== 1 ? 's' : ''}.
              </p>
              <Link href="/trips" className="mt-4">
                <Button variant="outline">
                  <MapPin className="h-4 w-4" />
                  Ver mis viajes
                </Button>
              </Link>
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
                className="flex items-center gap-3 rounded-lg p-3 text-left transition-colors hover:bg-muted"
              >
                <div className="rounded-lg bg-primary/10 p-2">
                  <Plus className="h-4 w-4 text-primary" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground">Nuevo viaje</p>
                  <p className="truncate text-xs text-muted-foreground">Planea una aventura</p>
                </div>
              </button>

              <Link
                href="/trips"
                className="flex items-center gap-3 rounded-lg p-3 text-left transition-colors hover:bg-muted"
              >
                <div className="rounded-lg bg-success/10 p-2">
                  <MapPin className="h-4 w-4 text-success" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground">Mis viajes</p>
                  <p className="truncate text-xs text-muted-foreground">Ver todos</p>
                </div>
              </Link>
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
                        <div className="shrink-0 rounded-lg bg-primary/10 p-1.5">
                          <DollarSign className="h-3.5 w-3.5 text-primary" />
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-foreground">
                            {item.description ?? 'Gasto'}
                          </p>
                          <Link href={`/trips/${item.tripId}`} className="truncate text-xs text-muted-foreground hover:underline">
                            {item.tripName}
                          </Link>
                        </div>
                      </div>
                      <span className="ml-3 shrink-0 text-xs font-medium text-foreground">
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
