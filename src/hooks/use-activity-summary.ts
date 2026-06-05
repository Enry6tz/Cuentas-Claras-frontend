'use client';

import { useMemo } from 'react';
import { useMyExpenses } from '@/hooks/querys/expenses/useMyExpenses';
import { useMyPayments } from '@/hooks/querys/payments/useMyPayments';

/** Colores representativos para el flujo de caja. */
export const ACTIVITY_COLORS = {
  gastos: 'var(--destructive)', // egresos → rojo
  pagos: 'oklch(0.62 0.17 152)', // ingresos → verde
} as const;

/** Verde si el balance es positivo, rojo si es negativo. */
export function balanceColor(n: number) {
  return n >= 0 ? ACTIVITY_COLORS.pagos : ACTIVITY_COLORS.gastos;
}

export interface ActivityPoint {
  date: string;
  gastos: number; // negativo (egresos, por debajo del cero)
  pagos: number; // positivo (ingresos, por encima del cero)
  balance: number; // diferencia: pagos − gastos
}

function round(n: number) {
  return Math.round(n * 100) / 100;
}

/**
 * Resumen de actividad (gastos/pagos/balance) del usuario a través de todos sus
 * viajes, computado en el cliente desde los últimos ~100 gastos y pagos.
 * Lo comparten las cards del dashboard y el gráfico para que siempre coincidan.
 *
 * Modelo: lo gastado va por DEBAJO del cero (negativo), lo pagado por ENCIMA
 * (positivo), y el balance es la diferencia (ingresos − egresos).
 */
export function useActivitySummary() {
  const { data: expensesData, isLoading: le } = useMyExpenses({ limit: 100 });
  const { data: paymentsData, isLoading: lp } = useMyPayments({ limit: 100 });

  return useMemo(() => {
    type Ev = { ts: number; date: string; type: 'gasto' | 'pago'; amount: number };
    const evs: Ev[] = [];

    for (const e of expensesData?.items ?? []) {
      evs.push({
        ts: new Date(e.date).getTime(),
        date: e.date,
        type: 'gasto',
        amount: parseFloat(e.baseAmount ?? e.originalAmount) || 0,
      });
    }
    for (const p of paymentsData?.items ?? []) {
      evs.push({
        ts: new Date(p.date).getTime(),
        date: p.date,
        type: 'pago',
        amount: parseFloat(p.amount) || 0,
      });
    }
    evs.sort((a, b) => a.ts - b.ts);

    let cg = 0;
    let cp = 0;
    const points: ActivityPoint[] = evs.map((ev) => {
      if (ev.type === 'gasto') cg += ev.amount;
      else cp += ev.amount;
      return {
        date: ev.date,
        gastos: -round(cg),
        pagos: round(cp),
        balance: round(cp - cg),
      };
    });

    const totalGastos = round(cg);
    const totalPagos = round(cp);
    const balance = round(cp - cg);
    const maxAbs = points.reduce(
      (m, p) => Math.max(m, Math.abs(p.gastos), p.pagos, Math.abs(p.balance)),
      0,
    );

    return {
      points,
      totalGastos,
      totalPagos,
      balance,
      maxAbs,
      isLoading: le || lp,
      hasData: points.length > 0,
    };
  }, [expensesData, paymentsData, le, lp]);
}
