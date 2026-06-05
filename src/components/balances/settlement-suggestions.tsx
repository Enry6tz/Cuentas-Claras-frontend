'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight, ArrowLeftRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PersonAvatar } from '@/components/shared/ui-bits';
import { getSettlement } from '@/lib/api/balances';
import { PaymentFormDialog } from '@/components/payments/payment-form-dialog';
import type { Participation } from '@/types';

interface SettlementSuggestionsProps {
  tripId: string;
  participations: Participation[];
  baseCurrency: string;
}

export function SettlementSuggestions({
  tripId,
  participations,
  baseCurrency,
}: SettlementSuggestionsProps) {
  const [paymentPrefill, setPaymentPrefill] = useState<{
    debtorId: string;
    creditorId: string;
    amount: string;
  } | null>(null);

  const { data: settlement, isLoading } = useQuery({
    queryKey: ['settlement', tripId],
    queryFn: () => getSettlement(tripId),
  });

  if (isLoading) {
    return <p className="py-4 text-sm text-muted-foreground">Calculando liquidación...</p>;
  }

  if (!settlement || settlement.length === 0) {
    return (
      <p className="py-4 text-sm text-muted-foreground">
        No hay deudas pendientes. ¡Están en cero!
      </p>
    );
  }

  const fmt = (value: string) => {
    const n = parseFloat(value);
    return Number.isNaN(n)
      ? value
      : n.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  return (
    <>
      <ul className="divide-y">
        {settlement.map((s, i) => (
          <li key={i} className="flex flex-wrap items-center justify-between gap-3 py-3">
            <div className="flex min-w-0 items-center gap-2">
              <PersonAvatar name={s.fromUserName} seed={s.fromUserId} className="size-7" />
              <span className="text-sm font-medium text-foreground">{s.fromUserName}</span>
              <ArrowRight className="size-4 shrink-0 text-muted-foreground" />
              <PersonAvatar name={s.toUserName} seed={s.toUserId} className="size-7" />
              <span className="text-sm font-medium text-foreground">{s.toUserName}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold text-foreground tabular-nums">
                {baseCurrency} {fmt(s.amount)}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setPaymentPrefill({
                    debtorId: s.fromUserId,
                    creditorId: s.toUserId,
                    amount: s.amount,
                  })
                }
              >
                <ArrowLeftRight className="size-4" />
                Registrar pago
              </Button>
            </div>
          </li>
        ))}
      </ul>

      <div className="mt-4 rounded-lg bg-muted p-4 text-sm text-muted-foreground">
        Con estos {settlement.length} {settlement.length === 1 ? 'pago' : 'pagos'}, todos los
        saldos quedan en cero. Los saldos siempre suman 0.
      </div>

      {paymentPrefill && (
        <PaymentFormDialog
          open={true}
          onOpenChange={(open) => {
            if (!open) setPaymentPrefill(null);
          }}
          tripId={tripId}
          participations={participations}
          baseCurrency={baseCurrency}
          defaultDebtorId={paymentPrefill.debtorId}
          defaultCreditorId={paymentPrefill.creditorId}
          defaultAmount={paymentPrefill.amount}
        />
      )}
    </>
  );
}
