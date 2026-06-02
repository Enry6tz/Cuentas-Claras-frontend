'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
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

  return (
    <Dialog key={open ? 'open' : 'closed'} open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Registrar pago</DialogTitle>
          <DialogDescription>
            Registrá una transferencia entre participantes para saldar una deuda.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          <div className="grid gap-2">
            <Label>Deudor (quién paga)</Label>
            <Select value={debtorId} onValueChange={(v) => setDebtorId(v ?? '')}>
              <SelectTrigger>
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

          <div className="grid gap-2">
            <Label>Acreedor (quién recibe)</Label>
            <Select value={creditorId} onValueChange={(v) => setCreditorId(v ?? '')}>
              <SelectTrigger>
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

          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-2">
              <Label htmlFor="amount">Monto *</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="100"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="currency">Moneda</Label>
              <Select value={currency} onValueChange={(v) => setCurrency(v ?? baseCurrency)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CURRENCIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {currency !== baseCurrency && (
            <div className="grid gap-2">
              <Label htmlFor="manualRate">
                Tasa de cambio manual (opcional, si la API falla)
              </Label>
              <Input
                id="manualRate"
                type="number"
                step="0.000001"
                value={manualRate}
                onChange={(e) => setManualRate(e.target.value)}
                placeholder={`1 ${currency} = ? ${baseCurrency}`}
              />
              <p className="text-xs text-muted-foreground">
                Si no se ingresa, se obtiene automáticamente de la API.
              </p>

              {effectiveRate && (
                <div className="rounded-md border bg-muted/40 p-3 text-sm space-y-1">
                  {rateLoading && (
                    <p className="text-muted-foreground">Obteniendo cotización...</p>
                  )}
                  {apiRate && (
                    <p className="font-medium">
                      1 {currency} = {apiRate.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 6 })} {baseCurrency}
                    </p>
                  )}
                  {manualRateNum && apiRate && apiRate !== manualRateNum && (
                    <p className="text-xs text-muted-foreground">
                      Usando tasa manual. API: 1 {currency} = {apiRate.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 6 })} {baseCurrency}
                    </p>
                  )}
                  {amountNum > 0 && baseEquivalent !== null && (
                    <p>
                      {fmt(amountNum, currency)} → {fmt(baseEquivalent, baseCurrency)}
                    </p>
                  )}
                </div>
              )}

              {!effectiveRate && !rateLoading && currency !== baseCurrency && (
                <p className="text-xs text-destructive">
                  Cotización no disponible. Ingresá una tasa manual o intentá de nuevo.
                </p>
              )}
            </div>
          )}

          <div className="grid gap-2">
            <Label htmlFor="date">Fecha</Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="note">Nota</Label>
            <Textarea
              id="note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Pago de la cena"
              rows={2}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={mutation.isPending}
          >
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={mutation.isPending}>
            {mutation.isPending ? 'Registrando...' : 'Registrar pago'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
