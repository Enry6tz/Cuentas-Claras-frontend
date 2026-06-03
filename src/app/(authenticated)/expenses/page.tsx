'use client';

import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Receipt, ArrowRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { listTrips } from '@/lib/api/trips';
import Link from 'next/link';

export default function ExpensesPage() {
  const router = useRouter();
  const { data: trips } = useQuery({
    queryKey: ['trips'],
    queryFn: listTrips,
  });

  const activeTrips = (trips ?? []).filter((t) => t.status === 'ACTIVE');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Gastos</h1>
      </div>

      {activeTrips.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {activeTrips.map((trip) => (
            <Link key={trip.id} href={`/trips/${trip.id}`}>
              <Card className="cursor-pointer transition-colors hover:bg-muted/50">
                <CardContent className="flex items-center justify-between py-4">
                  <div>
                    <p className="font-medium">{trip.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {trip._count?.expenses ?? 0} gastos
                    </p>
                  </div>
                  <ArrowRight className="h-5 w-5 text-muted-foreground" />
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="rounded-full bg-success/10 p-4">
              <Receipt className="h-8 w-8 text-success" />
            </div>
            <h3 className="mt-5 text-lg font-semibold text-foreground">
              Sin gastos aún
            </h3>
            <p className="mt-2 max-w-sm text-center text-sm text-muted-foreground">
              Seleccioná un viaje para ver sus gastos, o creá uno nuevo.
            </p>
            <Button className="mt-4" onClick={() => router.push('/trips')}>
              Ir a viajes
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
