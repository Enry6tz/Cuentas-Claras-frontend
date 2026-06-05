'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Send, Loader2 } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SidebarInput } from '@/components/ui/sidebar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useTrips } from '@/hooks/querys/trips/useTrips';
import { useInvitationMutations } from '@/hooks/querys/invitations/useInvitationMutations';
import { searchUsers } from '@/services/api/users';

/**
 * Formulario compacto del pie del sidebar para invitar a alguien (por email)
 * a uno de tus viajes activos. Busca el usuario por email y le envía una
 * invitación como MEMBER; la persona se une al viaje cuando la acepta.
 */
export function SidebarAddTripForm() {
  const [email, setEmail] = useState('');
  const [tripId, setTripId] = useState('');
  const [searching, setSearching] = useState(false);

  const { data: trips = [] } = useTrips();
  const activeTrips = trips.filter((t) => t.status === 'ACTIVE');

  const { send } = useInvitationMutations(tripId);
  const busy = searching || send.isPending;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!tripId) {
      toast.error('Elegí un viaje');
      return;
    }
    const value = email.trim().toLowerCase();
    if (value.length < 3) {
      toast.error('Ingresá un email válido');
      return;
    }

    setSearching(true);
    try {
      const results = await searchUsers(value);
      const match =
        results.find((u) => u.email.toLowerCase() === value) ?? results[0];
      if (!match) {
        toast.error('No se encontró ningún usuario con ese email');
        return;
      }
      send.mutate(
        { userId: match.id, role: 'MEMBER' },
        { onSuccess: () => setEmail('') },
      );
    } catch {
      toast.error('No se pudo buscar el usuario');
    } finally {
      setSearching(false);
    }
  }

  return (
    <Card className="gap-2 py-4 shadow-none">
      <CardHeader className="px-4">
        <CardTitle className="text-sm">Invitar a un viaje</CardTitle>
        <CardDescription>
          Enviá una invitación por email a uno de tus viajes activos.
        </CardDescription>
      </CardHeader>
      <CardContent className="px-4">
        <form onSubmit={handleSubmit} className="grid gap-2.5">
          <Select
            items={activeTrips.map((t) => ({ value: t.id, label: t.name }))}
            value={tripId}
            onValueChange={(v) => setTripId(v ?? '')}
          >
            <SelectTrigger className="w-full" disabled={activeTrips.length === 0}>
              <SelectValue
                placeholder={activeTrips.length ? 'Elegí un viaje' : 'Sin viajes activos'}
              />
            </SelectTrigger>
            <SelectContent>
              {activeTrips.map((t) => (
                <SelectItem key={t.id} value={t.id}>
                  {t.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <SidebarInput
            type="email"
            placeholder="email@ejemplo.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Button
            type="submit"
            disabled={busy || activeTrips.length === 0}
            className="w-full bg-sidebar-primary text-sidebar-primary-foreground shadow-none"
          >
            {busy ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Send className="size-4" />
            )}
            Invitar
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
