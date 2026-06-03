'use client';

import { useQuery } from '@tanstack/react-query';
import { ArrowUp, ArrowDown } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { getBalances } from '@/lib/api/balances';
interface BalanceSummaryProps {
  tripId: string;
}

export function BalanceSummary({ tripId }: BalanceSummaryProps) {
  const { data: balances, isLoading } = useQuery({
    queryKey: ['balances', tripId],
    queryFn: () => getBalances(tripId),
  });

  if (isLoading) {
    return <p className="text-sm text-muted-foreground py-4">Cargando balances...</p>;
  }

  if (!balances || balances.length === 0) {
    return (
      <p className="text-sm text-muted-foreground py-4">
        No hay balances disponibles.
      </p>
    );
  }

  return (
    <div className="grid gap-2">
      {balances.map((entry) => {
        const balanceNum = parseFloat(entry.balance);
        const isPositive = balanceNum > 0;
        const isNegative = balanceNum < 0;
        const isSettled = balanceNum === 0;

        return (
          <div
            key={entry.userId}
            className="flex items-center justify-between rounded-lg border px-4 py-3"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-sm font-medium text-primary">
                {entry.userName.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-medium">{entry.userName}</p>
                {isPositive && (
                  <p className="text-xs text-green-600">
                    Le deben {entry.balance}
                  </p>
                )}
                {isNegative && (
                  <p className="text-xs text-red-600">
                    Debe {entry.balance.replace('-', '')}
                  </p>
                )}
                {isSettled && (
                  <p className="text-xs text-muted-foreground">En cero</p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              {isPositive && (
                <Badge variant="default" className="bg-green-600">
                  <ArrowUp className="h-3 w-3 mr-1" />
                  +{entry.balance}
                </Badge>
              )}
              {isNegative && (
                <Badge variant="destructive">
                  <ArrowDown className="h-3 w-3 mr-1" />
                  {entry.balance}
                </Badge>
              )}
              {isSettled && (
                <Badge variant="outline">$0.00</Badge>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
