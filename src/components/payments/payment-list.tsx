'use client';

import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Trash2, ArrowRight, CreditCard } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { PersonAvatar } from '@/components/shared/ui-bits';
import { listPayments, deletePayment } from '@/lib/api/payments';
import type { Payment } from '@/types';

interface PaymentListProps {
  tripId: string;
  currentUserId: string;
  isSupervisor: boolean;
  isCreator: boolean;
  baseCurrency?: string;
}

function fmtAmount(value: string) {
  const n = parseFloat(value);
  if (Number.isNaN(n)) return value;
  return n.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function PaymentList({
  tripId,
  currentUserId,
  isSupervisor,
  isCreator,
  baseCurrency,
}: PaymentListProps) {
  const queryClient = useQueryClient();

  const { data: payments, isLoading } = useQuery({
    queryKey: ['payments', tripId],
    queryFn: () => listPayments(tripId),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deletePayment(tripId, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments', tripId] });
      queryClient.invalidateQueries({ queryKey: ['balances', tripId] });
      toast.success('Pago eliminado');
    },
    onError: () => toast.error('No se pudo eliminar el pago'),
  });

  const canDelete = (payment: Payment) => {
    if (isSupervisor) return false;
    if (isCreator) return true;
    return payment.debtorId === currentUserId;
  };

  if (isLoading) {
    return <p className="px-4 py-6 text-sm text-muted-foreground">Cargando pagos...</p>;
  }

  if (!payments || payments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center px-4 py-12">
        <div className="rounded-full bg-muted p-3 text-muted-foreground">
          <CreditCard className="size-5" />
        </div>
        <p className="mt-3 text-sm font-medium text-foreground">Todavía no hay pagos registrados</p>
        <p className="mt-1 text-center text-xs text-muted-foreground">
          Registrá una transferencia para empezar a saldar deudas.
        </p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="px-4">De</TableHead>
          <TableHead />
          <TableHead>A</TableHead>
          <TableHead>Nota</TableHead>
          <TableHead>Fecha</TableHead>
          <TableHead className="text-right">Monto</TableHead>
          <TableHead className="px-4" />
        </TableRow>
      </TableHeader>
      <TableBody>
        {payments.map((payment) => {
          const debtorName = payment.debtor?.name ?? '—';
          const creditorName = payment.creditor?.name ?? '—';
          return (
            <TableRow key={payment.id}>
              <TableCell className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <PersonAvatar name={debtorName} seed={payment.debtorId} className="size-7" />
                  <span className="text-sm font-medium text-foreground">{debtorName}</span>
                </div>
              </TableCell>
              <TableCell>
                <ArrowRight className="size-4 text-muted-foreground" />
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <PersonAvatar name={creditorName} seed={payment.creditorId} className="size-7" />
                  <span className="text-sm font-medium text-foreground">{creditorName}</span>
                </div>
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {payment.note || '—'}
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {new Date(payment.date).toLocaleDateString('es-AR', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                })}
              </TableCell>
              <TableCell className="text-right text-sm font-semibold text-foreground tabular-nums">
                {fmtAmount(payment.amount)}
                {baseCurrency ? ` ${baseCurrency}` : ''}
              </TableCell>
              <TableCell className="px-4 text-right">
                {canDelete(payment) && (
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className="text-muted-foreground hover:text-destructive"
                    onClick={() => deleteMutation.mutate(payment.id)}
                    disabled={deleteMutation.isPending}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                )}
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
