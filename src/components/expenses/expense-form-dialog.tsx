'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { ArrowLeftRight, Plus, X } from 'lucide-react';
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
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PersonAvatar } from '@/components/shared/ui-bits';
import { DatePicker } from '@/components/shared/date-picker';
import { useCurrencyRate } from '@/hooks/querys/currency/useCurrencyRate';
import { useExpenseMutations } from '@/hooks/querys/expenses/useExpenseMutations';
import type { CreateExpensePayload, Participation } from '@/types';

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

  const { data: rateData, isLoading: rateLoading } = useCurrencyRate(
    originalCurrency,
    baseCurrency,
  );

  const apiRate = rateData?.rate ?? null;
  const manualRateNum = manualRate ? parseFloat(manualRate) : null;
  const effectiveRate = manualRateNum || apiRate;
  const amountNum = parseFloat(originalAmount) || 0;
  const baseEquivalent = effectiveRate && amountNum ? Math.round(amountNum * effectiveRate * 100) / 100 : null;

  const { create: mutation } = useExpenseMutations(tripId);

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

    mutation.mutate(payload, { onSuccess: () => onOpenChange(false) });
  }

  // Derivados para la fila de resumen del reparto.
  const equalPerPerson =
    participantIds.length > 0 && amountNum > 0
      ? Math.round((amountNum / participantIds.length) * 100) / 100
      : null;
  const exactSum = exactShares.reduce((s, x) => s + (parseFloat(x.amountOwed) || 0), 0);
  const percentSum = percentShares.reduce((s, x) => s + (parseFloat(x.percent) || 0), 0);

  // Mapa value→label para que el trigger del pagador muestre el nombre, no el UUID.
  const payerItems = participations.map((p) => ({
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
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Nuevo gasto</DialogTitle>
          <DialogDescription>
            Registrá un gasto y elegí cómo dividirlo entre los integrantes.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          {/* Descripción */}
          <div className="grid gap-2">
            <Label htmlFor="description">Descripción</Label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Cena de bienvenida"
            />
          </div>

          {/* Monto + Moneda */}
          <div className="grid grid-cols-[1fr_auto] gap-3">
            <div className="grid gap-2">
              <Label htmlFor="amount">Monto</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0.01"
                value={originalAmount}
                onChange={(e) => setOriginalAmount(e.target.value)}
                placeholder="0"
                className="text-right"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="currency">Moneda</Label>
              <Select value={originalCurrency} onValueChange={(v) => setOriginalCurrency(v ?? '')}>
                <SelectTrigger className="w-24">
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

          {/* Preview de conversión */}
          {originalCurrency !== baseCurrency && (
            <div className="space-y-2">
              {effectiveRate ? (
                <div className="flex items-start gap-2 rounded-lg border border-primary/10 bg-primary/5 p-3">
                  <ArrowLeftRight className="mt-0.5 size-4 shrink-0 text-primary" />
                  <div className="space-y-0.5">
                    <p className="text-sm">
                      <span className="font-medium">{fmt(amountNum, originalCurrency)}</span>{' '}
                      {baseEquivalent !== null && (
                        <span className="text-primary">→ {fmt(baseEquivalent, baseCurrency)}</span>
                      )}
                    </p>
                    {effectiveRate && (
                      <p className="text-xs text-muted-foreground">
                        Tasa de cambio: 1 {originalCurrency} ={' '}
                        {effectiveRate.toLocaleString('es-AR', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 6,
                        })}{' '}
                        {baseCurrency} · el reparto se calcula sobre el monto en moneda base.
                      </p>
                    )}
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
                  placeholder={`1 ${originalCurrency} = ? ${baseCurrency}`}
                />
              </div>
            </div>
          )}

          {/* Categoría + Fecha */}
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-2">
              <Label htmlFor="category">Categoría</Label>
              <Input
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="Comida"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="date">Fecha</Label>
              <DatePicker id="date" value={date} onChange={setDate} />
            </div>
          </div>

          {/* Tipo de división — segmented control */}
          <div className="grid gap-2">
            <Label>Tipo de división</Label>
            <Tabs
              value={splitType}
              onValueChange={(v) => v && setSplitType(v as 'EQUAL' | 'EXACT' | 'PERCENT')}
            >
              <TabsList className="w-full">
                <TabsTrigger value="EQUAL">Igual</TabsTrigger>
                <TabsTrigger value="EXACT">Exacto</TabsTrigger>
                <TabsTrigger value="PERCENT">Porcentaje</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Lista de participantes */}
          <div className="overflow-hidden rounded-lg border">
            <div className="divide-y">
              {participations.map((p) => {
                const name = p.user?.name ?? 'Sin nombre';

                if (splitType === 'EQUAL') {
                  const checked = participantIds.includes(p.userId);
                  return (
                    <label
                      key={p.userId}
                      className="flex cursor-pointer items-center gap-3 px-3 py-2.5"
                    >
                      <Checkbox
                        checked={checked}
                        onCheckedChange={() => handleToggleParticipant(p.userId)}
                      />
                      <PersonAvatar name={name} seed={p.userId} className="size-7" />
                      <span className="flex-1 text-sm text-foreground">{name}</span>
                      {checked && equalPerPerson !== null && (
                        <span className="text-sm text-muted-foreground tabular-nums">
                          {fmt(equalPerPerson, originalCurrency)}
                        </span>
                      )}
                    </label>
                  );
                }

                if (splitType === 'EXACT') {
                  const share = exactShares.find((s) => s.userId === p.userId);
                  return (
                    <div key={p.userId} className="flex items-center gap-3 px-3 py-2.5">
                      <PersonAvatar name={name} seed={p.userId} className="size-7" />
                      <span className="flex-1 text-sm text-foreground">{name}</span>
                      <span className="text-xs text-muted-foreground">{originalCurrency}</span>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0,00"
                        className="w-28 text-right"
                        value={share?.amountOwed ?? ''}
                        onChange={(e) => handleExactChange(p.userId, e.target.value)}
                      />
                    </div>
                  );
                }

                // PERCENT
                const share = percentShares.find((s) => s.userId === p.userId);
                const pct = share?.percent ? parseFloat(share.percent) : 0;
                const origAmt = amountNum && pct ? Math.round((amountNum * pct) / 100 * 100) / 100 : null;
                return (
                  <div key={p.userId} className="flex items-center gap-3 px-3 py-2.5">
                    <PersonAvatar name={name} seed={p.userId} className="size-7" />
                    <span className="flex-1 text-sm text-foreground">{name}</span>
                    <Input
                      type="number"
                      step="0.1"
                      min="0"
                      max="100"
                      placeholder="0"
                      className="w-20 text-right"
                      value={share?.percent ?? ''}
                      onChange={(e) => handlePercentChange(p.userId, e.target.value)}
                    />
                    <span className="text-sm text-muted-foreground">%</span>
                    {origAmt !== null && pct > 0 && (
                      <span className="w-24 text-right text-xs text-muted-foreground tabular-nums">
                        {fmt(origAmt, originalCurrency)}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Fila resumen */}
            <div className="flex items-center justify-between bg-muted/50 px-3 py-2.5 text-sm">
              {splitType === 'EQUAL' && (
                <>
                  <span className="text-muted-foreground">
                    {participantIds.length} integrantes · cada uno paga
                  </span>
                  <span className="font-semibold text-success tabular-nums">
                    {equalPerPerson !== null ? fmt(equalPerPerson, originalCurrency) : '—'}
                  </span>
                </>
              )}
              {splitType === 'EXACT' && (
                <>
                  <span className="text-muted-foreground">Suma asignada</span>
                  <span
                    className={`font-semibold tabular-nums ${
                      Math.abs(exactSum - amountNum) < 0.01 && amountNum > 0
                        ? 'text-success'
                        : 'text-foreground'
                    }`}
                  >
                    {fmt(exactSum, originalCurrency)}
                  </span>
                </>
              )}
              {splitType === 'PERCENT' && (
                <>
                  <span className="text-muted-foreground">Total asignado</span>
                  <span
                    className={`font-semibold tabular-nums ${
                      Math.abs(percentSum - 100) < 1 ? 'text-success' : 'text-foreground'
                    }`}
                  >
                    {percentSum.toLocaleString('es-AR', { maximumFractionDigits: 1 })}%
                  </span>
                </>
              )}
            </div>
          </div>

          {/* ¿Quién pagó? */}
          <div className="grid gap-2">
            <Label>¿Quién pagó?</Label>
            {payers.map((payer, i) => {
              const selectedByOthers = payers
                .filter((_, j) => j !== i)
                .map((p) => p.userId)
                .filter(Boolean);
              const available = participations.filter(
                (p) => !selectedByOthers.includes(p.userId),
              );
              return (
                <div key={i} className="flex items-center gap-2">
                  <Select
                    items={payerItems}
                    value={payer.userId}
                    onValueChange={(v) => v && handlePayerChange(i, 'userId', v)}
                  >
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Quién pagó" />
                    </SelectTrigger>
                    <SelectContent>
                      {available.map((p) => (
                        <SelectItem key={p.userId} value={p.userId}>
                          {p.user?.name ?? 'Sin nombre'}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <span className="text-xs text-muted-foreground">{originalCurrency}</span>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="Monto"
                    className="w-28 text-right"
                    value={payer.amountPaid}
                    onChange={(e) => handlePayerChange(i, 'amountPaid', e.target.value)}
                  />
                  {payers.length > 1 && (
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      className="shrink-0 text-muted-foreground hover:text-destructive"
                      onClick={() => handleRemovePayer(i)}
                    >
                      <X className="size-4" />
                    </Button>
                  )}
                </div>
              );
            })}
            <div>
              <Button variant="link" size="sm" className="h-auto px-0" onClick={handleAddPayer}>
                <Plus className="size-4" />
                Agregar pagador
              </Button>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={mutation.isPending}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={mutation.isPending}>
            {mutation.isPending ? 'Guardando...' : 'Guardar gasto'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
