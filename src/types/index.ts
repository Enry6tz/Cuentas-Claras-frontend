/**
 * Tipos TypeScript del dominio.
 *
 * Estos tipos describen lo que el backend devuelve. Importante: no son los
 * tipos de Prisma (esos viven en el backend). Son la "vista publica" para
 * el frontend, pensados para coincidir con el JSON serializado.
 *
 * Por ejemplo: en Prisma `createdAt` es Date, pero por JSON viaja como string
 * ISO. Por eso lo tipamos como `string` aca.
 */

export interface User {
  id: string;
  clerkId: string;
  email: string;
  name: string;
  avatarUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

// Subset de User cuando viene como participante (el back devuelve solo estos
// campos por seguridad — no exponemos clerkId ni timestamps).
export interface UserPublic {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
}

// Mantenemos en sync con el enum de Prisma del backend (`schema.prisma`).
export type TripStatus = 'ACTIVE' | 'FINALIZED';
export type ParticipationRole = 'CREATOR' | 'SUPERVISOR' | 'MEMBER';

export interface Participation {
  id: string;
  userId: string;
  tripId: string;
  role: ParticipationRole;
  currentBalance: string; // Decimal de Prisma -> string en JSON.
  joinedAt: string;
  user?: UserPublic; // viene cuando el back hace `include: { user: ... }`
}

export interface Trip {
  id: string;
  name: string;
  description: string | null;
  startDate: string | null;
  endDate: string | null;
  baseCurrency: string;
  status: TripStatus;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;

  // Relaciones que el back puede incluir segun el endpoint:
  participations?: Participation[];
  _count?: {
    participations: number;
    expenses: number;
  };
}

export interface ActivityItem {
  type: 'expense' | 'payment' | 'trip';
  description: string | null;
  amount: string;
  tripName: string;
  tripId: string;
  date: string;
}

// Todas las respuestas de la API vienen envueltas en { data: ... }
// (lo hace el TransformInterceptor global del backend en main.ts).
export interface ApiResponse<T> {
  data: T;
}
