'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { UserPlus, Loader2 } from 'lucide-react';
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
import { listTrips } from '@/lib/api/trips';
import { searchUsers } from '@/lib/api/users';
import { addParticipant } from '@/lib/api/participants';

/**
 * Formulario compacto del pie del sidebar para sumar a alguien (por email)
 * a uno de tus viajes activos. Reusa los endpoints existentes:
 * busca el usuario por email y lo agrega como participante del viaje elegido.
 */
export function SidebarAddTripForm() {
  const queryClient = useQueryClient();
  const [email, setEmail] = useState('');
  const [tripId, setTripId] = useState('');

  const { data: trips = [] } = useQuery({
    queryKey: ['trips'],
    queryFn: listTrips,
    staleTime: 60_000,
  });
  const activeTrips = trips.filter((t) => t.status === 'ACTIVE');

  const mutation = useMutation({
    mutationFn: async () => {
      const value = email.trim().toLowerCase();
      const results = await searchUsers(value);
      const match = results.find((u) => u.email.toLowerCase() === value) ?? results[0];
      if (!match) {
        throw new Error('NOT_FOUND');
      }
      return addParticipant(tripId, match.id);
    },
    onSuccess: () => {
      toast.success('Integrante agregado al viaje');
      queryClient.invalidateQueries({ queryKey: ['trips', tripId, 'participants'] });
      queryClient.invalidateQueries({ queryKey: ['trips', tripId] });
      setEmail('');
    },
    onError: (err: unknown) => {
      if (err instanceof Error && err.message === 'NOT_FOUND') {
        toast.error('No se encontró ningún usuario con ese email');
        return;
      }
      const status = (err as { response?: { status?: number } })?.response?.status;
      if (status === 409) toast.error('El usuario ya es integrante del viaje');
      else if (status === 404) toast.error('No se encontró ningún usuario con ese email');
      else if (status === 400) toast.error('El viaje está finalizado');
      else toast.error('No se pudo agregar el integrante');
    },
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!tripId) {
      toast.error('Elegí un viaje');
      return;
    }
    if (email.trim().length < 3) {
      toast.error('Ingresá un email válido');
      return;
    }
    mutation.mutate();
  }

  return (
    <Card className="gap-2 py-4 shadow-none">
      <CardHeader className="px-4">
        <CardTitle className="text-sm">Agregar a un viaje</CardTitle>
        <CardDescription>
          Sumá a alguien por su email a uno de tus viajes activos.
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
            disabled={mutation.isPending || activeTrips.length === 0}
            className="w-full bg-sidebar-primary text-sidebar-primary-foreground shadow-none"
          >
            {mutation.isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <UserPlus className="size-4" />
            )}
            Agregar
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
