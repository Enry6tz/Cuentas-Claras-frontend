'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { ArrowRight, ArrowLeftRight, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PersonAvatar } from '@/components/shared/ui-bits';
import { DatePicker } from '@/components/shared/date-picker';
import { cn } from '@/lib/utils';
import { createPayment, type CreatePaymentPayload } from '@/lib/api/payments';
import { getCurrencyRate } from '@/lib/api/currency';
import type { Participation } from '@/types';

const CURRENCIES = ['ARS', 'USD', 'EUR', 'BRL', 'CLP', 'UYU', 'BOB', 'COP', 'MXN'];

function fmt(amount: number, currency: string) {
  return `${amount.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${currency}`;
}

interface PaymentFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tripId: string;
  participations: Participation[];
  baseCurrency: string;
  defaultDebtorId?: string;
  defaultCreditorId?: string;
  defaultAmount?: string;
}

export function PaymentFormDialog({
  open,
  onOpenChange,
  tripId,
  participations,
  baseCurrency,
  defaultDebtorId,
  defaultCreditorId,
  defaultAmount,
}: PaymentFormDialogProps) {
  const queryClient = useQueryClient();

  const [debtorId, setDebtorId] = useState(defaultDebtorId ?? '');
  const [creditorId, setCreditorId] = useState(defaultCreditorId ?? '');
  const [amount, setAmount] = useState(defaultAmount ?? '');
  const [currency, setCurrency] = useState(baseCurrency);
  const [manualRate, setManualRate] = useState('');
  const [note, setNote] = useState('');
  const [date, setDate] = useState('');

  const { data: rateData, isLoading: rateLoading } = useQuery({
    queryKey: ['currency-rate', currency, baseCurrency],
    queryFn: () => getCurrencyRate(currency, baseCurrency),
    enabled: currency !== baseCurrency,
    staleTime: 60 * 60 * 1000,
    retry: 1,
  });

  const apiRate = rateData?.rate ?? null;
  const manualRateNum = manualRate ? parseFloat(manualRate) : null;
  const effectiveRate = manualRateNum || apiRate;
  const amountNum = parseFloat(amount) || 0;
  const baseEquivalent = effectiveRate && amountNum && currency !== baseCurrency
    ? Math.round(amountNum * effectiveRate * 100) / 100
    : null;

  const samePerson = !!debtorId && !!creditorId && debtorId === creditorId;

  const mutation = useMutation({
    mutationFn: (payload: CreatePaymentPayload) => createPayment(tripId, payload),
    onSuccess: () => {
      toast.success('Pago registrado');
      queryClient.invalidateQueries({ queryKey: ['payments', tripId] });
      queryClient.invalidateQueries({ queryKey: ['balances', tripId] });
      onOpenChange(false);
    },
    onError: (err: unknown) => {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? 'No se pudo registrar el pago';
      toast.error(typeof message === 'string' ? message : 'Algo salio mal');
    },
  });

  function handleSubmit() {
    if (!debtorId || !creditorId) {
      toast.error('Seleccioná deudor y acreedor');
      return;
    }
    if (debtorId === creditorId) {
      toast.error('El deudor y el acreedor deben ser distintos');
      return;
    }
    const parsedAmount = parseFloat(amount);
    if (!parsedAmount || parsedAmount <= 0) {
      toast.error('El monto debe ser mayor a 0');
      return;
    }

    let baseAmount = parsedAmount;
    if (currency !== baseCurrency && effectiveRate) {
      baseAmount = Math.round(parsedAmount * effectiveRate * 100) / 100;
    }

    mutation.mutate({
      debtorId,
      creditorId,
      amount: baseAmount,
      note: note.trim() || undefined,
      date: date || undefined,
    });
  }

  // Mapa value→label para que el trigger muestre el nombre (no el UUID) aun con el popup cerrado.
  const personItems = participations.map((p) => ({
    value: p.userId,
    label: (
      <span className="flex items-center gap-2">
        <PersonAvatar name={p.user?.name ?? 'Sin nombre'} seed={p.userId} className="size-6" />
        {p.user?.name ?? 'Sin nombre'}
      </span>
    ),
  }));

  return (
    <Dialog key={open ? 'open' : 'closed'} open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Registrar pago</DialogTitle>
          <DialogDescription>
            Los pagos se registran en moneda base ({baseCurrency}). El deudor le transfiere al
            acreedor.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          {/* Deudor → Acreedor */}
          <div className="grid grid-cols-[1fr_auto_1fr] items-end gap-2">
            <div className="grid gap-2">
              <Label>Deudor</Label>
              <Select items={personItems} value={debtorId} onValueChange={(v) => setDebtorId(v ?? '')}>
                <SelectTrigger className={cn('w-full', samePerson && 'border-destructive ring-destructive/20')}>
                  <SelectValue placeholder="Seleccionar..." />
                </SelectTrigger>
                <SelectContent>
                  {participations.map((p) => (
                    <SelectItem key={p.userId} value={p.userId}>
                      {p.user?.name ?? 'Sin nombre'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <ArrowRight className="mb-2 size-4 text-muted-foreground" />
            <div className="grid gap-2">
              <Label>Acreedor</Label>
              <Select items={personItems} value={creditorId} onValueChange={(v) => setCreditorId(v ?? '')}>
                <SelectTrigger className={cn('w-full', samePerson && 'border-destructive ring-destructive/20')}>
                  <SelectValue placeholder="Seleccionar..." />
                </SelectTrigger>
                <SelectContent>
                  {participations.map((p) => (
                    <SelectItem key={p.userId} value={p.userId}>
                      {p.user?.name ?? 'Sin nombre'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {samePerson && (
            <p className="-mt-2 flex items-center gap-1.5 text-sm text-destructive">
              <X className="size-4" />
              El deudor y el acreedor deben ser distintos.
            </p>
          )}

          {/* Monto + Moneda + Fecha */}
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-2">
              <Label htmlFor="amount">Monto</Label>
              <div className="flex items-center gap-2">
                <Select value={currency} onValueChange={(v) => setCurrency(v ?? baseCurrency)}>
                  <SelectTrigger className="w-[4.5rem] shrink-0">
                    <span>{currency}</span>
                  </SelectTrigger>
                  <SelectContent>
                    {CURRENCIES.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0,00"
                  className="text-right"
                  required
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="date">Fecha</Label>
              <DatePicker id="date" value={date} onChange={setDate} />
            </div>
          </div>

          {/* Preview de conversión (si la moneda difiere de la base) */}
          {currency !== baseCurrency && (
            <div className="space-y-2">
              {effectiveRate ? (
                <div className="flex items-start gap-2 rounded-lg border border-primary/10 bg-primary/5 p-3">
                  <ArrowLeftRight className="mt-0.5 size-4 shrink-0 text-primary" />
                  <div className="space-y-0.5">
                    <p className="text-sm">
                      <span className="font-medium">{fmt(amountNum, currency)}</span>{' '}
                      {baseEquivalent !== null && (
                        <span className="text-primary">→ {fmt(baseEquivalent, baseCurrency)}</span>
                      )}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Tasa de cambio: 1 {currency} ={' '}
                      {effectiveRate.toLocaleString('es-AR', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 6,
                      })}{' '}
                      {baseCurrency}.
                    </p>
                  </div>
                </div>
              ) : (
                !rateLoading && (
                  <p className="text-xs text-destructive">
                    Cotización no disponible. Ingresá una tasa manual o intentá de nuevo.
                  </p>
                )
              )}
              <div className="grid gap-1.5">
                <Label htmlFor="manualRate" className="text-xs text-muted-foreground">
                  Tasa manual (opcional, si la API falla)
                </Label>
                <Input
                  id="manualRate"
                  type="number"
                  step="0.000001"
                  value={manualRate}
                  onChange={(e) => setManualRate(e.target.value)}
                  placeholder={`1 ${currency} = ? ${baseCurrency}`}
                />
              </div>
            </div>
          )}

          {/* Nota */}
          <div className="grid gap-2">
            <Label htmlFor="note">Nota (opcional)</Label>
            <Textarea
              id="note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Ej: Parte del hotel, transferencia por Mercado Pago…"
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={mutation.isPending}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={mutation.isPending || samePerson}>
            {mutation.isPending ? 'Registrando...' : 'Registrar pago'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
