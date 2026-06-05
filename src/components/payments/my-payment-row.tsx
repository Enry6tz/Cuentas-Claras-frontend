'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MoreVertical, Eye, Trash2, ArrowRight, Plane } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { PersonAvatar } from '@/components/shared/ui-bits';
import { useApiMutation } from '@/hooks/querys/common/useApiMutation';
import { deletePayment } from '@/services/api/payments';
import type { Payment } from '@/types';

function fmtAmount(value: string) {
  const n = parseFloat(value);
  if (Number.isNaN(n)) return value;
  return n.toLocaleString('es-AR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('es-AR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function MyPaymentRow({ payment }: { payment: Payment }) {
  const router = useRouter();
  const [deleteOpen, setDeleteOpen] = useState(false);

  const del = useApiMutation({
    mutationFn: () => deletePayment(payment.tripId, payment.id),
    invalidateKeys: [['payments'], ['balances']],
    successMessage: 'Pago eliminado',
  });

  const debtor = payment.debtor?.name ?? '—';
  const creditor = payment.creditor?.name ?? '—';
  const currency = payment.trip?.baseCurrency ?? '';
  const goToTrip = () => router.push(`/trips/${payment.tripId}?tab=payments`);

  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border bg-card px-4 py-3.5 transition-colors hover:bg-muted/40">
      <button
        onClick={goToTrip}
        className="flex min-w-0 flex-1 items-center gap-3 text-left"
      >
        <div className="flex shrink-0 items-center gap-1">
          <PersonAvatar name={debtor} seed={payment.debtorId} className="size-7" />
          <ArrowRight className="size-3.5 text-muted-foreground" />
          <PersonAvatar name={creditor} seed={payment.creditorId} className="size-7" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-foreground">
            {debtor} <span className="text-muted-foreground">→</span> {creditor}
          </p>
          <p className="flex items-center gap-1.5 truncate text-xs text-muted-foreground">
            <Plane className="size-3 shrink-0" />
            <span className="truncate">{payment.trip?.name ?? 'Viaje'}</span>
            <span>·</span>
            <span>{fmtDate(payment.date)}</span>
          </p>
        </div>
      </button>

      <div className="flex shrink-0 items-center gap-2">
        <span className="text-sm font-semibold tabular-nums text-foreground">
          {fmtAmount(payment.amount)}
          {currency ? ` ${currency}` : ''}
        </span>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button variant="ghost" size="icon-sm" className="text-muted-foreground">
                <MoreVertical className="size-4" />
                <span className="sr-only">Acciones del pago</span>
              </Button>
            }
          />
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={goToTrip}>
              <Eye className="size-4" />
              Ver en el viaje
            </DropdownMenuItem>
            <DropdownMenuItem variant="destructive" onClick={() => setDeleteOpen(true)}>
              <Trash2 className="size-4" />
              Eliminar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Eliminar pago</DialogTitle>
            <DialogDescription>
              Vas a eliminar el pago de <strong>{debtor}</strong> a{' '}
              <strong>{creditor}</strong>. Solo el deudor o el creador del viaje
              puede hacerlo.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteOpen(false)}
              disabled={del.isPending}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              disabled={del.isPending}
              onClick={() =>
                del.mutate(undefined, { onSuccess: () => setDeleteOpen(false) })
              }
            >
              {del.isPending ? 'Eliminando...' : 'Eliminar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
