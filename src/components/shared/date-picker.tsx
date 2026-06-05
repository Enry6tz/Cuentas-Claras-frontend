'use client';

import { useState } from 'react';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

/** 'YYYY-MM-DD' → Date local (sin corrimiento por timezone). */
function toDate(value?: string): Date | undefined {
  if (!value) return undefined;
  const [y, m, d] = value.split('-').map(Number);
  if (!y || !m || !d) return undefined;
  return new Date(y, m - 1, d);
}

/** Date local → 'YYYY-MM-DD'. */
function toStr(date?: Date): string {
  if (!date) return '';
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

interface DatePickerProps {
  value: string;
  onChange: (value: string) => void;
  id?: string;
  placeholder?: string;
  className?: string;
}

/**
 * Selector de fecha con el Popover + Calendar de shadcn (en español).
 * Mantiene el mismo contrato que un <input type="date">: `value`/`onChange`
 * usan strings 'YYYY-MM-DD'.
 */
export function DatePicker({
  value,
  onChange,
  id,
  placeholder = 'Elegí una fecha',
  className,
}: DatePickerProps) {
  const [open, setOpen] = useState(false);
  const date = toDate(value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button
            id={id}
            type="button"
            variant="outline"
            className={cn(
              'w-full justify-start font-normal',
              !date && 'text-muted-foreground',
              className,
            )}
          >
            <CalendarIcon className="size-4 text-muted-foreground" />
            {date ? format(date, "d 'de' MMM, yyyy", { locale: es }) : placeholder}
          </Button>
        }
      />
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={date}
          defaultMonth={date}
          captionLayout="dropdown"
          startMonth={new Date(2015, 0)}
          endMonth={new Date(2035, 11)}
          locale={es}
          autoFocus
          onSelect={(d: Date | undefined) => {
            onChange(toStr(d));
            setOpen(false);
          }}
        />
      </PopoverContent>
    </Popover>
  );
}
