'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Trash2 } from 'lucide-react';
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
import { listExpenses, deleteExpense } from '@/lib/api/expenses';
import type { Expense, Participation } from '@/types';
import { useQuery } from '@tanstack/react-query';

interface ExpenseListProps {
  tripId: string;
  participations: Participation[];
  currentUserId: string;
  isSupervisor: boolean;
  isCreator: boolean;
}

const splitTypeLabels: Record<string, string> = {
  EQUAL: 'Igualitario',
  EXACT: 'Exacto',
  PERCENT: 'Porcentaje',
};

export function ExpenseList({
  tripId,
  currentUserId,
  isSupervisor,
  isCreator,
}: ExpenseListProps) {
  const queryClient = useQueryClient();

  const { data: expenses, isLoading } = useQuery({
    queryKey: ['expenses', tripId],
    queryFn: () => listExpenses(tripId),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteExpense(tripId, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses', tripId] });
      queryClient.invalidateQueries({ queryKey: ['balances', tripId] });
      toast.success('Gasto eliminado');
    },
    onError: () => toast.error('No se pudo eliminar el gasto'),
  });

  const canDelete = (expense: Expense) => {
    if (isSupervisor) return false;
    if (isCreator) return true;
    return expense.creatorId === currentUserId;
  };

  if (isLoading) {
    return <p className="text-sm text-muted-foreground py-4">Cargando gastos...</p>;
  }

  if (!expenses || expenses.length === 0) {
    return (
      <p className="text-sm text-muted-foreground py-4">
        No hay gastos registrados en este viaje.
      </p>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Fecha</TableHead>
          <TableHead>Descripción</TableHead>
          <TableHead>Monto original</TableHead>
          <TableHead>Base</TableHead>
          <TableHead>Tipo</TableHead>
          <TableHead></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {expenses.map((expense) => (
          <TableRow key={expense.id}>
            <TableCell className="text-xs">
              {new Date(expense.date).toLocaleDateString('es-AR')}
            </TableCell>
            <TableCell className="font-medium">
              {expense.description || '—'}
              {expense.category && (
                <Badge variant="outline" className="ml-2 text-xs">
                  {expense.category}
                </Badge>
              )}
            </TableCell>
            <TableCell>
              {expense.originalAmount} {expense.originalCurrency}
            </TableCell>
            <TableCell className="text-xs text-muted-foreground">
              {expense.baseAmount ?? '—'}
            </TableCell>
            <TableCell>
              <Badge variant="secondary" className="text-xs">
                {splitTypeLabels[expense.splitType]}
              </Badge>
            </TableCell>
            <TableCell>
              {canDelete(expense) && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive"
                  onClick={() => deleteMutation.mutate(expense.id)}
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
