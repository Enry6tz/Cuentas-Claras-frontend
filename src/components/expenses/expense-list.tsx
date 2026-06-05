'use client';

import { Trash2, Receipt } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PersonAvatar } from '@/components/shared/ui-bits';
import { useExpenses } from '@/hooks/querys/expenses/useExpenses';
import { useExpenseMutations } from '@/hooks/querys/expenses/useExpenseMutations';
import type { Expense, ExpenseSplitType, Participation } from '@/types';

interface ExpenseListProps {
  tripId: string;
  participations: Participation[];
  currentUserId: string;
  isSupervisor: boolean;
  isCreator: boolean;
  baseCurrency?: string;
}

const splitTypeMeta: Record<
  ExpenseSplitType,
  { label: string; variant: 'outline' | 'secondary' }
> = {
  EQUAL: { label: 'Igual', variant: 'outline' },
  EXACT: { label: 'Exacto', variant: 'outline' },
  PERCENT: { label: 'Porcentaje', variant: 'secondary' },
};

function fmtAmount(value: string | number | null | undefined) {
  if (value == null || value === '') return '—';
  const n = typeof value === 'string' ? parseFloat(value) : value;
  if (Number.isNaN(n)) return '—';
  return n.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function ExpenseList({
  tripId,
  participations,
  currentUserId,
  isSupervisor,
  isCreator,
  baseCurrency,
}: ExpenseListProps) {
  const { data: expenses, isLoading } = useExpenses(tripId);

  const { remove: deleteMutation } = useExpenseMutations(tripId);

  const canDelete = (expense: Expense) => {
    if (isSupervisor) return false;
    if (isCreator) return true;
    return expense.creatorId === currentUserId;
  };

  // Nombre del pagador: quien figura con monto pagado en los detalles, o el creador.
  const payerOf = (expense: Expense): { name: string; seed: string } => {
    const payer = expense.details?.find((d) => parseFloat(d.amountPaid ?? '0') > 0);
    if (payer?.user) return { name: payer.user.name, seed: payer.userId };
    if (expense.creator) return { name: expense.creator.name, seed: expense.creatorId };
    const fromParticipations = participations.find((p) => p.userId === expense.creatorId);
    if (fromParticipations?.user) {
      return { name: fromParticipations.user.name, seed: expense.creatorId };
    }
    return { name: '—', seed: expense.creatorId };
  };

  if (isLoading) {
    return <p className="px-4 py-6 text-sm text-muted-foreground">Cargando gastos...</p>;
  }

  if (!expenses || expenses.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center px-4 py-12">
        <div className="rounded-full bg-muted p-3 text-muted-foreground">
          <Receipt className="size-5" />
        </div>
        <p className="mt-3 text-sm font-medium text-foreground">Todavía no hay gastos en este viaje</p>
        <p className="mt-1 text-center text-xs text-muted-foreground">
          Registrá el primer gasto para empezar a dividir.
        </p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="px-4">Descripción</TableHead>
          <TableHead>Fecha</TableHead>
          <TableHead>Pagó</TableHead>
          <TableHead>División</TableHead>
          <TableHead className="text-right">Monto</TableHead>
          <TableHead className="px-4" />
        </TableRow>
      </TableHeader>
      <TableBody>
        {expenses.map((expense) => {
          const split = splitTypeMeta[expense.splitType];
          const payer = payerOf(expense);
          const hasOriginal =
            expense.baseAmount != null && expense.originalCurrency !== baseCurrency;

          return (
            <TableRow key={expense.id}>
              <TableCell className="px-4 py-3">
                <div className="font-medium text-foreground">{expense.description || '—'}</div>
                {expense.category && (
                  <Badge variant="secondary" className="mt-1">
                    {expense.category}
                  </Badge>
                )}
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {new Date(expense.date).toLocaleDateString('es-AR', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                })}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <PersonAvatar name={payer.name} seed={payer.seed} className="size-7" />
                  <span className="text-sm text-foreground">{payer.name}</span>
                </div>
              </TableCell>
              <TableCell>
                <Badge variant={split.variant}>{split.label}</Badge>
              </TableCell>
              <TableCell className="text-right">
                <div className="text-sm font-semibold text-foreground tabular-nums">
                  {fmtAmount(expense.baseAmount ?? expense.originalAmount)}
                  {baseCurrency ? ` ${baseCurrency}` : ''}
                </div>
                {hasOriginal && (
                  <div className="text-xs text-muted-foreground tabular-nums">
                    {fmtAmount(expense.originalAmount)} {expense.originalCurrency}
                  </div>
                )}
              </TableCell>
              <TableCell className="px-4 text-right">
                {canDelete(expense) && (
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className="text-muted-foreground hover:text-destructive"
                    onClick={() => deleteMutation.mutate(expense.id)}
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
