'use client';

import { CreditCard, Plus } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function PaymentsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Pagos</h1>
        <Button disabled>
          <Plus className="h-4 w-4" />
          Registrar pago
        </Button>
      </div>
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <div className="rounded-full bg-warning/10 p-4">
            <CreditCard className="h-8 w-8 text-warning" />
          </div>
          <h3 className="mt-5 text-lg font-semibold text-foreground">Sin pagos aún</h3>
          <p className="mt-2 max-w-sm text-center text-sm text-muted-foreground">
            Los pagos entre miembros del viaje aparecerán aquí con sugerencias de simplificación de deudas.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
