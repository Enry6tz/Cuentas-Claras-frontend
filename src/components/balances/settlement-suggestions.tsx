'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeftRight, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { getSettlement } from '@/lib/api/balances';
import { PaymentFormDialog } from '@/components/payments/payment-form-dialog';
import { avatarColor, initials } from '@/lib/utils';
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
    return <p className="text-sm text-muted-foreground py-4">Calculando liquidación...</p>;
  }

  if (!settlement || settlement.length === 0) {
    return (
      <p className="py-4 text-center text-sm text-muted-foreground">
        Todos los saldos están en cero. No se necesitan pagos.
      </p>
    );
  }

  return (
    <>
      <div className="grid gap-2">
        {settlement.map((s, i) => (
          <Card key={i}>
            <CardContent className="flex items-center justify-between py-3">
              <div className="flex items-center gap-3">
                <div className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold text-white ${avatarColor(s.fromUserId)}`}>
                  {initials(s.fromUserName)}
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
                <div className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold text-white ${avatarColor(s.toUserId)}`}>
                  {initials(s.toUserName)}
                </div>
                <div>
                  <p className="text-sm">
                    <strong>{s.fromUserName}</strong> le debe{' '}
                    <strong>${s.amount}</strong> a{' '}
                    <strong>{s.toUserName}</strong>
                  </p>
                </div>
              </div>
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
                className="gap-1"
              >
                <ArrowLeftRight className="h-4 w-4" />
                Registrar pago
              </Button>
            </CardContent>
          </Card>
        ))}
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
