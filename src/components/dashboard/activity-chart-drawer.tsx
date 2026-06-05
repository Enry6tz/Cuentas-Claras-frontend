'use client';

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { ActivityChart } from './activity-chart';

interface ActivityChartDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/** Drawer inferior con el gráfico de actividad. Se abre desde las cards del dashboard. */
export function ActivityChartDrawer({ open, onOpenChange }: ActivityChartDrawerProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="max-h-[92vh] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Actividad</SheetTitle>
          <SheetDescription>
            Balance, gastos y pagos acumulados en el tiempo, a través de todos tus
            viajes.
          </SheetDescription>
        </SheetHeader>
        <div className="px-4 pb-6">
          <ActivityChart />
        </div>
      </SheetContent>
    </Sheet>
  );
}
