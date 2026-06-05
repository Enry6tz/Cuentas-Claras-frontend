'use client';

import { useMemo } from 'react';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from '@/components/ui/chart';
import { useExpenses } from '@/hooks/querys/expenses/useExpenses';
import { useParticipants } from '@/hooks/querys/participants/useParticipants';

interface BalanceChartsDialogProps {
  tripId: string;
  baseCurrency?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const PALETTE = [
  '#2f80ed', '#27ae60', '#f2994a', '#9b51e0', '#eb5fa8',
  '#56ccf2', '#f2c94c', '#e84393', '#1abc9c', '#6c5ce7',
];

function round(n: number) {
  return Math.round(n * 100) / 100;
}

/**
 * Dos barras apiladas — "Gastos" y "Pagos" — donde cada segmento es un
 * integrante: en Gastos, cuánto le tocó a cada uno (amountOwed); en Pagos,
 * cuánto puso cada uno (amountPaid). Así se ve la composición por usuario.
 */
export function BalanceChartsDialog({
  tripId,
  baseCurrency,
  open,
  onOpenChange,
}: BalanceChartsDialogProps) {
  const { data: expenses = [] } = useExpenses(tripId);
  const { data: participants = [] } = useParticipants(tripId);

  const { chartData, config, users, hasData } = useMemo(() => {
    const users = participants.map((p, i) => ({
      key: `u${i}`,
      id: p.userId,
      name: p.user?.name ?? 'Sin nombre',
      color: PALETTE[i % PALETTE.length],
    }));
    const byId = new Map(users.map((u) => [u.id, u]));

    const gasto: Record<string, number> = {};
    const pago: Record<string, number> = {};
    for (const u of users) {
      gasto[u.key] = 0;
      pago[u.key] = 0;
    }
    for (const e of expenses) {
      for (const d of e.details ?? []) {
        const u = byId.get(d.userId);
        if (!u) continue;
        gasto[u.key] += parseFloat(d.amountOwed) || 0;
        pago[u.key] += parseFloat(d.amountPaid) || 0;
      }
    }

    const roundRow = (r: Record<string, number>) =>
      Object.fromEntries(Object.entries(r).map(([k, v]) => [k, round(v)]));

    const chartData = [
      { categoria: 'Gastos', ...roundRow(gasto) },
      { categoria: 'Pagos', ...roundRow(pago) },
    ];

    const config: ChartConfig = {};
    for (const u of users) {
      config[u.key] = { label: u.name, color: u.color };
    }

    const hasData = users.some((u) => gasto[u.key] > 0 || pago[u.key] > 0);

    return { chartData, config, users, hasData };
  }, [expenses, participants]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Gastos y pagos por integrante</DialogTitle>
          <DialogDescription>
            Cada barra muestra la composición por integrante: en Gastos, la parte
            de cada uno; en Pagos, lo que puso cada uno
            {baseCurrency ? ` · ${baseCurrency}` : ''}.
          </DialogDescription>
        </DialogHeader>

        {!hasData ? (
          <div className="flex h-[300px] items-center justify-center text-sm text-muted-foreground">
            Todavía no hay gastos para comparar.
          </div>
        ) : (
          <ChartContainer config={config} className="aspect-auto h-[340px] w-full">
            <BarChart accessibilityLayer data={chartData} margin={{ left: 4, right: 12, top: 8 }}>
              <CartesianGrid vertical={false} />
              <XAxis dataKey="categoria" tickLine={false} tickMargin={10} axisLine={false} />
              <YAxis
                tickLine={false}
                axisLine={false}
                width={52}
                tickFormatter={(value) =>
                  Intl.NumberFormat('es-AR', { notation: 'compact' }).format(value)
                }
              />
              <ChartTooltip content={<ChartTooltipContent indicator="line" />} />
              <ChartLegend content={<ChartLegendContent />} />
              {users.map((u, i) => (
                <Bar
                  key={u.key}
                  dataKey={u.key}
                  stackId="a"
                  fill={`var(--color-${u.key})`}
                  radius={
                    i === 0
                      ? [0, 0, 4, 4]
                      : i === users.length - 1
                        ? [4, 4, 0, 0]
                        : [0, 0, 0, 0]
                  }
                />
              ))}
            </BarChart>
          </ChartContainer>
        )}
      </DialogContent>
    </Dialog>
  );
}
