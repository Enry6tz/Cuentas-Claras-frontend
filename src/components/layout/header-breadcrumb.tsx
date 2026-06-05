'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { useTrip } from '@/hooks/querys/trips/useTrip';
import { tripIcon } from '@/lib/trip-appearance';

const SECTION_LABELS: Record<string, string> = {
  dashboard: 'Inicio',
  trips: 'Viajes',
  expenses: 'Gastos',
  payments: 'Pagos',
  invitations: 'Invitaciones',
  account: 'Cuenta',
  admin: 'Admin',
};

/**
 * Breadcrumb del header: refleja la sección actual y, en el detalle de un
 * viaje, su nombre. Así siempre se sabe dónde estás sin depender del título de
 * cada página.
 */
export function HeaderBreadcrumb() {
  const pathname = usePathname();
  const segments = pathname.split('/').filter(Boolean);
  const section = segments[0] ?? 'dashboard';
  const isTripDetail = section === 'trips' && !!segments[1];
  const tripId = isTripDetail ? segments[1] : undefined;

  const { data: trip } = useTrip(tripId);

  const sectionLabel = SECTION_LABELS[section] ?? 'Inicio';

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {isTripDetail ? (
          <>
            <BreadcrumbItem>
              <BreadcrumbLink render={<Link href="/trips" />}>
                {sectionLabel}
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage className="flex items-center gap-1.5 max-w-[40vw] truncate sm:max-w-xs">
                {trip && <span>{tripIcon(trip.iconId)}</span>}
                <span className="truncate">{trip?.name ?? 'Viaje'}</span>
              </BreadcrumbPage>
            </BreadcrumbItem>
          </>
        ) : (
          <BreadcrumbItem>
            <BreadcrumbPage className="font-medium">{sectionLabel}</BreadcrumbPage>
          </BreadcrumbItem>
        )}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
