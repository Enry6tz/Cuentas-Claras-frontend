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
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { createExpense, type CreateExpensePayload } from '@/lib/api/expenses';
import { getCurrencyRate } from '@/lib/api/currency';
import type { Participation } from '@/types';

function fmt(amount: number, currency: string) {
  return `${amount.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${currency}`;
}

interface ExpenseFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tripId: string;
  participations: Participation[];
  baseCurrency: string;
}

const CURRENCIES = ['ARS', 'USD', 'EUR', 'BRL', 'CLP', 'UYU', 'BOB', 'COP', 'MXN'];

export function ExpenseFormDialog({
  open,
  onOpenChange,
  tripId,
  participations,
  baseCurrency,
}: ExpenseFormDialogProps) {
  const queryClient = useQueryClient();

  const [description, setDescription] = useState('');
  const [originalAmount, setOriginalAmount] = useState('');
  const [originalCurrency, setOriginalCurrency] = useState(baseCurrency);
  const [date, setDate] = useState('');
  const [category, setCategory] = useState('');
  const [splitType, setSplitType] = useState<'EQUAL' | 'EXACT' | 'PERCENT'>('EQUAL');
  const [manualRate, setManualRate] = useState('');

  const [payers, setPayers] = useState<Array<{ userId: string; amountPaid: string }>>([]);
  const [participantIds, setParticipantIds] = useState<string[]>([]);
  const [exactShares, setExactShares] = useState<Array<{ userId: string; amountOwed: string }>>([]);
  const [percentShares, setPercentShares] = useState<Array<{ userId: string; percent: string }>>([]);

  const { data: rateData, isLoading: rateLoading } = useQuery({
    queryKey: ['currency-rate', originalCurrency, baseCurrency],
    queryFn: () => getCurrencyRate(originalCurrency, baseCurrency),
    enabled: originalCurrency !== baseCurrency,
    staleTime: 60 * 60 * 1000,
    retry: 1,
  });

  const apiRate = rateData?.rate ?? null;
  const manualRateNum = manualRate ? parseFloat(manualRate) : null;
  const effectiveRate = manualRateNum || apiRate;
  const amountNum = parseFloat(originalAmount) || 0;
  const baseEquivalent = effectiveRate && amountNum ? Math.round(amountNum * effectiveRate * 100) / 100 : null;

  const mutation = useMutation({
    mutationFn: (payload: CreateExpensePayload) => createExpense(tripId, payload),
    onSuccess: () => {
      toast.success('Gasto creado');
      queryClient.invalidateQueries({ queryKey: ['expenses', tripId] });
      queryClient.invalidateQueries({ queryKey: ['balances', tripId] });
      onOpenChange(false);
    },
    onError: (err: unknown) => {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? 'No se pudo crear el gasto';
      toast.error(typeof message === 'string' ? message : 'Algo salio mal');
    },
  });

  function handleAddPayer() {
    setPayers([...payers, { userId: '', amountPaid: '' }]);
  }

  function handlePayerChange(index: number, field: 'userId' | 'amountPaid', value: string) {
    const updated = [...payers];
    updated[index] = { ...updated[index], [field]: value };

    if (field === 'amountPaid' && value !== '') {
      const total = parseFloat(originalAmount) || 0;
      const filled = updated.filter(p => p.userId && p.amountPaid);
      const empty = updated.filter(p => p.userId && !p.amountPaid);
      if (empty.length === 1 && filled.length > 0) {
        const sumFilled = filled.reduce((s, p) => s + parseFloat(p.amountPaid), 0);
        const remaining = Math.round((total - sumFilled) * 100) / 100;
        if (remaining > 0 && remaining < total) {
          const emptyIndex = updated.indexOf(empty[0]);
          updated[emptyIndex] = { ...updated[emptyIndex], amountPaid: remaining.toFixed(2) };
        }
      }
    }

    setPayers(updated);
  }

  function handleRemovePayer(index: number) {
    setPayers(payers.filter((_, i) => i !== index));
  }

  function handleToggleParticipant(id: string) {
    setParticipantIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }

  function handleExactChange(userId: string, value: string) {
    const updated = [...exactShares];
    const idx = updated.findIndex((s) => s.userId === userId);
    if (idx >= 0) {
      updated[idx] = { ...updated[idx], amountOwed: value };
    } else {
      updated.push({ userId, amountOwed: value });
    }
    setExactShares(updated);
  }

  function handlePercentChange(userId: string, value: string) {
    const updated = [...percentShares];
    const idx = updated.findIndex((s) => s.userId === userId);
    if (idx >= 0) {
      updated[idx] = { ...updated[idx], percent: value };
    } else {
      updated.push({ userId, percent: value });
    }
    setPercentShares(updated);
  }

  function handleSubmit() {
    if (!description.trim()) {
      toast.error('La descripción es obligatoria');
      return;
    }

    const amount = parseFloat(originalAmount);
    if (!amount || amount <= 0) {
      toast.error('El monto debe ser mayor a 0');
      return;
    }

    const parsedPayers = payers
      .filter((p) => p.userId && p.amountPaid)
      .map((p) => ({ userId: p.userId, amountPaid: parseFloat(p.amountPaid) }));

    if (parsedPayers.length === 0) {
      toast.error('Debe haber al menos un pagador');
      return;
    }

    const totalPaid = parsedPayers.reduce((s, p) => s + p.amountPaid, 0);
    if (Math.abs(totalPaid - amount) > 0.01) {
      toast.error('La suma de lo pagado debe ser igual al monto total');
      return;
    }

    const payload: CreateExpensePayload = {
      description: description.trim(),
      originalAmount: amount,
      originalCurrency,
      date: date || undefined,
      category: category.trim() || undefined,
      splitType,
      payers: parsedPayers,
      manualExchangeRate: manualRate ? parseFloat(manualRate) : undefined,
    };

    if (splitType === 'EQUAL') {
      if (participantIds.length === 0) {
        toast.error('Selecciona al menos un participante para el reparto');
        return;
      }
      payload.participantIds = participantIds;
    }

    if (splitType === 'EXACT') {
      const shares = exactShares
        .filter((s) => s.amountOwed)
        .map((s) => ({ userId: s.userId, amountOwed: parseFloat(s.amountOwed) }));
      if (shares.length === 0) {
        toast.error('Ingresa los montos exactos para cada participante');
        return;
      }
      payload.exactShares = shares;
    }

    if (splitType === 'PERCENT') {
      const shares = percentShares
        .filter((s) => s.percent)
        .map((s) => ({ userId: s.userId, percent: parseFloat(s.percent) }));
      if (shares.length === 0) {
        toast.error('Ingresa los porcentajes para cada participante');
        return;
      }
      const totalPercent = shares.reduce((s, p) => s + p.percent, 0);
      if (Math.abs(totalPercent - 100) > 1) {
        toast.error('Los porcentajes deben sumar 100');
        return;
      }
      payload.percentShares = shares;
    }

    mutation.mutate(payload);
  }

  return (
    <Dialog key={open ? 'open' : 'closed'} open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nuevo gasto</DialogTitle>
          <DialogDescription>
            Registrá un gasto compartido entre los participantes del viaje.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          <div className="grid gap-2">
            <Label htmlFor="description">Descripción</Label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Cena en el restaurante"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-2">
              <Label htmlFor="amount">Monto *</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0.01"
                value={originalAmount}
                onChange={(e) => setOriginalAmount(e.target.value)}
                placeholder="100"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="currency">Moneda</Label>
              <Select value={originalCurrency} onValueChange={(v) => setOriginalCurrency(v ?? '')}>
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

          {originalCurrency !== baseCurrency && (
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
                placeholder={`1 ${originalCurrency} = ? ${baseCurrency}`}
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
                      1 {originalCurrency} = {apiRate.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 6 })} {baseCurrency}
                    </p>
                  )}
                  {manualRateNum && apiRate && apiRate !== manualRateNum && (
                    <p className="text-xs text-muted-foreground">
                      Usando tasa manual. API: 1 {originalCurrency} = {apiRate.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 6 })} {baseCurrency}
                    </p>
                  )}
                  {amountNum > 0 && baseEquivalent !== null && (
                    <p>
                      {fmt(amountNum, originalCurrency)} → {fmt(baseEquivalent, baseCurrency)}
                    </p>
                  )}
                </div>
              )}

              {!effectiveRate && !rateLoading && originalCurrency !== baseCurrency && (
                <p className="text-xs text-destructive">
                  Cotización no disponible. Ingresá una tasa manual o intentá de nuevo.
                </p>
              )}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
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
              <Label htmlFor="category">Categoría</Label>
              <Input
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="Comida"
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label>Tipo de reparto</Label>
            <Select
              value={splitType}
              onValueChange={(v) => v && setSplitType(v as 'EQUAL' | 'EXACT' | 'PERCENT')}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="EQUAL">Igualitario (EQUAL)</SelectItem>
                <SelectItem value="EXACT">Monto exacto (EXACT)</SelectItem>
                <SelectItem value="PERCENT">Porcentaje (PERCENT)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label>Pagadores</Label>
            {payers.map((payer, i) => {
              const selectedByOthers = payers
                .filter((_, j) => j !== i)
                .map(p => p.userId)
                .filter(Boolean);
              const available = participations.filter(
                p => !selectedByOthers.includes(p.userId)
              );
              return (
                <div key={i} className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <Select
                      value={payer.userId}
                      onValueChange={(v) => v && handlePayerChange(i, 'userId', v)}
                    >
                      <SelectTrigger className="flex-1">
                        <span className={!payer.userId ? 'text-muted-foreground' : ''}>
                          {payer.userId
                            ? (participations.find(p => p.userId === payer.userId)?.user?.name ?? 'Sin nombre')
                            : 'Quién pagó'
                          }
                        </span>
                      </SelectTrigger>
                      <SelectContent>
                        {available.map((p) => (
                          <SelectItem key={p.userId} value={p.userId}>
                            {p.user?.name ?? 'Sin nombre'}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="Monto"
                      className="w-28"
                      value={payer.amountPaid}
                      onChange={(e) => handlePayerChange(i, 'amountPaid', e.target.value)}
                    />
                    {payers.length > 1 && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive shrink-0"
                        onClick={() => handleRemovePayer(i)}
                      >
                        ×
                      </Button>
                    )}
                  </div>
                  {effectiveRate && payer.amountPaid && (
                    <p className="text-xs text-muted-foreground ml-1">
                      ≈ {fmt(Math.round(parseFloat(payer.amountPaid) * effectiveRate * 100) / 100, baseCurrency)}
                    </p>
                  )}
                </div>
              );
            })}
            <Button variant="outline" size="sm" onClick={handleAddPayer}>
              + Agregar pagador
            </Button>
          </div>

          {splitType === 'EQUAL' && (
            <div className="grid gap-2">
              <Label>Participantes del reparto</Label>
              <p className="text-xs text-muted-foreground">
                Seleccioná a quiénes incluir en la división igualitaria.
              </p>
              <div className="grid grid-cols-2 gap-1">
                {participations.map((p) => (
                  <label key={p.userId} className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={participantIds.includes(p.userId)}
                      onChange={() => handleToggleParticipant(p.userId)}
                      className="h-4 w-4"
                    />
                    {p.user?.name ?? 'Sin nombre'}
                  </label>
                ))}
              </div>
              {participantIds.length > 0 && amountNum > 0 && (
                <div className="rounded-md border bg-muted/40 p-2 text-sm">
                  {(() => {
                    const n = participantIds.length;
                    const perPersonOrig = Math.round((amountNum / n) * 100) / 100;
                    const perPersonBase = baseEquivalent !== null
                      ? Math.round((baseEquivalent / n) * 100) / 100
                      : null;
                    return (
                      <>
                        <p className="text-xs text-muted-foreground mb-1">Cada uno paga:</p>
                        <p className="font-medium">
                          {fmt(perPersonOrig, originalCurrency)}
                          {perPersonBase !== null && <> ({fmt(perPersonBase, baseCurrency)})</>}
                        </p>
                      </>
                    );
                  })()}
                </div>
              )}
            </div>
          )}

          {splitType === 'EXACT' && (
            <div className="grid gap-2">
              <Label>Montos exactos</Label>
              <p className="text-xs text-muted-foreground">
                Ingresá cuánto debe cada participante en {baseCurrency}.
                {effectiveRate && <> Equivalente en {originalCurrency} mostrado al lado.</>}
              </p>
              {participations.map((p) => {
                const share = exactShares.find((s) => s.userId === p.userId);
                const amountOwedNum = share?.amountOwed ? parseFloat(share.amountOwed) : 0;
                const originalEquiv = effectiveRate && amountOwedNum
                  ? Math.round((amountOwedNum / effectiveRate) * 100) / 100
                  : null;
                return (
                  <div key={p.userId} className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
                    <span className="text-sm">{p.user?.name ?? 'Sin nombre'}</span>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      className="w-28"
                      value={share?.amountOwed ?? ''}
                      onChange={(e) => handleExactChange(p.userId, e.target.value)}
                    />
                    <span className="text-xs text-muted-foreground">
                      {originalEquiv !== null && originalEquiv > 0
                        ? `≈ ${fmt(originalEquiv, originalCurrency)}`
                        : ''}
                    </span>
                  </div>
                );
              })}
            </div>
          )}

          {splitType === 'PERCENT' && (
            <div className="grid gap-2">
              <Label>Porcentajes</Label>
              <p className="text-xs text-muted-foreground">
                Ingresá el porcentaje que debe cada participante. Deben sumar 100%.
              </p>
              {participations.map((p) => {
                const share = percentShares.find((s) => s.userId === p.userId);
                const pct = share?.percent ? parseFloat(share.percent) : 0;
                const origAmt = amountNum && pct ? Math.round((amountNum * pct / 100) * 100) / 100 : null;
                const baseAmt = baseEquivalent !== null && pct ? Math.round((baseEquivalent * pct / 100) * 100) / 100 : null;
                return (
                  <div key={p.userId} className="flex items-center gap-2">
                    <span className="flex-1 text-sm">{p.user?.name ?? 'Sin nombre'}</span>
                    <Input
                      type="number"
                      step="0.1"
                      min="0"
                      max="100"
                      placeholder="0"
                      className="w-20"
                      value={share?.percent ?? ''}
                      onChange={(e) => handlePercentChange(p.userId, e.target.value)}
                    />
                    <span className="text-sm text-muted-foreground">%</span>
                    {origAmt !== null && pct > 0 && (
                      <span className="text-xs text-muted-foreground ml-1">
                        {fmt(origAmt, originalCurrency)}
                        {baseAmt !== null && <> ({fmt(baseAmt, baseCurrency)})</>}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          )}
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
            {mutation.isPending ? 'Creando...' : 'Crear gasto'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
