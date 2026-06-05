'use client';

import { useState } from 'react';
import { TrendingUp, TrendingDown, PieChart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PersonAvatar } from '@/components/shared/ui-bits';
import { useBalances } from '@/hooks/querys/balances/useBalances';
import { BalanceChartsDialog } from '@/components/balances/balance-charts-dialog';

interface BalanceSummaryProps {
  tripId: string;
  baseCurrency?: string;
}

export function BalanceSummary({ tripId, baseCurrency }: BalanceSummaryProps) {
  const { data: balances, isLoading } = useBalances(tripId);
  const [chartsOpen, setChartsOpen] = useState(false);

  if (isLoading) {
    return <p className="py-4 text-sm text-muted-foreground">Cargando balances...</p>;
  }

  if (!balances || balances.length === 0) {
    return <p className="py-4 text-sm text-muted-foreground">No hay balances disponibles.</p>;
  }

  const currencyPrefix = baseCurrency ? `${baseCurrency} ` : '';

  return (
    <>
      <div className="mb-1 flex justify-end">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setChartsOpen(true)}
          className="text-muted-foreground"
        >
          <PieChart className="size-4" />
          Ver distribución
        </Button>
      </div>

      <ul className="divide-y">
        {balances.map((entry) => {
          const balance = parseFloat(entry.balance);
          const isPositive = balance > 0;
          const isNegative = balance < 0;
          const color = isPositive
            ? 'text-success'
            : isNegative
              ? 'text-destructive'
              : 'text-muted-foreground';
          const subLabel = isPositive ? 'Le deben' : isNegative ? 'Debe' : 'En cero';
          const amountText =
            balance === 0
              ? `${currencyPrefix}0,00`
              : `${isPositive ? '+' : '−'}${currencyPrefix}${Math.abs(balance).toLocaleString('es-AR', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}`;

          return (
            <li key={entry.userId}>
              <button
                onClick={() => setChartsOpen(true)}
                className="flex w-full items-center justify-between gap-3 py-3 text-left transition-colors hover:bg-muted/40"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <PersonAvatar name={entry.userName} seed={entry.userId} />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">{entry.userName}</p>
                    <p className={`text-xs ${color}`}>{subLabel}</p>
                  </div>
                </div>
                <div className={`flex items-center gap-1.5 text-sm font-semibold tabular-nums ${color}`}>
                  {isPositive && <TrendingUp className="size-4" />}
                  {isNegative && <TrendingDown className="size-4" />}
                  {amountText}
                </div>
              </button>
            </li>
          );
        })}
      </ul>

      <BalanceChartsDialog
        tripId={tripId}
        baseCurrency={baseCurrency}
        open={chartsOpen}
        onOpenChange={setChartsOpen}
      />
    </>
  );
}
