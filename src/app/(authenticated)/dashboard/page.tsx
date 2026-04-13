'use client';

import { useUser } from '@clerk/nextjs';
import {
  MapPin,
  Receipt,
  Users,
  CreditCard,
  Plus,
  Activity,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Buenos días';
  if (h < 18) return 'Buenas tardes';
  return 'Buenas noches';
}

const quickActions = [
  {
    label: 'Nuevo viaje',
    description: 'Planea una aventura',
    icon: MapPin,
    color: 'bg-primary/10 text-primary',
  },
  {
    label: 'Agregar gasto',
    description: 'Registra un costo compartido',
    icon: Receipt,
    color: 'bg-success/10 text-success',
  },
  {
    label: 'Invitar amigos',
    description: 'Agrega compañeros de viaje',
    icon: Users,
    color: 'bg-destructive/10 text-destructive',
  },
  {
    label: 'Saldar deudas',
    description: 'Liquida tus pendientes',
    icon: CreditCard,
    color: 'bg-warning/10 text-warning',
  },
];

export default function DashboardPage() {
  const { user } = useUser();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          {getGreeting()}, <span className="font-semibold text-foreground">{user?.firstName ?? 'viajero'}</span>
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="overflow-hidden">
          <div className="h-1 bg-primary" />
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Viajes activos</CardTitle>
            <div className="rounded-lg bg-primary/10 p-2">
              <MapPin className="h-4 w-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-foreground">0</p>
            <p className="mt-1 text-xs text-muted-foreground">Sin viajes aún</p>
          </CardContent>
        </Card>

        <Card className="overflow-hidden">
          <div className="h-1 bg-success" />
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total de gastos</CardTitle>
            <div className="rounded-lg bg-success/10 p-2">
              <Receipt className="h-4 w-4 text-success" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-foreground">$0</p>
            <p className="mt-1 text-xs text-muted-foreground">Empieza a registrar gastos</p>
          </CardContent>
        </Card>

        <Card className="overflow-hidden">
          <div className="h-1 bg-chart-2" />
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Tu balance</CardTitle>
            <div className="rounded-lg bg-chart-2/10 p-2">
              <CreditCard className="h-4 w-4 text-chart-2" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-foreground">$0</p>
            <p className="mt-1 text-xs text-muted-foreground">Todo saldado</p>
          </CardContent>
        </Card>
      </div>

      {/* Bottom grid */}
      <div className="grid gap-4 lg:grid-cols-5">
        {/* Start your first trip */}
        <Card className="lg:col-span-3">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="rounded-full bg-primary/10 p-4">
              <MapPin className="h-8 w-8 text-primary" />
            </div>
            <h3 className="mt-5 text-lg font-semibold text-foreground">Comienza tu primer viaje</h3>
            <p className="mt-2 max-w-sm text-center text-sm text-muted-foreground">
              Crea un viaje para empezar a registrar gastos, dividir costos y saldar deudas con tus compañeros de viaje.
            </p>
            <Button className="mt-6" size="default">
              <Plus className="h-4 w-4" />
              Crear viaje
            </Button>
          </CardContent>
        </Card>

        {/* Right column */}
        <div className="flex flex-col gap-4 lg:col-span-2">
          {/* Quick Actions */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">Acciones rápidas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                {quickActions.map((action) => {
                  const Icon = action.icon;
                  return (
                    <button
                      key={action.label}
                      className="flex items-center gap-3 rounded-lg p-3 text-left transition-colors hover:bg-muted"
                    >
                      <div className={`rounded-lg p-2 ${action.color}`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground">{action.label}</p>
                        <p className="text-xs text-muted-foreground truncate">{action.description}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="flex-1">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-base font-semibold">Actividad reciente</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center py-8">
              <div className="rounded-full bg-muted p-3">
                <Activity className="h-5 w-5 text-muted-foreground" />
              </div>
              <p className="mt-3 text-sm font-medium text-foreground">Sin actividad aún</p>
              <p className="mt-1 text-center text-xs text-muted-foreground">
                Tus gastos y pagos recientes aparecerán aquí
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
