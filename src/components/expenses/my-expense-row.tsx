'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MoreVertical, Eye, Trash2, Plane } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
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
import { useApiMutation } from '@/hooks/querys/common/useApiMutation';
import { deleteExpense } from '@/services/api/expenses';
import type { Expense } from '@/types';

function fmtAmount(value: string | null) {
  if (value == null) return '—';
  const n = parseFloat(value);
  if (Number.isNaN(n)) return '—';
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

export function MyExpenseRow({ expense }: { expense: Expense }) {
  const router = useRouter();
  const [deleteOpen, setDeleteOpen] = useState(false);

  const del = useApiMutation({
    mutationFn: () => deleteExpense(expense.tripId, expense.id),
    invalidateKeys: [['expenses'], ['balances']],
    successMessage: 'Gasto eliminado',
  });

  const currency = expense.trip?.baseCurrency ?? '';
  const amount = fmtAmount(expense.baseAmount ?? expense.originalAmount);
  const goToTrip = () => router.push(`/trips/${expense.tripId}?tab=expenses`);

  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border bg-card px-4 py-3.5 transition-colors hover:bg-muted/40">
      <button
        onClick={goToTrip}
        className="flex min-w-0 flex-1 items-center gap-3 text-left"
      >
        {expense.category ? (
          <Badge variant="secondary" className="shrink-0">
            {expense.category}
          </Badge>
        ) : (
          <Badge variant="outline" className="shrink-0 text-muted-foreground">
            Sin categoría
          </Badge>
        )}
        <div className="min-w-0">
          <p className="truncate font-semibold text-foreground">
            {expense.description || 'Gasto'}
          </p>
          <p className="flex items-center gap-1.5 truncate text-xs text-muted-foreground">
            <Plane className="size-3 shrink-0" />
            <span className="truncate">{expense.trip?.name ?? 'Viaje'}</span>
            <span>·</span>
            <span>{fmtDate(expense.date)}</span>
          </p>
        </div>
      </button>

      <div className="flex shrink-0 items-center gap-2">
        <span className="text-sm font-semibold tabular-nums text-foreground">
          {amount}
          {currency ? ` ${currency}` : ''}
        </span>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button variant="ghost" size="icon-sm" className="text-muted-foreground">
                <MoreVertical className="size-4" />
                <span className="sr-only">Acciones del gasto</span>
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
            <DialogTitle>Eliminar gasto</DialogTitle>
            <DialogDescription>
              Vas a eliminar <strong>{expense.description || 'este gasto'}</strong>.
              Solo el creador del gasto o del viaje puede hacerlo.
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
