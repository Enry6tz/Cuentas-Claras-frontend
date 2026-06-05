'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { ArrowRight, Trash2 } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { listPayments, deletePayment } from '@/lib/api/payments';
import { useQuery } from '@tanstack/react-query';
import type { Payment } from '@/types';

interface PaymentListProps {
  tripId: string;
  currentUserId: string;
  isSupervisor: boolean;
  isCreator: boolean;
}

export function PaymentList({
  tripId,
  currentUserId,
  isSupervisor,
  isCreator,
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
    return <p className="text-sm text-muted-foreground py-4">Cargando pagos...</p>;
  }

  if (!payments || payments.length === 0) {
    return (
      <p className="text-sm text-muted-foreground py-4">
        No hay pagos registrados en este viaje.
      </p>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>De</TableHead>
          <TableHead></TableHead>
          <TableHead>A</TableHead>
          <TableHead>Nota</TableHead>
          <TableHead>Fecha</TableHead>
          <TableHead className="text-right">Monto</TableHead>
          <TableHead></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {payments.map((payment) => (
          <TableRow key={payment.id}>
            <TableCell>
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                  {payment.debtor?.name?.charAt(0).toUpperCase() ?? '?'}
                </div>
                <span className="text-sm text-foreground">{payment.debtor?.name ?? '—'}</span>
              </div>
            </TableCell>
            <TableCell className="text-muted-foreground">
              <ArrowRight className="h-4 w-4" />
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                  {payment.creditor?.name?.charAt(0).toUpperCase() ?? '?'}
                </div>
                <span className="text-sm text-foreground">{payment.creditor?.name ?? '—'}</span>
              </div>
            </TableCell>
            <TableCell className="text-xs text-muted-foreground">
              {payment.note || '—'}
            </TableCell>
            <TableCell className="text-xs text-muted-foreground">
              {new Date(payment.date).toLocaleDateString('es-AR')}
            </TableCell>
            <TableCell className="text-right font-medium tabular-nums">{payment.amount}</TableCell>
            <TableCell>
              {canDelete(payment) && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive"
                  onClick={() => deleteMutation.mutate(payment.id)}
                  disabled={deleteMutation.isPending}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
