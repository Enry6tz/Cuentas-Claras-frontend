'use client';

import { useEffect, useState } from 'react';
import { CreditCard } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { SearchBar } from '@/components/shared/search-bar';
import { Pagination } from '@/components/shared/pagination';
import { StaggerList, StaggerItem } from '@/components/motion/stagger';
import { NewInTripButton } from '@/components/trips/new-in-trip-button';
import { PaymentFormDialog } from '@/components/payments/payment-form-dialog';
import { MyPaymentRow } from '@/components/payments/my-payment-row';
import { useTrips } from '@/hooks/querys/trips/useTrips';
import { useMyPayments } from '@/hooks/querys/payments/useMyPayments';

const LIMIT = 10;
type RoleFilter = 'all' | 'debtor' | 'creditor';

export default function PaymentsPage() {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [tripFilter, setTripFilter] = useState('all');
  const [role, setRole] = useState<RoleFilter>('all');
  const [page, setPage] = useState(1);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 300);
    return () => clearTimeout(timer);
  }, [query]);

  const { data: trips = [] } = useTrips();

  const { data, isLoading, isError, isFetching } = useMyPayments({
    page,
    limit: LIMIT,
    q: debouncedQuery || undefined,
    tripId: tripFilter === 'all' ? undefined : tripFilter,
    role: role === 'all' ? undefined : role,
  });

  const items = data?.items ?? [];

  return (
    <div className="space-y-5">
      <Card className="py-3">
        <CardContent className="flex flex-col gap-3 px-3 sm:flex-row sm:items-center">
          <SearchBar
            value={query}
            onChange={(v) => {
              setQuery(v);
              setPage(1);
            }}
            placeholder="Buscar por nota…"
          />
          <Select
            value={tripFilter}
            onValueChange={(v) => {
              setTripFilter(v ?? 'all');
              setPage(1);
            }}
          >
            <SelectTrigger className="h-11 w-full sm:w-56">
              <SelectValue placeholder="Todos los viajes" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los viajes</SelectItem>
              {trips.map((t) => (
                <SelectItem key={t.id} value={t.id}>
                  {t.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <NewInTripButton
            label="Registrar pago"
            title="Registrar pago"
            description="Elegí en qué viaje registrar el pago."
            renderForm={(trip, open, onClose) => (
              <PaymentFormDialog
                open={open}
                onOpenChange={(o) => !o && onClose()}
                tripId={trip.id}
                participations={trip.participations ?? []}
                baseCurrency={trip.baseCurrency}
              />
            )}
          />
        </CardContent>
      </Card>

      <Tabs
        value={role}
        onValueChange={(v) => {
          if (!v) return;
          setRole(v as RoleFilter);
          setPage(1);
        }}
      >
        <TabsList>
          <TabsTrigger value="all">Todos</TabsTrigger>
          <TabsTrigger value="debtor">Pagué</TabsTrigger>
          <TabsTrigger value="creditor">Cobré</TabsTrigger>
        </TabsList>
      </Tabs>

      {isLoading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-[68px] animate-pulse rounded-xl border bg-muted/40" />
          ))}
        </div>
      )}

      {isError && (
        <Card>
          <CardContent className="py-12 text-center text-sm text-destructive">
            No se pudieron cargar los pagos. Reintentá en unos segundos.
          </CardContent>
        </Card>
      )}

      {!isLoading && !isError && items.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="rounded-full bg-muted p-4">
              <CreditCard className="size-8 text-muted-foreground" />
            </div>
            <h3 className="mt-5 text-lg font-semibold text-foreground">
              {debouncedQuery || tripFilter !== 'all' || role !== 'all'
                ? 'Sin resultados'
                : 'Todavía no hay pagos'}
            </h3>
            <p className="mt-2 max-w-sm text-sm text-muted-foreground">
              {debouncedQuery || tripFilter !== 'all' || role !== 'all'
                ? 'Probá con otros filtros.'
                : 'Registrá un pago en alguno de tus viajes para verlo acá.'}
            </p>
          </CardContent>
        </Card>
      )}

      {!isLoading && !isError && items.length > 0 && (
        <StaggerList
          className={`space-y-3 transition-opacity ${isFetching ? 'opacity-60' : ''}`}
        >
          {items.map((payment) => (
            <StaggerItem key={payment.id}>
              <MyPaymentRow payment={payment} />
            </StaggerItem>
          ))}
        </StaggerList>
      )}

      {data && data.total > 0 && (
        <Pagination
          page={data.page}
          limit={data.limit}
          total={data.total}
          hasMore={data.hasMore}
          onPageChange={setPage}
        />
      )}
    </div>
  );
}
