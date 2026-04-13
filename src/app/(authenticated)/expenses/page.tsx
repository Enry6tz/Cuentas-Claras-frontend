'use client';

import { Receipt, Plus } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function ExpensesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Gastos</h1>
        <Button disabled>
          <Plus className="h-4 w-4" />
          Agregar gasto
        </Button>
      </div>
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <div className="rounded-full bg-success/10 p-4">
            <Receipt className="h-8 w-8 text-success" />
          </div>
          <h3 className="mt-5 text-lg font-semibold text-foreground">Sin gastos aún</h3>
          <p className="mt-2 max-w-sm text-center text-sm text-muted-foreground">
            Tus gastos compartidos aparecerán aquí. Primero crea un viaje y luego empieza a registrar costos.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
