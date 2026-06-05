'use client';

import { useMemo, useState } from 'react';
import { Plane, Plus } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SearchBar } from '@/components/shared/search-bar';
import { StaggerList, StaggerItem } from '@/components/motion/stagger';
import { TripFormDialog } from '@/components/trips/trip-form-dialog';
import { TripRow } from '@/components/trips/trip-row';
import { useTrips } from '@/hooks/querys/trips/useTrips';
import { useMe } from '@/hooks/querys/users/useMe';

type StatusFilter = 'all' | 'active' | 'finalized';

export default function TripsPage() {
  const [createOpen, setCreateOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<StatusFilter>('all');

  const { data: trips, isLoading, isError } = useTrips();
  const { data: me } = useMe();

  const filtered = useMemo(() => {
    const list = trips ?? [];
    const q = query.trim().toLowerCase();
    return list.filter((t) => {
      const matchesStatus =
        status === 'all' ||
        (status === 'active' && t.status === 'ACTIVE') ||
        (status === 'finalized' && t.status === 'FINALIZED');
      const matchesQuery = !q || t.name.toLowerCase().includes(q);
      return matchesStatus && matchesQuery;
    });
  }, [trips, query, status]);

  return (
    <div className="space-y-5">
      {/* Barra de herramientas: buscador + acción principal */}
      <Card className="py-3">
        <CardContent className="flex items-center gap-3 px-3">
          <SearchBar
            value={query}
            onChange={setQuery}
            placeholder="Buscar viaje por nombre…"
          />
          <Button className="h-11 shrink-0" onClick={() => setCreateOpen(true)}>
            <Plus className="size-4" />
            <span className="hidden sm:inline">Nuevo viaje</span>
          </Button>
        </CardContent>
      </Card>

      {/* Filtro por estado */}
      <Tabs value={status} onValueChange={(v) => v && setStatus(v as StatusFilter)}>
        <TabsList>
          <TabsTrigger value="all">Todos</TabsTrigger>
          <TabsTrigger value="active">Activos</TabsTrigger>
          <TabsTrigger value="finalized">Finalizados</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Lista */}
      {isLoading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-[68px] animate-pulse rounded-xl border bg-muted/40" />
          ))}
        </div>
      )}

      {isError && (
        <Card>
          <CardContent className="py-12 text-center text-sm text-destructive">
            Error al cargar viajes. Reintentá en unos segundos.
          </CardContent>
        </Card>
      )}

      {!isLoading && !isError && filtered.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="rounded-full bg-muted p-4">
              <Plane className="size-8 text-muted-foreground" />
            </div>
            <h3 className="mt-5 text-lg font-semibold text-foreground">
              {query || status !== 'all'
                ? 'Sin resultados'
                : 'Comenzá tu primer viaje'}
            </h3>
            <p className="mt-2 max-w-sm text-center text-sm text-muted-foreground">
              {query || status !== 'all'
                ? 'Probá con otro nombre o cambiá el filtro.'
                : 'Creá un grupo, sumá integrantes y empezá a registrar gastos compartidos.'}
            </p>
            {!query && status === 'all' && (
              <Button className="mt-6" onClick={() => setCreateOpen(true)}>
                <Plus className="size-4" />
                Crear viaje
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {!isLoading && !isError && filtered.length > 0 && (
        <StaggerList className="space-y-3">
          {filtered.map((trip) => (
            <StaggerItem key={trip.id}>
              <TripRow trip={trip} currentUserId={me?.id} />
            </StaggerItem>
          ))}
        </StaggerList>
      )}

      <TripFormDialog open={createOpen} onOpenChange={setCreateOpen} />
    </div>
  );
}
