'use client';

import { useQuery } from '@tanstack/react-query';
import { TrendingDown, TrendingUp } from 'lucide-react';
import { getBalances } from '@/lib/api/balances';
import { avatarColor, initials } from '@/lib/utils';
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
    <div className="divide-y rounded-lg border">
      {balances.map((entry) => {
        const balanceNum = parseFloat(entry.balance);
        const isPositive = balanceNum > 0;
        const isNegative = balanceNum < 0;
        const isSettled = balanceNum === 0;

        return (
          <div
            key={entry.userId}
            className="flex items-center justify-between px-4 py-3"
          >
            <div className="flex items-center gap-3">
              <div className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold text-white ${avatarColor(entry.userId || entry.userName)}`}>
                {initials(entry.userName)}
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">{entry.userName}</p>
                {isPositive && (
                  <p className="text-xs text-success">Le deben</p>
                )}
                {isNegative && (
                  <p className="text-xs text-destructive">Debe</p>
                )}
                {isSettled && (
                  <p className="text-xs text-muted-foreground">En cero</p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              {isPositive && (
                <span className="flex items-center gap-1 text-sm font-semibold text-success tabular-nums">
                  <TrendingUp className="h-4 w-4" />
                  +{entry.balance}
                </span>
              )}
              {isNegative && (
                <span className="flex items-center gap-1 text-sm font-semibold text-destructive tabular-nums">
                  <TrendingDown className="h-4 w-4" />
                  {entry.balance}
                </span>
              )}
              {isSettled && (
                <span className="text-sm text-muted-foreground tabular-nums">$0.00</span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
