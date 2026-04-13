'use client';

import { MapPin, Plus } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function TripsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Viajes</h1>
        <Button disabled>
          <Plus className="h-4 w-4" />
          Nuevo viaje
        </Button>
      </div>
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <div className="rounded-full bg-primary/10 p-4">
            <MapPin className="h-8 w-8 text-primary" />
          </div>
          <h3 className="mt-5 text-lg font-semibold text-foreground">Sin viajes aún</h3>
          <p className="mt-2 max-w-sm text-center text-sm text-muted-foreground">
            Crea tu primer viaje para empezar a registrar gastos compartidos con amigos.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
