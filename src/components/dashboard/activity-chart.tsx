'use client';

import { useRef, useState } from 'react';
import { toPng } from 'html-to-image';
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  XAxis,
  YAxis,
} from 'recharts';
import { Download, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from '@/components/ui/chart';
import {
  useActivitySummary,
  ACTIVITY_COLORS,
  balanceColor,
} from '@/hooks/use-activity-summary';

function money(n: number) {
  return n.toLocaleString('es-AR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function signed(n: number) {
  const s = money(Math.abs(n));
  return n < 0 ? `−${s}` : `+${s}`;
}

export function ActivityChart() {
  const captureRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);

  const { points, totalGastos, totalPagos, balance, maxAbs, isLoading, hasData } =
    useActivitySummary();

  const balColor = balanceColor(balance);
  const domain = maxAbs > 0 ? Math.ceil(maxAbs * 1.15) : 1;

  const chartConfig = {
    pagos: { label: 'Pagos (ingresos)', color: ACTIVITY_COLORS.pagos },
    gastos: { label: 'Gastos (egresos)', color: ACTIVITY_COLORS.gastos },
    balance: { label: 'Balance', color: balColor },
  } satisfies ChartConfig;

  async function downloadPng() {
    if (!captureRef.current) return;
    setDownloading(true);
    try {
      const dataUrl = await toPng(captureRef.current, {
        pixelRatio: 2,
        cacheBust: true,
      });
      const link = document.createElement('a');
      link.download = 'actividad-cuentas-claras.png';
      link.href = dataUrl;
      link.click();
    } catch {
      // Silencioso: si la captura falla, no rompemos la UI.
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-end">
        <Button
          variant="outline"
          size="sm"
          onClick={downloadPng}
          disabled={downloading || isLoading || !hasData}
        >
          {downloading ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Download className="size-4" />
          )}
          Descargar PNG
        </Button>
      </div>

      <div ref={captureRef} className="space-y-4 rounded-xl bg-card p-4">
        {/* Totales: egresos (rojo) · ingresos (verde) · balance (por signo) */}
        <div className="grid grid-cols-3 gap-2">
          <Total label="Gastos" value={-totalGastos} color={ACTIVITY_COLORS.gastos} />
          <Total label="Pagos" value={totalPagos} color={ACTIVITY_COLORS.pagos} />
          <Total label="Balance" value={balance} color={balColor} />
        </div>

        {isLoading ? (
          <div className="flex h-[300px] items-center justify-center text-sm text-muted-foreground">
            <Loader2 className="mr-2 size-4 animate-spin" />
            Cargando actividad…
          </div>
        ) : !hasData ? (
          <div className="flex h-[300px] items-center justify-center text-sm text-muted-foreground">
            Todavía no hay actividad para graficar.
          </div>
        ) : (
          <ChartContainer config={chartConfig} className="aspect-auto h-[320px] w-full">
            <LineChart
              accessibilityLayer
              data={points}
              margin={{ left: 4, right: 12, top: 8, bottom: 4 }}
            >
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={40}
                tickFormatter={(value) =>
                  new Date(value).toLocaleDateString('es-AR', {
                    day: '2-digit',
                    month: 'short',
                  })
                }
              />
              <YAxis
                domain={[-domain, domain]}
                tickLine={false}
                axisLine={false}
                width={52}
                tickFormatter={(value) =>
                  Intl.NumberFormat('es-AR', { notation: 'compact' }).format(value)
                }
              />
              {/* Línea de cero más gruesa: separa egresos (abajo) de ingresos (arriba) */}
              <ReferenceLine
                y={0}
                stroke="var(--muted-foreground)"
                strokeWidth={2}
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    className="w-[190px]"
                    labelFormatter={(value) =>
                      new Date(value as string).toLocaleDateString('es-AR', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })
                    }
                  />
                }
              />
              <ChartLegend content={<ChartLegendContent />} />
              <Line
                dataKey="pagos"
                type="monotone"
                stroke="var(--color-pagos)"
                strokeWidth={2}
                dot={{ r: 2.5, fill: 'var(--color-pagos)' }}
                activeDot={{ r: 5 }}
              />
              <Line
                dataKey="gastos"
                type="monotone"
                stroke="var(--color-gastos)"
                strokeWidth={2}
                dot={{ r: 2.5, fill: 'var(--color-gastos)' }}
                activeDot={{ r: 5 }}
              />
              <Line
                dataKey="balance"
                type="monotone"
                stroke="var(--color-balance)"
                strokeWidth={2.5}
                dot={{ r: 2.5, fill: 'var(--color-balance)' }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ChartContainer>
        )}
      </div>
    </div>
  );
}

function Total({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className="rounded-lg border bg-background px-3 py-2">
      <div className="flex items-center gap-1.5">
        <span className="size-2 rounded-full" style={{ backgroundColor: color }} />
        <span className="text-xs text-muted-foreground">{label}</span>
      </div>
      <p className="mt-0.5 text-lg font-bold tabular-nums" style={{ color }}>
        {signed(value)}
      </p>
    </div>
  );
}
