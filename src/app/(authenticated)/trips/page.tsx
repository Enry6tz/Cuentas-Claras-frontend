'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { MapPin, Plus, Users, Receipt } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TripFormDialog } from '@/components/trips/trip-form-dialog';
import { listTrips } from '@/lib/api/trips';

/**
 * Pagina /trips — listar mis viajes.
 *
 * Marcada como Client Component (`'use client'`) porque usa hooks de TanStack
 * Query (`useQuery`) y estado local (`useState`) para abrir el modal.
 * En App Router de Next.js, los componentes son Server Components por default;
 * cuando necesitas interactividad (state, effects, hooks de cliente) tenes
 * que opt-in con la directiva.
 */
export default function TripsPage() {
  const [createOpen, setCreateOpen] = useState(false);

  /**
   * useQuery se encarga de:
   *   - Llamar a `listTrips()` cuando el componente monta.
   *   - Cachear el resultado bajo la queryKey ['trips'].
   *   - Refetchear automaticamente cuando otra parte invalida ese cache
   *     (en nuestro caso, el TripFormDialog hace `invalidateQueries(['trips'])`
   *     al crear/editar).
   *   - Darnos `isLoading`, `isError`, `data` para renderizar.
   */
  const { data: trips, isLoading, isError } = useQuery({
    queryKey: ['trips'],
    queryFn: listTrips,
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Viajes</h1>
          <p className="text-sm text-muted-foreground">
            Tus viajes activos y finalizados.
          </p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="h-4 w-4" />
          Nuevo viaje
        </Button>
      </div>

      {/* Estados condicionales: loading -> error -> vacio -> grid de cards */}
      {isLoading && (
        <Card>
          <CardContent className="flex items-center justify-center py-16">
            <p className="text-sm text-muted-foreground">Cargando viajes...</p>
          </CardContent>
        </Card>
      )}

      {isError && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <p className="text-sm text-destructive">
              Error al cargar viajes. Reintenta en unos segundos.
            </p>
          </CardContent>
        </Card>
      )}

      {!isLoading && !isError && trips?.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="rounded-full bg-primary/10 p-4">
              <MapPin className="h-8 w-8 text-primary" />
            </div>
            <h3 className="mt-5 text-lg font-semibold text-foreground">
              Sin viajes aun
            </h3>
            <p className="mt-2 max-w-sm text-center text-sm text-muted-foreground">
              Crea tu primer viaje para empezar a registrar gastos compartidos
              con amigos.
            </p>
            <Button className="mt-6" onClick={() => setCreateOpen(true)}>
              <Plus className="h-4 w-4" />
              Crear viaje
            </Button>
          </CardContent>
        </Card>
      )}

      {!isLoading && !isError && trips && trips.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {trips.map((trip) => (
            // Cada card es clickeable y navega al detalle del trip.
            <Link key={trip.id} href={`/trips/${trip.id}`}>
              <Card className="cursor-pointer transition-colors hover:bg-muted/50">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between">
                    <h3 className="font-semibold text-foreground line-clamp-1">
                      {trip.name}
                    </h3>
                    <Badge
                      variant={trip.status === 'ACTIVE' ? 'default' : 'secondary'}
                    >
                      {trip.status === 'ACTIVE' ? 'Activo' : 'Finalizado'}
                    </Badge>
                  </div>
                  {trip.description && (
                    <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                      {trip.description}
                    </p>
                  )}
                  <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Users className="h-3.5 w-3.5" />
                      {trip._count?.participations ?? 0}
                    </div>
                    <div className="flex items-center gap-1">
                      <Receipt className="h-3.5 w-3.5" />
                      {trip._count?.expenses ?? 0}
                    </div>
                    <div className="ml-auto font-medium">
                      {trip.baseCurrency}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}

      {/* Dialog de creacion (controlado por estado local) */}
      <TripFormDialog open={createOpen} onOpenChange={setCreateOpen} />
    </div>
  );
}
